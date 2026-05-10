'use server'

import { requireAdminSession } from '@/lib/auth-helpers'
import { db, pendingChanges, publishEvents } from '@ai-seekho/db'
import { revalidatePath } from 'next/cache'
import { invalidateFeedCache } from '@/lib/cache'
import { tasks } from '@trigger.dev/sdk/v3'

export async function getPendingChanges() {
  await requireAdminSession()
  return db.query.pendingChanges.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
}

export async function executePublish(platforms: string[]) {
  const session = await requireAdminSession()

  const changes = await db.query.pendingChanges.findMany()
  if (changes.length === 0) return { success: false as const, error: 'No pending changes.' }

  // Write publish event
  await db.insert(publishEvents).values({
    publishedBy: session.user.id,
    platforms,
    changeLog: changes.map(c => ({ module: c.module, description: c.description })),
  })

  // Clear all pending changes
  await db.delete(pendingChanges)

  // Invalidate all consumer caches
  await invalidateFeedCache()

  // Trigger background jobs (CDN cache purge, notifications)
  await tasks.trigger('on-publish', { platforms, changeCount: changes.length })

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
  return { success: true as const, publishedCount: changes.length }
}
