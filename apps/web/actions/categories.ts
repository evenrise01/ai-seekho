'use server'

import { requireAdminSession } from '@/lib/auth-helpers'
import { db, categories, pendingChanges } from '@ai-seekho/db'
import { eq } from '@ai-seekho/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string().max(120).optional(),
})

export async function createCategory(formData: FormData) {
  const session = await requireAdminSession()

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  const [newCat] = await db.insert(categories).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    status: 'draft',
  }).returning()

  if (!newCat) throw new Error('Failed to create category')

  await db.insert(pendingChanges).values({
    module: 'category',
    entityId: newCat.id,
    description: `New category: ${newCat.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/categories')
  revalidatePath('/admin/dashboard')
  return { success: true as const, data: newCat }
}

export async function publishCategory(id: string) {
  const session = await requireAdminSession()

  const [cat] = await db.update(categories)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()

  if (!cat) throw new Error('Category not found')

  await db.insert(pendingChanges).values({
    module: 'category',
    entityId: id,
    description: `Category published: ${cat.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/categories')
  revalidatePath('/admin/dashboard')
  return { success: true as const }
}

export async function archiveCategory(id: string) {
  const session = await requireAdminSession()

  const [cat] = await db.update(categories)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()

  if (!cat) throw new Error('Category not found')

  await db.insert(pendingChanges).values({
    module: 'category',
    entityId: id,
    description: `Category archived: ${cat.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/categories')
  revalidatePath('/admin/dashboard')
  return { success: true as const }
}

