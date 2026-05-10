import { db } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { RailsClient } from './client'

export const dynamic = 'force-dynamic'

export default async function RailsPage() {
  await requireAdminSession()

  const allRails = await db.query.rails.findMany({
    orderBy: (r, { asc }) => [asc(r.sortOrder)],
    with: {
      tiles: {
        with: {
          content: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rail Management</h1>
          <p className="text-muted-foreground">
            Organize how content appears on the home page feed.
          </p>
        </div>
      </div>
      
      <RailsClient initialRails={allRails} />
    </div>
  )
}
