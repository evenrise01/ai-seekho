import { Hono } from 'hono'
import { db, userVideoProgress } from '@ai-seekho/db'
import { eq } from '@ai-seekho/db'

export const progressRouter = new Hono<{ Variables: { user: any } }>()

progressRouter.get('/', async (c) => {
  const user = c.get('user')
  const progress = await db.query.userVideoProgress.findMany({
    where: eq(userVideoProgress.userId, user.id),
    columns: { contentId: true, watchedAt: true },
  })
  return c.json(progress)
})

progressRouter.post('/mark-watched', async (c) => {
  const user = c.get('user')
  const { contentId } = await c.req.json()

  await db.insert(userVideoProgress)
    .values({ userId: user.id, contentId })
    .onConflictDoNothing()

  return c.json({ ok: true })
})
