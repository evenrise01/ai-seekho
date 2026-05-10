import { db, content, rails, railTiles } from '@ai-seekho/db'
import { eq, and } from '@ai-seekho/db'

export type ValidationResult = {
  success: boolean
  errors: string[]
  warnings: string[]
}

export async function prePublishSystemValidation(): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Fetch data for validation
  const allContent = await db.query.content.findMany({
    with: {
      categories: true,
      tiles: true,
    }
  })
  
  const allRails = await db.query.rails.findMany({
    with: {
      tiles: true
    }
  })

  // ── Section A: Content-Level ──────────────────────────────────────────────
  const publishedContent = allContent.filter(c => c.status === 'published')
  
  for (const item of publishedContent) {
    // Media Checks
    if (!item.bunnyVideoId) {
      errors.push(`Content "${item.title}" is published but missing a video file.`)
    }
    
    // Access Control
    if (!item.availableFree && !item.availablePaid) {
      errors.push(`Content "${item.title}" must be available to at least one user type.`)
    }

    // Rail Assignment
    if (item.tiles.length === 0) {
      errors.push(`Content "${item.title}" is published but not assigned to any rail.`)
    }
  }

  // ── Section B: Rail Management ─────────────────────────────────────────────
  const visibleRails = allRails.filter(r => r.isVisible)
  
  for (const rail of visibleRails) {
    if (rail.tiles.length === 0) {
      errors.push(`Rail "${rail.name}" is set to Visible but has 0 video tiles.`)
    }
    if (rail.tiles.length > 20) {
      warnings.push(`Rail "${rail.name}" has ${rail.tiles.length} tiles. Consider keeping it under 20 for performance.`)
    }
  }

  // Check for unique rail names (redundant but safe)
  const railNames = allRails.map(r => r.name)
  const duplicateNames = railNames.filter((name, index) => railNames.indexOf(name) !== index)
  if (duplicateNames.length > 0) {
    errors.push(`Duplicate rail names found: ${duplicateNames.join(', ')}`)
  }

  // ── Section C: Trending ────────────────────────────────────────────────────
  const trendingItems = publishedContent.filter(c => c.isTrending)
  if (trendingItems.length > 1) {
    errors.push('Multiple items are marked as Trending. Only one item can be trending at a time.')
  }
  
  if (trendingItems.length === 0) {
    warnings.push('No content is marked as Trending. The Trending tab will be hidden from users.')
  }

  // ── Section D: Pricing Plan (Placeholder for now) ──────────────────────────
  // TODO: Add pricing validation when pricing module is implemented

  return {
    success: errors.length === 0,
    errors,
    warnings
  }
}
