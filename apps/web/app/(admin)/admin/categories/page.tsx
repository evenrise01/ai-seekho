import { db, categories } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { CategoriesClient } from './categories-client'
import { desc } from '@ai-seekho/db'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  await requireAdminSession()

  const allCategories = await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
  })

  return (
    <div className="space-y-6">
      <CategoriesClient initialCategories={allCategories} />
    </div>
  )
}
