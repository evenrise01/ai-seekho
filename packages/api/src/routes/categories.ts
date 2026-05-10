import { Hono } from 'hono'
import { db, categories } from '@ai-seekho/db'
import { eq } from '@ai-seekho/db'

export const categoriesRouter = new Hono()

categoriesRouter.get('/', async (c) => {
  const publishedCategories = await db.query.categories.findMany({
    where: eq(categories.status, 'published'),
    columns: { id: true, name: true, description: true },
  })
  return c.json(publishedCategories)
})

categoriesRouter.get('/:id/content', async (c) => {
  const id = c.req.param('id')
  
  const categoryWithContent = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: {
      content: {
        with: {
          content: {
            with: {
              tool: true,
            },
            where: (content, { eq }) => eq(content.status, 'published'),
            columns: {
              id: true,
              chapterTitle: true,
              smallThumbUrl: true,
              videoDurationSecs: true,
              availableFree: true,
            }
          }
        }
      }
    }
  })

  if (!categoryWithContent) return c.json({ error: 'Category not found' }, 404)

  const formatted = {
    name: categoryWithContent.name,
    description: categoryWithContent.description,
    content: categoryWithContent.content.map(cc => ({
      ...cc.content,
      toolName: cc.content.tool?.name,
    }))
  }

  return c.json(formatted)
})
