import { db, rails, railTiles, content } from '@ai-seekho/db'
import { eq, and, not, inArray } from '@ai-seekho/db'
import { requireAdminSession } from '@/lib/auth-helpers'
import { notFound } from 'next/navigation'
import { RailDetailsClient } from './client'

export const dynamic = 'force-dynamic'

export default async function RailDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession()
  const { id } = await params

  const rail = await db.query.rails.findFirst({
    where: eq(rails.id, id),
    with: {
      tiles: {
        orderBy: (rt, { asc }) => [asc(rt.sortOrder)],
        with: {
          content: {
            with: { tool: true }
          }
        }
      }
    }
  })

  // Format the rail tiles to match the client interface
  const formattedRail = {
    ...rail,
    tiles: rail?.tiles.map(t => ({
      ...t,
      content: {
        ...t.content,
        toolName: t.content.tool?.name || 'Unknown Tool'
      }
    }))
  }

  if (!rail) notFound()

  // Find content NOT in this rail to allow adding them
  const assignedContentIds = rail.tiles.map(t => t.contentId)
  
  const availableContent = await db.query.content.findMany({
    where: assignedContentIds.length > 0 ? not(inArray(content.id, assignedContentIds)) : undefined,
    orderBy: (c, { desc }) => [desc(c.createdAt)],
    with: { tool: true }
  })

  const formattedAvailable = availableContent.map(c => ({
    ...c,
    toolName: c.tool?.name || 'Unknown Tool'
  }))

  return (
    <div className="space-y-6">
      <RailDetailsClient 
        rail={formattedRail as any} 
        availableContent={formattedAvailable}
      />
    </div>
  )
}
