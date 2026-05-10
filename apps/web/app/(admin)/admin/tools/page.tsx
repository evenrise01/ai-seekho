import { requireAdminSession } from '@/lib/auth-helpers'
import { db } from '@ai-seekho/db'
import { ToolsClient } from './client'

export default async function ToolsPage() {
  await requireAdminSession()
  
  const allTools = await db.query.tools.findMany({
    orderBy: (t, { asc }) => [asc(t.name)],
  })

  return (
    <div className="space-y-6">
      <ToolsClient initialTools={allTools} />
    </div>
  )
}
