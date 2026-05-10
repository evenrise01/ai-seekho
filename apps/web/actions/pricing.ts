'use server'

import { requireAdminSession } from '@/lib/auth-helpers'
import { db, pricingPlans, pendingChanges } from '@ai-seekho/db'
import { eq, and } from '@ai-seekho/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const planSchema = z.object({
  name: z.string().min(1).max(30),
  description: z.string().max(80).optional(),
  monthlyPriceInr: z.coerce.number().positive().optional(),
  quarterlyPriceInr: z.coerce.number().positive().optional(),
  yearlyPriceInr: z.coerce.number().positive().optional(),
  monthlyEnabled: z.boolean(),
  quarterlyEnabled: z.boolean(),
  yearlyEnabled: z.boolean(),
  isMostPopular: z.boolean(),
}).refine(
  data => data.monthlyEnabled || data.quarterlyEnabled || data.yearlyEnabled,
  { message: 'At least one billing interval must be enabled.' }
).refine(
  data => !data.monthlyEnabled || data.monthlyPriceInr != null,
  { message: 'Please enter a price for the enabled monthly billing interval.' }
).refine(
  data => !data.quarterlyEnabled || data.quarterlyPriceInr != null,
  { message: 'Please enter a price for the enabled quarterly billing interval.' }
).refine(
  data => !data.yearlyEnabled || data.yearlyPriceInr != null,
  { message: 'Please enter a price for the enabled yearly billing interval.' }
)

export async function upsertPlan(id: string | null, formData: FormData) {
  const session = await requireAdminSession()

  const parsed = planSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    monthlyPriceInr: formData.get('monthlyPriceInr') || undefined,
    quarterlyPriceInr: formData.get('quarterlyPriceInr') || undefined,
    yearlyPriceInr: formData.get('yearlyPriceInr') || undefined,
    monthlyEnabled: formData.get('monthlyEnabled') === 'true',
    quarterlyEnabled: formData.get('quarterlyEnabled') === 'true',
    yearlyEnabled: formData.get('yearlyEnabled') === 'true',
    isMostPopular: formData.get('isMostPopular') === 'true',
  })
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  // Check active plan limit (max 2)
  const activePlans = await db.query.pricingPlans.findMany({
    where: eq(pricingPlans.status, 'active'),
    columns: { id: true },
  })
  const isCurrentlyActive = id
    ? activePlans.some(p => p.id === id)
    : false
  const wouldExceedLimit = !isCurrentlyActive && activePlans.length >= 2

  let plan
  if (id) {
    const [updated] = await db.update(pricingPlans)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(pricingPlans.id, id))
      .returning()
    if (!updated) throw new Error('Failed to update plan')
    plan = updated
  } else {
    const [created] = await db.insert(pricingPlans)
      .values({ ...parsed.data, status: 'draft' })
      .returning()
    if (!created) throw new Error('Failed to create plan')
    plan = created
  }

  await db.insert(pendingChanges).values({
    module: 'pricing',
    entityId: plan.id,
    description: `${id ? 'Updated' : 'Created'} plan: ${plan.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/pricing')
  return { success: true as const, data: plan, warning: wouldExceedLimit ? 'Max 2 active plans allowed — set status to Draft.' : undefined }
}

export async function activatePlan(id: string) {
  const session = await requireAdminSession()

  const activePlans = await db.query.pricingPlans.findMany({
    where: eq(pricingPlans.status, 'active'),
    columns: { id: true },
  })
  if (activePlans.length >= 2 && !activePlans.some(p => p.id === id)) {
    return { success: false as const, error: 'Maximum 2 active plans allowed. Archive one first.' }
  }

  const [plan] = await db.update(pricingPlans)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(pricingPlans.id, id))
    .returning()

  if (!plan) throw new Error('Plan not found')

  await db.insert(pendingChanges).values({
    module: 'pricing',
    entityId: id,
    description: `Plan activated: ${plan.name}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/pricing')
  return { success: true as const }
}
