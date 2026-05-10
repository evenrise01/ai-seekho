import { db } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { ContentLibraryClient } from './client'

export default async function ContentLibraryPage() {
  await requireAdminSession()

  const allContent = await db.query.content.findMany({
    orderBy: (c, { desc }) => [desc(c.createdAt)],
    with: {
      tool: true,
      categories: {
        with: {
          category: true
        }
      }
    }
  })

  // Format dates for client component
  const formattedContent = allContent.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    toolName: item.tool?.name || 'Unknown Tool',
    categories: item.categories.map(cc => cc.category.name)
  }))

  return (
    <div className="space-y-6">
      <ContentLibraryClient initialContent={formattedContent} />
    </div>
  )
}
