import { db, analyticsEvents } from '@ai-seekho/db'
import { gte, lte, and } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')

  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const to = toStr ? new Date(toStr) : new Date()

  const events = await db.query.analyticsEvents.findMany({
    where: and(
      gte(analyticsEvents.occurredAt, from),
      lte(analyticsEvents.occurredAt, to),
    ),
    orderBy: (t, { desc }) => [desc(t.occurredAt)]
  })

  // Generate CSV string
  const headers = ['ID', 'Content ID', 'User ID', 'User Plan', 'Event Type', 'Watch Secs', 'Occurred At']
  const rows = events.map(e => [
    e.id,
    e.contentId,
    e.userId || '',
    e.userPlan || '',
    e.eventType,
    e.watchSecs?.toString() || '',
    e.occurredAt.toISOString()
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
