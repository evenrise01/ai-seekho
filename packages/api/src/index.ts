import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { feedRouter } from './routes/feed'
import { contentRouter } from './routes/content'
import { categoriesRouter } from './routes/categories'
import { collectionsRouter } from './routes/collections'
import { progressRouter } from './routes/progress'
import { eventsRouter } from './routes/events'
import { toolsRouter } from './routes/tools'
import { authMiddleware } from './middleware/auth'

const app = new Hono()

app.use('*', cors({
  origin: [
    'http://localhost:3000',
    process.env.WEB_APP_URL ?? '',
  ],
  credentials: true,
}))
app.use('*', logger())

import { writeFileSync } from 'fs'
app.onError((err, c) => {
  writeFileSync('error.log', err.stack || err.toString())
  console.error(err)
  return c.text('Internal Server Error', 500)
})

// Public routes
app.route('/feed', feedRouter)
app.route('/content', contentRouter)
app.route('/categories', categoriesRouter)
app.route('/tools', toolsRouter)
app.route('/events', eventsRouter)    // Fire-and-forget analytics

// Authenticated routes
app.use('/progress/*', authMiddleware)
app.route('/progress', progressRouter)

app.use('/collections/*', authMiddleware)
app.route('/collections', collectionsRouter)

app.get('/health', (c) => c.json({ ok: true }))

export default app
export type AppType = typeof app
