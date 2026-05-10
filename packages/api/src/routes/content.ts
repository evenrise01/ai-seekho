import { Hono } from 'hono'
import { db, content } from '@ai-seekho/db'
import { eq, and } from '@ai-seekho/db'

export const contentRouter = new Hono()

contentRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const item = await db.query.content.findFirst({
    where: and(eq(content.id, id), eq(content.status, 'published')),
    with: { categories: { with: { category: true } } },
  })
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

contentRouter.get('/:id/stream', async (c) => {
  const id = c.req.param('id')
  const item = await db.query.content.findFirst({
    where: and(eq(content.id, id), eq(content.status, 'published')),
    columns: { hlsUrl: true, bunnyVideoId: true, availableFree: true, availablePaid: true },
  })
  if (!item || !item.hlsUrl) return c.json({ error: 'Not found' }, 404)

  // Return HLS URL — Bunny.net token auth handled at CDN level
  return c.json({ hlsUrl: item.hlsUrl })
})
