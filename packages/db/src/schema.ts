import {
  pgTable, pgEnum, text, boolean, integer, real,
  timestamp, json, primaryKey, index, uniqueIndex
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['consumer', 'admin'])
export const userPlanEnum = pgEnum('user_plan', ['free', 'paid'])
export const publishStatusEnum = pgEnum('publish_status', ['draft', 'published', 'archived'])
export const videoStatusEnum = pgEnum('video_status', ['uploading', 'processing', 'ready', 'error', 'unpublished'])
export const planStatusEnum = pgEnum('plan_status', ['draft', 'active', 'archived'])
export const eventTypeEnum = pgEnum('event_type', ['impression', 'click', 'view_start', 'watch'])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  phoneNumber: text('phone_number').unique(),
  name: text('name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  image: text('image'),
  role: userRoleEnum('role').notNull().default('consumer'),
  plan: userPlanEnum('plan').notNull().default('free'),
  
  // Onboarding Data
  goals: json('goals').$type<string[]>().default([]),
  persona: text('persona'),
  interests: json('interests').$type<string[]>().default([]), // Roles they want to learn
  gender: text('gender'),
  ageRange: text('age_range'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Collections ──────────────────────────────────────────────────────────────

export const collections = pgTable('collections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const collectionItems = pgTable('collection_items', {
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.collectionId, t.contentId] }),
}))

// ─── Social ───────────────────────────────────────────────────────────────────

export const userLikes = pgTable('user_likes', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.contentId] }),
}))

export const aiToolRequests = pgTable('ai_tool_requests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toolName: text('tool_name').notNull(),
  description: text('description'),
  imageUrls: json('image_urls').$type<string[]>().default([]),
  status: text('status').notNull().default('pending'), // pending, reviewed, added
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Better Auth required tables
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),          // Max 40 chars — enforce in Zod
  description: text('description'),               // Max 120 chars — enforce in Zod
  status: publishStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Rails ────────────────────────────────────────────────────────────────────

export const rails = pgTable('rails', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),          // Max 40 chars — enforce in Zod
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const railCategories = pgTable('rail_categories', {
  railId: text('rail_id').notNull().references(() => rails.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.railId, t.categoryId] }),
}))

// ─── Tools ────────────────────────────────────────────────────────────────────

export const tools = pgTable('tools', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),          // "ChatGPT", "Midjourney" etc.
  slug: text('slug').notNull().unique(),          // "chatgpt" — for URLs
  description: text('description'),
  logoUrl: text('logo_url'),
  status: publishStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Content ──────────────────────────────────────────────────────────────────

export const content = pgTable('content', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  toolId: text('tool_id').notNull().references(() => tools.id, { onDelete: 'cascade' }),
  chapterTitle: text('chapter_title').notNull(),                 // Max 100 chars
  chapterOrder: integer('chapter_order').notNull().default(0),
  description: text('description').notNull(),     // Max 1000 words
  externalUrl: text('external_url'),
  smallThumbUrl: text('small_thumb_url'),         // 160x220px WebP/JPEG ≤100KB
  heroThumbUrl: text('hero_thumb_url'),           // 1080x608px WebP/JPEG ≤500KB (optional)
  bunnyVideoId: text('bunny_video_id'),           // Bunny.net video GUID
  hlsUrl: text('hls_url'),                        // Bunny.net HLS manifest URL
  videoDurationSecs: integer('video_duration_secs'),
  videoStatus: videoStatusEnum('video_status').notNull().default('uploading'),
  availableFree: boolean('available_free').notNull().default(false),
  availablePaid: boolean('available_paid').notNull().default(true),
  isTrending: boolean('is_trending').notNull().default(false),
  status: publishStatusEnum('status').notNull().default('draft'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('content_status_idx').on(t.status),
  trendingIdx: index('content_trending_idx').on(t.isTrending),
}))

export const contentCategories = pgTable('content_categories', {
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.contentId, t.categoryId] }),
}))

// ─── Rail Tiles ───────────────────────────────────────────────────────────────

export const railTiles = pgTable('rail_tiles', {
  railId: text('rail_id').notNull().references(() => rails.id, { onDelete: 'cascade' }),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.railId, t.contentId] }),
}))

// ─── Pricing Plans ────────────────────────────────────────────────────────────

export const pricingPlans = pgTable('pricing_plans', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),                   // Max 30 chars
  description: text('description'),               // Max 80 chars
  monthlyPriceInr: real('monthly_price_inr'),
  quarterlyPriceInr: real('quarterly_price_inr'),
  yearlyPriceInr: real('yearly_price_inr'),
  monthlyEnabled: boolean('monthly_enabled').notNull().default(false),
  quarterlyEnabled: boolean('quarterly_enabled').notNull().default(false),
  yearlyEnabled: boolean('yearly_enabled').notNull().default(false),
  isMostPopular: boolean('is_most_popular').notNull().default(false),
  status: planStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Publish Ledger ───────────────────────────────────────────────────────────

export const pendingChanges = pgTable('pending_changes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  module: text('module').notNull(),               // 'content' | 'rail' | 'category' | 'pricing'
  entityId: text('entity_id').notNull(),
  description: text('description').notNull(),     // Human-readable change summary
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: text('created_by').notNull().references(() => users.id),
})

export const publishEvents = pgTable('publish_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  publishedBy: text('published_by').notNull().references(() => users.id),
  platforms: json('platforms').$type<string[]>().notNull(),
  changeLog: json('change_log').$type<Array<{ module: string; description: string }>>().notNull(),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
})

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  userPlan: userPlanEnum('user_plan'),
  eventType: eventTypeEnum('event_type').notNull(),
  watchSecs: integer('watch_secs'),               // Populated for 'watch' events only
  occurredAt: timestamp('occurred_at').notNull().defaultNow(),
}, (t) => ({
  contentEventIdx: index('analytics_content_event_idx').on(t.contentId, t.eventType, t.occurredAt),
  occurredAtIdx: index('analytics_occurred_at_idx').on(t.occurredAt),
}))

// ─── User Progress ────────────────────────────────────────────────────────────

export const userVideoProgress = pgTable('user_video_progress', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  watchedAt: timestamp('watched_at').notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.contentId] }),
}))

// ─── Relations ────────────────────────────────────────────────────────────────

import { relations } from 'drizzle-orm'

export const railsRelations = relations(rails, ({ many }) => ({
  tiles: many(railTiles),
  categories: many(railCategories),
}))

export const railTilesRelations = relations(railTiles, ({ one }) => ({
  rail: one(rails, {
    fields: [railTiles.railId],
    references: [rails.id],
  }),
  content: one(content, {
    fields: [railTiles.contentId],
    references: [content.id],
  }),
}))

export const toolsRelations = relations(tools, ({ many }) => ({
  chapters: many(content),
}))

export const contentRelations = relations(content, ({ one, many }) => ({
  tool: one(tools, {
    fields: [content.toolId],
    references: [tools.id],
  }),
  uploadedBy: one(users, {
    fields: [content.uploadedBy],
    references: [users.id],
  }),
  tiles: many(railTiles),
  categories: many(contentCategories),
  analytics: many(analyticsEvents),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  content: many(contentCategories),
  rails: many(railCategories),
}))

export const railCategoriesRelations = relations(railCategories, ({ one }) => ({
  rail: one(rails, {
    fields: [railCategories.railId],
    references: [rails.id],
  }),
  category: one(categories, {
    fields: [railCategories.categoryId],
    references: [categories.id],
  }),
}))

export const contentCategoriesRelations = relations(contentCategories, ({ one }) => ({
  content: one(content, {
    fields: [contentCategories.contentId],
    references: [content.id],
  }),
  category: one(categories, {
    fields: [contentCategories.categoryId],
    references: [categories.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  content: many(content),
  progress: many(userVideoProgress),
  analytics: many(analyticsEvents),
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))
