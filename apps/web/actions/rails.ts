'use server'

import { requireAdminSession } from '@/lib/auth-helpers'
import { db, rails, railTiles, railCategories, pendingChanges } from '@ai-seekho/db'
import { eq, asc, and } from '@ai-seekho/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { invalidateFeedCache } from '@/lib/cache'

const railSchema = z.object({
  name: z.string().min(1, 'Rail name is required').max(40, 'Name cannot exceed 40 characters'),
  isVisible: z.boolean(),
  categoryIds: z.array(z.string()).optional(),
})

export async function createRail(formData: FormData) {
  const session = await requireAdminSession()

  const parsed = railSchema.safeParse({
    name: formData.get('name'),
    isVisible: formData.get('isVisible') === 'true',
    categoryIds: formData.getAll('categoryIds'),
  })
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  // Check for uniqueness
  const existingName = await db.query.rails.findFirst({
    where: eq(rails.name, parsed.data.name),
  })
  if (existingName) return { success: false as const, error: { fieldErrors: { name: ['A rail with this name already exists.'] } } }

  // Visibility Rule: Cannot show a rail if it has 0 tiles
  // (During creation, tiles is always 0, so if they try to create a visible rail, we might want to warn or allow but then prevent global publish)
  // For now, let's allow creation but enforce the visibility check in updateRailStatus.

  // Get current max sortOrder
  const existingRails = await db.select({ sortOrder: rails.sortOrder }).from(rails)
  const maxOrder = existingRails.reduce((max, r) => Math.max(max, r.sortOrder), -1)

  const [newRail] = await db.insert(rails).values({
    name: parsed.data.name,
    isVisible: parsed.data.isVisible,
    sortOrder: maxOrder + 1,
  }).returning()

  if (!newRail) throw new Error('Failed to create rail')

  if (parsed.data.categoryIds?.length) {
    await db.insert(railCategories).values(
      parsed.data.categoryIds.map(cId => ({ railId: newRail.id, categoryId: cId }))
    )
  }

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: newRail.id,
    description: `New rail: ${newRail.name}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/rails')
  return { success: true as const, data: newRail }
}

export async function updateRailOrder(orderedIds: string[]) {
  const session = await requireAdminSession()

  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(rails)
      .set({ sortOrder: i })
      .where(eq(rails.id, orderedIds[i]!))
  }

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: 'bulk',
    description: 'Rail order updated',
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/rails')
  return { success: true as const }
}

export async function updateTileOrder(railId: string, orderedContentIds: string[]) {
  const session = await requireAdminSession()

  for (let i = 0; i < orderedContentIds.length; i++) {
    await db.update(railTiles)
      .set({ sortOrder: i })
      .where(eq(railTiles.contentId, orderedContentIds[i]!))
  }

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: railId,
    description: `Tile order updated in rail: ${railId}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath(`/admin/rails/${railId}`)
  return { success: true as const }
}

export async function assignTileToRail(railId: string, contentId: string) {
  const session = await requireAdminSession()

  const existing = await db.query.railTiles.findMany({
    where: eq(railTiles.railId, railId),
    columns: { sortOrder: true },
  })
  const maxOrder = existing.reduce((max, t) => Math.max(max, t.sortOrder), -1)

  await db.insert(railTiles).values({
    railId,
    contentId,
    sortOrder: maxOrder + 1,
  }).onConflictDoNothing()

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: railId,
    description: `Tile added to rail`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath(`/admin/rails/${railId}`)
  return { success: true as const }
}

export async function deleteRail(id: string) {
  const session = await requireAdminSession()

  // Tiles are cascade deleted; content is untouched
  await db.delete(rails).where(eq(rails.id, id))

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: id,
    description: `Rail deleted: ${id}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/rails')
  return { success: true as const }
}

export async function deleteRailTile(railId: string, contentId: string) {
  const session = await requireAdminSession()

  await db.delete(railTiles).where(
    and(
      eq(railTiles.railId, railId),
      eq(railTiles.contentId, contentId)
    )
  )

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: railId,
    description: `Tile removed from rail`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath(`/admin/rails/${railId}`)
  return { success: true as const }
}

export async function updateRailVisibility(id: string, isVisible: boolean) {
  const session = await requireAdminSession()

  await db.update(rails)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(rails.id, id))

  await db.insert(pendingChanges).values({
    module: 'rail',
    entityId: id,
    description: `Visibility changed to ${isVisible ? 'visible' : 'hidden'}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/rails')
  revalidatePath(`/admin/rails/${id}`)
  return { success: true as const }
}

