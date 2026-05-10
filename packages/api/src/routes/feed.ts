import { Hono } from 'hono'
import { db, rails, railTiles, content, railCategories } from '@ai-seekho/db'
import { eq, and, asc } from '@ai-seekho/db'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const FEED_CACHE_KEY = 'home:feed'
const FEED_CACHE_TTL = 60 * 60 * 24 * 7 // 7 days; invalidated on Publish

export const feedRouter = new Hono()

feedRouter.get('/', async (c) => {
  console.log('--- FEED REQUEST RECEIVED ---')
  // Try cache first
  const cached = await redis.get(FEED_CACHE_KEY)
  if (cached) return c.json(cached)

  // Fetch from DB
  const visibleRails = await db.query.rails.findMany({
    where: and(eq(rails.isVisible, true)),
    orderBy: asc(rails.sortOrder),
    with: {
      tiles: {
        orderBy: asc(railTiles.sortOrder),
        with: {
          content: {
            with: {
              tool: true,
            },
            columns: {
              id: true,
              chapterTitle: true,
              smallThumbUrl: true,
              videoDurationSecs: true,
              availableFree: true,
              availablePaid: true,
              isTrending: true,
              videoStatus: true,
              status: true,
            },
          },
        },
      },
    },
  })

  // Filter out rails with no ready content tiles
  const feed = visibleRails
    .map(rail => ({
      ...rail,
      tiles: (rail as any).tiles
        .filter((t: any) => t.content && t.content.status === 'published' && t.content.videoStatus === 'ready')
        .map((t: any) => ({
          ...t.content,
          toolName: t.content.tool?.name,
        })),
    }))
    .filter((rail: any) => rail.tiles.length > 0)

  await redis.set(FEED_CACHE_KEY, feed, { ex: FEED_CACHE_TTL })
  return c.json(feed)
})

feedRouter.get('/trending', async (c) => {
  const trendingItem = await db.query.content.findFirst({
    where: and(
      eq(content.isTrending, true),
      eq(content.status, 'published'),
    ),
    with: {
      tool: true,
    },
    columns: {
      id: true, chapterTitle: true, description: true,
      smallThumbUrl: true, heroThumbUrl: true, availableFree: true, availablePaid: true,
    },
  })

  if (!trendingItem) return c.json(null)
  return c.json({
    ...trendingItem,
    toolName: (trendingItem as any).tool?.name,
  })
})

feedRouter.get('/trending/all', async (c) => {
  const trendingItems = await db.query.content.findMany({
    where: and(
      eq(content.isTrending, true),
      eq(content.status, 'published'),
    ),
    with: {
      tool: true,
    },
    columns: {
      id: true, chapterTitle: true, description: true,
      smallThumbUrl: true, heroThumbUrl: true, videoDurationSecs: true,
      availableFree: true, availablePaid: true,
    },
  })

  return c.json(trendingItems.map(item => ({
    ...item,
    toolName: (item as any).tool?.name,
  })))
})
