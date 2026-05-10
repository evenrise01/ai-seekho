import { createHash } from 'crypto'

const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY!
const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!
const CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!

const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY!
const STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME!
const STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com'
const STORAGE_CDN_HOSTNAME = process.env.BUNNY_STORAGE_CDN_HOSTNAME!

// Upload a file to Bunny.net Storage
export async function uploadToBunnyStorage(file: File | Buffer, path: string): Promise<string> {
  const url = `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE_NAME}/${path}`
  
  const body = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array(file)

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: STORAGE_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Bunny storage upload failed: ${res.status} ${errText}`)
  }

  // Return the public CDN URL
  return `https://${STORAGE_CDN_HOSTNAME}/${path}`
}

// Get a direct upload URL from Bunny.net Stream
export async function getBunnyUploadUrl(title: string): Promise<{
  videoId: string
  libraryId: string
  tusEndpoint: string
  authSignature: string
  authExpire: number
}> {
  // Step 1: Create video object in Bunny
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        AccessKey: BUNNY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    }
  )

  if (!createRes.ok) {
    const errText = await createRes.text()
    throw new Error(`Bunny create video failed: ${createRes.status} ${errText}`)
  }

  const video = await createRes.json()

  // Step 2: Generate TUS authorization
  // Bunny requires: SHA256(library_id + api_key + expiration_time + video_id)
  const expirationTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  const signaturePayload = `${LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${video.guid}`
  const signature = createHash('sha256').update(signaturePayload).digest('hex')

  return {
    videoId: video.guid,
    libraryId: LIBRARY_ID,
    tusEndpoint: 'https://video.bunnycdn.com/tusupload',
    authSignature: signature,
    authExpire: expirationTime,
  }
}

// Build HLS URL from Bunny video GUID
export function buildHlsUrl(videoId: string): string {
  return `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`
}

// Build thumbnail URL
export function buildThumbnailUrl(videoId: string): string {
  return `https://${CDN_HOSTNAME}/${videoId}/thumbnail.jpg`
}

// Fetch video details from Bunny.net
export async function getBunnyVideo(videoId: string) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_API_KEY,
        accept: 'application/json',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch video from Bunny: ${res.status}`)
  }

  return res.json()
}

// Bunny.net webhook payload type
export type BunnyWebhookPayload = {
  VideoLibraryId: number
  VideoGuid: string
  Status: number    // 3 = transcoding complete, 4 = error, 5 = ready
  Framerate: number
  Width: number
  Height: number
  StorageSize: number
}

