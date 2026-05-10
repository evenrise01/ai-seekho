'use client' // Wait, this is API, no 'use client'

import { Hono } from 'hono'
import { db, collections, collectionItems, content, tools } from '@ai-seekho/db'
import { eq, and, desc } from '@ai-seekho/db'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const collectionsRouter = new Hono<{ Variables: { user: any } }>()

// Get all collections for user
collectionsRouter.get('/', async (c) => {
  const user = c.get('user')
  
  const userCollections = await db.query.collections.findMany({
    where: eq(collections.userId, user.id),
    with: {
      items: {
        with: {
          content: {
            with: { tool: true },
            columns: { id: true, chapterTitle: true, smallThumbUrl: true }
          }
        }
      }
    },
    orderBy: [desc(collections.createdAt)]
  })

  return c.json(userCollections)
})

// Create new collection
collectionsRouter.post('/', zValidator('json', z.object({
  name: z.string().min(1).max(50)
})), async (c) => {
  const user = c.get('user')
  const { name } = c.req.valid('json')

  const [newCollection] = await db.insert(collections).values({
    userId: user.id,
    name
  }).returning()

  return c.json(newCollection)
})

// Delete collection
collectionsRouter.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  await db.delete(collections).where(and(
    eq(collections.id, id),
    eq(collections.userId, user.id)
  ))

  return c.json({ success: true })
})

// Add item to collection
collectionsRouter.post('/:id/items', zValidator('json', z.object({
  contentId: z.string()
})), async (c) => {
  const user = c.get('user')
  const collectionId = c.req.param('id')
  const { contentId } = c.req.valid('json')

  // Verify ownership
  const col = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, user.id))
  })
  if (!col) return c.json({ error: 'Collection not found' }, 404)

  await db.insert(collectionItems).values({
    collectionId,
    contentId
  }).onConflictDoNothing()

  return c.json({ success: true })
})

// Remove item from collection
collectionsRouter.delete('/:id/items/:contentId', async (c) => {
  const user = c.get('user')
  const collectionId = c.req.param('id')
  const contentId = c.req.param('contentId')

  // Verify ownership
  const col = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, user.id))
  })
  if (!col) return c.json({ error: 'Collection not found' }, 404)

  await db.delete(collectionItems).where(and(
    eq(collectionItems.collectionId, collectionId),
    eq(collectionItems.contentId, contentId)
  ))

  return c.json({ success: true })
})
