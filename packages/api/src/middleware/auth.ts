import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

export const authMiddleware = createMiddleware(async (c, next) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    ?? c.req.header('Cookie')?.match(/better-auth\.session_token=([^;]+)/)?.[1]

  if (!sessionToken) throw new HTTPException(401, { message: 'Unauthorized' })

  // Validate session against DB
  const { db, sessions, users, eq } = await import('@ai-seekho/db')

  const session = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, sessionToken))
    .limit(1)
    .then(r => r[0])

  if (!session || session.user === null) {
    throw new HTTPException(401, { message: 'Invalid session' })
  }

  c.set('user', session.user)
  await next()
})
