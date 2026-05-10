import { Hono } from 'hono'
import { db, analyticsEvents } from '@ai-seekho/db'
import { z } from 'zod'

const eventSchema = z.object({
  contentId: z.string(),
  userId: z.string().optional(),
  userPlan: z.enum(['free', 'paid']).optional(),
  eventType: z.enum(['impression', 'click', 'view_start', 'watch']),
  watchSecs: z.number().int().optional(),
})

export const eventsRouter = new Hono()

eventsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid payload' }, 400)

  // Insert without awaiting for true fire-and-forget behaviour
  db.insert(analyticsEvents).values({
    contentId: parsed.data.contentId,
    userId: parsed.data.userId ?? null,
    userPlan: parsed.data.userPlan ?? null,
    eventType: parsed.data.eventType,
    watchSecs: parsed.data.watchSecs ?? null,
  }).catch(console.error)

  return c.json({ ok: true })
})
