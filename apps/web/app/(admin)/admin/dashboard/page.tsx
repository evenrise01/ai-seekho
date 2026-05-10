import { db, content, rails, categories, analyticsEvents, users, pendingChanges } from '@ai-seekho/db'
import { count, eq, and, gte } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { DashboardClient } from './client'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  noStore()
  const session = await requireAdminSession()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Fetch all stats in parallel
  const [
    totalContentResult,
    publishedContentResult,
    draftContentResult,
    totalRailsResult,
    totalCategoriesResult,
    totalUsersResult,
    pendingChangesResult,
    recentContentList,
    viewsLast30Days,
    viewsLast7Days,
  ] = await Promise.all([
    db.select({ count: count() }).from(content),
    db.select({ count: count() }).from(content).where(eq(content.status, 'published')),
    db.select({ count: count() }).from(content).where(eq(content.status, 'draft')),
    db.select({ count: count() }).from(rails),
    db.select({ count: count() }).from(categories),
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(pendingChanges),
    db.query.content.findMany({
      orderBy: (c, { desc }) => [desc(c.createdAt)],
      limit: 5,
      with: { tool: true },
      columns: {
        id: true,
        chapterTitle: true,
        status: true,
        videoStatus: true,
        createdAt: true,
      },
    }),
    db.select({ count: count() }).from(analyticsEvents).where(
      gte(analyticsEvents.occurredAt, thirtyDaysAgo)
    ),
    db.select({ count: count() }).from(analyticsEvents).where(
      gte(analyticsEvents.occurredAt, sevenDaysAgo)
    ),
  ])

  const stats = {
    totalContent: Number(totalContentResult[0]?.count ?? 0),
    publishedContent: Number(publishedContentResult[0]?.count ?? 0),
    draftContent: Number(draftContentResult[0]?.count ?? 0),
    totalRails: Number(totalRailsResult[0]?.count ?? 0),
    totalCategories: Number(totalCategoriesResult[0]?.count ?? 0),
    totalUsers: Number(totalUsersResult[0]?.count ?? 0),
    pendingChanges: Number(pendingChangesResult[0]?.count ?? 0),
    viewsLast30Days: Number(viewsLast30Days[0]?.count ?? 0),
    viewsLast7Days: Number(viewsLast7Days[0]?.count ?? 0),
  }

  console.log(`[Dashboard] Stats Update: ${stats.publishedContent} Published, ${stats.draftContent} Draft`)

  const recentContent = recentContentList.map(c => ({
    ...c,
    toolName: c.tool?.name || 'Unknown',
    createdAt: c.createdAt.toISOString(),
  }))

  return <DashboardClient stats={stats} recentContent={recentContent} userName={(session.user as any).name ?? 'Admin'} />
}
