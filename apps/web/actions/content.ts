'use server'

import { requireAdminSession } from '@/lib/auth-helpers'
import { db, content, contentCategories, pendingChanges } from '@ai-seekho/db'
import { eq, and } from '@ai-seekho/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { invalidateFeedCache } from '@/lib/cache'
import { getBunnyUploadUrl, getBunnyVideo, buildHlsUrl, uploadToBunnyStorage } from '@/lib/bunny'

// ── Zod schemas ──────────────────────────────────────────────────────────────

const contentSchema = z.object({
  toolId: z.string().min(1, 'Tool selection is required'),
  chapterTitle: z.string().min(1, 'Chapter title is required').max(100),
  chapterOrder: z.number().int().min(0).default(0),
  description: z.string().min(1, 'Description is required').refine(
    (desc) => desc.trim().split(/\s+/).length <= 1000,
    { message: 'Description cannot exceed 1,000 words' }
  ),
  externalUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  categoryIds: z.array(z.string()).optional(),
  availableFree: z.boolean(),
  availablePaid: z.boolean(),
}).refine(
  data => data.availableFree || data.availablePaid,
  { 
    message: 'Content must be available to at least one user type (Free or Paid).',
    path: ['availableFree'] // Highlight the access control section
  }
)

// ── Get video upload URL (Bunny.net direct upload) ───────────────────────────

export async function getVideoUploadUrl(title: string) {
  await requireAdminSession()

  try {
    const result = await getBunnyUploadUrl(title)
    return {
      success: true as const,
      videoId: result.videoId,
      libraryId: result.libraryId,
      tusEndpoint: result.tusEndpoint,
      authSignature: result.authSignature,
      authExpire: result.authExpire,
    }
  } catch (error) {
    console.error('Bunny upload error:', error)
    return { success: false as const }
  }
}

// ── Create content record (called after video upload completes) ───────────────

export async function createContent(formData: FormData) {
  const session = await requireAdminSession()

  const raw = {
    toolId: formData.get('toolId') as string,
    chapterTitle: formData.get('chapterTitle') as string,
    chapterOrder: parseInt(formData.get('chapterOrder') as string || '0', 10),
    description: formData.get('description') as string,
    externalUrl: formData.get('externalUrl') as string,
    availableFree: formData.get('availableFree') === 'true',
    availablePaid: formData.get('availablePaid') === 'true',
    categoryIds: formData.getAll('categoryIds') as string[],
  }

  const parsed = contentSchema.safeParse(raw)
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  const bunnyVideoId = formData.get('bunnyVideoId') as string
  const smallThumbFile = formData.get('smallThumb') as File
  const heroThumbFile = formData.get('heroThumb') as File | null

  // 1. Upload thumbnails to Bunny Storage
  let smallThumbUrl = ''
  let heroThumbUrl = ''

  if (smallThumbFile) {
    const extension = smallThumbFile.name.split('.').pop()
    const path = `thumbnails/${bunnyVideoId}_small.${extension}`
    smallThumbUrl = await uploadToBunnyStorage(smallThumbFile, path)
  }

  if (heroThumbFile && heroThumbFile.size > 0) {
    const extension = heroThumbFile.name.split('.').pop()
    const path = `thumbnails/${bunnyVideoId}_hero.${extension}`
    heroThumbUrl = await uploadToBunnyStorage(heroThumbFile, path)
  }

  const [newContent] = await db.insert(content).values({
    toolId: parsed.data.toolId,
    chapterTitle: parsed.data.chapterTitle,
    chapterOrder: parsed.data.chapterOrder,
    description: parsed.data.description,
    externalUrl: parsed.data.externalUrl || null,
    smallThumbUrl,
    heroThumbUrl: heroThumbUrl || null,
    availableFree: parsed.data.availableFree,
    availablePaid: parsed.data.availablePaid,
    bunnyVideoId,
    videoStatus: 'processing',
    uploadedBy: session.user.id,
    status: 'draft',
  }).returning()

  if (!newContent) throw new Error('Failed to create content')

  // Link categories
  if (parsed.data.categoryIds?.length) {
    await db.insert(contentCategories).values(
      parsed.data.categoryIds.map(cId => ({ contentId: newContent.id, categoryId: cId }))
    )
  }

  // Log pending change
  await db.insert(pendingChanges).values({
    module: 'content',
    entityId: newContent.id,
    description: `New content chapter: ${newContent.chapterTitle}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/content')
  revalidatePath('/admin/dashboard')
  return { success: true as const, data: newContent }
}

// ── Update content metadata ──────────────────────────────────────────────────

export async function updateContent(id: string, formData: FormData) {
  const session = await requireAdminSession()

  const raw = {
    toolId: formData.get('toolId') as string,
    chapterTitle: formData.get('chapterTitle') as string,
    chapterOrder: parseInt(formData.get('chapterOrder') as string || '0', 10),
    description: formData.get('description') as string,
    externalUrl: formData.get('externalUrl') as string,
    availableFree: formData.get('availableFree') === 'true',
    availablePaid: formData.get('availablePaid') === 'true',
    categoryIds: formData.getAll('categoryIds') as string[],
  }

  const parsed = contentSchema.safeParse(raw)
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten() }

  const smallThumbFile = formData.get('smallThumb') as File | null
  const heroThumbFile = formData.get('heroThumb') as File | null

  // 1. Get existing content to get bunnyVideoId
  const existing = await db.query.content.findFirst({
    where: eq(content.id, id),
    columns: { bunnyVideoId: true }
  })
  if (!existing) throw new Error('Content not found')

  const updateData: any = {
    toolId: parsed.data.toolId,
    chapterTitle: parsed.data.chapterTitle,
    chapterOrder: parsed.data.chapterOrder,
    description: parsed.data.description,
    externalUrl: parsed.data.externalUrl || null,
    availableFree: parsed.data.availableFree,
    availablePaid: parsed.data.availablePaid,
    updatedAt: new Date(),
  }

  // 2. Upload new thumbnails if provided
  if (smallThumbFile && smallThumbFile.size > 0) {
    const extension = smallThumbFile.name.split('.').pop()
    const path = `thumbnails/${existing.bunnyVideoId}_small.${extension}`
    updateData.smallThumbUrl = await uploadToBunnyStorage(smallThumbFile, path)
  }

  if (heroThumbFile && heroThumbFile.size > 0) {
    const extension = heroThumbFile.name.split('.').pop()
    const path = `thumbnails/${existing.bunnyVideoId}_hero.${extension}`
    updateData.heroThumbUrl = await uploadToBunnyStorage(heroThumbFile, path)
  }

  // 3. Update core content
  await db.update(content).set(updateData).where(eq(content.id, id))

  // 4. Sync categories
  await db.delete(contentCategories).where(eq(contentCategories.contentId, id))
  if (parsed.data.categoryIds?.length) {
    await db.insert(contentCategories).values(
      parsed.data.categoryIds.map(cId => ({ contentId: id, categoryId: cId }))
    )
  }

  // 5. Log change
  await db.insert(pendingChanges).values({
    module: 'content',
    entityId: id,
    description: `Updated content chapter: ${parsed.data.chapterTitle}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/content')
  revalidatePath(`/admin/content/${id}/edit`)
  revalidatePath('/admin/dashboard')
  
  return { success: true as const }
}

// ── Set trending (atomic: clears all, sets one) ───────────────────────────────

// ── Set trending (atomic: clears all, sets one) ───────────────────────────────

export async function setTrending(contentId: string) {
  const session = await requireAdminSession()

  // Sequential updates (transaction not supported in neon-http)
  await db.update(content).set({ isTrending: false })
  await db.update(content).set({ isTrending: true }).where(eq(content.id, contentId))

  const item = await db.query.content.findFirst({
    where: eq(content.id, contentId),
    columns: { chapterTitle: true },
  })

  await db.insert(pendingChanges).values({
    module: 'content',
    entityId: contentId,
    description: `Trending set to: ${item?.chapterTitle}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/content')
  revalidatePath('/admin/trending')
  revalidatePath('/admin/dashboard')
  return { success: true as const }
}


// ── Archive content ───────────────────────────────────────────────────────────

export async function archiveContent(id: string) {
  const session = await requireAdminSession()

  await db.update(content)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(content.id, id))

  await db.insert(pendingChanges).values({
    module: 'content',
    entityId: id,
    description: `Archived content ID: ${id}`,
    createdBy: session.user.id,
  })

  revalidatePath('/admin/content')
  revalidatePath('/admin/dashboard')
  return { success: true as const }
}

// ── Update content status (draft → published) ─────────────────────────────────

export async function updateContentStatus(id: string, status: 'draft' | 'published' | 'archived') {
  const session = await requireAdminSession()

  const [item] = await db.update(content)
    .set({ status, updatedAt: new Date() })
    .where(eq(content.id, id))
    .returning()

  if (!item) throw new Error('Content not found')

  await db.insert(pendingChanges).values({
    module: 'content',
    entityId: id,
    description: `Status changed to ${status}: ${item.chapterTitle}`,
    createdBy: session.user.id,
  })

  await invalidateFeedCache()
  revalidatePath('/admin/content')
  revalidatePath('/admin/dashboard')
  return { success: true as const }
}

// ── Delete content ────────────────────────────────────────────────────────────

export async function deleteContent(id: string) {
  await requireAdminSession()

  await db.delete(contentCategories).where(eq(contentCategories.contentId, id))
  await db.delete(content).where(eq(content.id, id))

  revalidatePath('/admin/content')
  revalidatePath('/admin/dashboard')
  return { success: true as const }
}

// ── Sync video status manually ────────────────────────────────────────────────

export async function syncVideoStatus(contentId: string) {
  await requireAdminSession()

  const item = await db.query.content.findFirst({
    where: eq(content.id, contentId),
    columns: { id: true, bunnyVideoId: true, chapterTitle: true }
  })

  if (!item || !item.bunnyVideoId) throw new Error('Content or Video ID not found')

  const bunnyVideo = await getBunnyVideo(item.bunnyVideoId)
  
  // Bunny Stream Status: 4 = finished, 3 = ResolutionFinished (usually means ready)
  const isReady = bunnyVideo.status === 4 || bunnyVideo.status === 3
  
  if (isReady) {
    await db.update(content)
      .set({ 
        videoStatus: 'ready', 
        hlsUrl: buildHlsUrl(item.bunnyVideoId),
        videoDurationSecs: bunnyVideo.length,
        updatedAt: new Date() 
      })
      .where(eq(content.id, contentId))
    
    revalidatePath('/admin/content')
    return { success: true as const, status: 'ready' }
  }

  return { success: true as const, status: 'processing' }
}


