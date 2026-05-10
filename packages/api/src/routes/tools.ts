import { Hono } from 'hono'
import { db, tools, content } from '@ai-seekho/db'
import { eq, and, asc } from '@ai-seekho/db'

export const toolsRouter = new Hono()

// Get tool by slug with chapters
toolsRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  const tool = await db.query.tools.findFirst({
    where: eq(tools.slug, slug),
    with: {
      chapters: {
        where: eq(content.status, 'published'),
        orderBy: [asc(content.chapterOrder)],
        columns: {
          id: true,
          chapterTitle: true,
          chapterOrder: true,
          description: true,
          smallThumbUrl: true,
          videoDurationSecs: true,
          availableFree: true,
          videoStatus: true
        }
      }
    }
  })

  if (!tool) return c.json({ error: 'Tool not found' }, 404)

  return c.json(tool)
})
