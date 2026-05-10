import { task } from '@trigger.dev/sdk/v3'
import { db, content } from '@ai-seekho/db'
import { eq } from '@ai-seekho/db'
import { buildHlsUrl } from '../../lib/bunny'
import type { BunnyWebhookPayload } from '../../lib/bunny'

export const handleBunnyWebhook = task({
  id: 'bunny-webhook',
  run: async (payload: BunnyWebhookPayload) => {
    const { VideoGuid, Status } = payload

    if (Status === 3 || Status === 4) {
      // Video is ready (Finished or ResolutionFinished)
      await db.update(content)
        .set({
          videoStatus: 'ready',
          hlsUrl: buildHlsUrl(VideoGuid),
          updatedAt: new Date(),
        })
        .where(eq(content.bunnyVideoId, VideoGuid))
    } else if (Status === 5) {
      // Failed
      await db.update(content)
        .set({ videoStatus: 'error', updatedAt: new Date() })
        .where(eq(content.bunnyVideoId, VideoGuid))
    }
  },
})

export const onPublish = task({
  id: 'on-publish',
  run: async (payload: { platforms: string[]; changeCount: number }) => {
    // Purge Bunny.net CDN cache for the feed
    await fetch(
      `https://api.bunny.net/pullzone/${process.env.BUNNY_PULLZONE_ID}/purgeCache`,
      {
        method: 'POST',
        headers: { AccessKey: process.env.BUNNY_STORAGE_API_KEY! },
      }
    )
    // Future: send push notifications, update sitemaps, etc.
    console.log(`Published ${payload.changeCount} changes to ${payload.platforms.join(', ')}`)
  },
})
