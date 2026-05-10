import { db, content } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { TrendingClient } from './trending-client'
import { desc } from '@ai-seekho/db'

export const dynamic = 'force-dynamic'

export default async function TrendingPage() {
  await requireAdminSession()

  const allContent = await db.query.content.findMany({
    orderBy: [desc(content.createdAt)],
    with: { tool: true },
    columns: {
      id: true,
      chapterTitle: true,
      isTrending: true,
      status: true,
      videoStatus: true,
    }
  })

  const formattedContent = allContent.map(c => ({
    ...c,
    toolName: c.tool?.name || 'Unknown Tool'
  }))

  return (
    <div className="space-y-6">
      <TrendingClient initialContent={formattedContent} />
    </div>
  )
}
