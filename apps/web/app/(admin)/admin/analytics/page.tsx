import { db, analyticsEvents, content } from '@ai-seekho/db'
import { eq, and, gte, lte, count, sum, drizzleSql as sql } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { AnalyticsDashboardClient } from './client'

export default async function AnalyticsPage(props: {
  searchParams?: Promise<{ from?: string; to?: string; userType?: string; railId?: string; categoryId?: string }>
}) {
  await requireAdminSession()

  const searchParams = await props.searchParams;

  const from = searchParams?.from ? new Date(searchParams.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const to = searchParams?.to ? new Date(searchParams.to) : new Date()

  // Summary metrics
  const metrics = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: count(),
    })
    .from(analyticsEvents)
    .where(and(
      gte(analyticsEvents.occurredAt, from),
      lte(analyticsEvents.occurredAt, to),
    ))
    .groupBy(analyticsEvents.eventType)

  // Per-content breakdown with watch-time buckets
  const contentMetrics = await db
    .select({
      contentId: analyticsEvents.contentId,
      eventType: analyticsEvents.eventType,
      count: count(),
      watchSecsLt10: sql<number>`COUNT(*) FILTER (WHERE ${analyticsEvents.watchSecs} < 10)`,
      watchSecs10to30: sql<number>`COUNT(*) FILTER (WHERE ${analyticsEvents.watchSecs} >= 10 AND ${analyticsEvents.watchSecs} < 30)`,
      watchSecs30to60: sql<number>`COUNT(*) FILTER (WHERE ${analyticsEvents.watchSecs} >= 30 AND ${analyticsEvents.watchSecs} < 60)`,
      watchSecsGt60: sql<number>`COUNT(*) FILTER (WHERE ${analyticsEvents.watchSecs} >= 60)`,
    })
    .from(analyticsEvents)
    .where(and(
      gte(analyticsEvents.occurredAt, from),
      lte(analyticsEvents.occurredAt, to),
    ))
    .groupBy(analyticsEvents.contentId, analyticsEvents.eventType)

  return <AnalyticsDashboardClient metrics={metrics} contentMetrics={contentMetrics} />
}
