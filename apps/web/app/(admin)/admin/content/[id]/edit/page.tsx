import { db, content, categories } from '@ai-seekho/db'
import { eq } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { EditContentClient } from './edit-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession()
  const { id } = await params

  const item = await db.query.content.findFirst({
    where: eq(content.id, id),
    with: {
      categories: {
        with: {
          category: true
        }
      }
    }
  })

  if (!item) notFound()

  const allCategories = await db.query.categories.findMany({
    where: (c, { eq }) => eq(c.status, 'published')
  })

  const allTools = await db.query.tools.findMany({
    orderBy: (t, { asc }) => [asc(t.name)]
  })

  // Format data for client
  const initialData = {
    ...item,
    categoryIds: item.categories.map(c => c.categoryId)
  }

  return (
    <div className="space-y-6">
      <EditContentClient initialData={initialData} allCategories={allCategories} allTools={allTools} />
    </div>
  )
}
