import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const CACHE_KEYS = {
  homeFeed: 'home:feed',
  trending: 'home:trending',
} as const

// Called by every Server Action that modifies consumer-visible data
export async function invalidateFeedCache() {
  await redis.del(CACHE_KEYS.homeFeed)
  await redis.del(CACHE_KEYS.trending)
}
