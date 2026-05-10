'use server'

import { requireAdminSession } from '@/lib/auth-helpers'
import { db, tools, pendingChanges } from '@ai-seekho/db'
import { eq } from '@ai-seekho/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const toolSchema = z.object({
  name: z.string().min(1, 'Tool Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
})

export async function createTool(formData: FormData) {
  const session = await requireAdminSession()

  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
  }

  const parsed = toolSchema.safeParse(raw)
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  const [newTool] = await db.insert(tools).values({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    status: 'published',
  }).returning()

  if (!newTool) throw new Error('Failed to create tool')

  await db.insert(pendingChanges).values({
    module: 'tool',
    entityId: newTool.id,
    description: `New tool: ${newTool.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/tools')
  return { success: true as const, data: newTool }
}

export async function updateTool(id: string, formData: FormData) {
  const session = await requireAdminSession()

  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
  }

  const parsed = toolSchema.safeParse(raw)
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  await db.update(tools).set({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    updatedAt: new Date(),
  }).where(eq(tools.id, id))

  await db.insert(pendingChanges).values({
    module: 'tool',
    entityId: id,
    description: `Updated tool: ${parsed.data.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/tools')
  return { success: true as const }
}

export async function deleteTool(id: string) {
  await requireAdminSession()

  await db.delete(tools).where(eq(tools.id, id))

  revalidatePath('/admin/tools')
  return { success: true as const }
}

export async function getTools() {
  await requireAdminSession()
  return await db.query.tools.findMany({
    orderBy: (t, { asc }) => [asc(t.name)],
  })
}
