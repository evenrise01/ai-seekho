import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
export * from './schema'
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
export { eq, and, or, not, asc, desc, inArray, notInArray, isNull, isNotNull, count, sum, sql as drizzleSql, gte, lte } from 'drizzle-orm'
