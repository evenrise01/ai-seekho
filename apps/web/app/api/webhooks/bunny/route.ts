import { NextRequest, NextResponse } from 'next/server'
import { tasks } from '@trigger.dev/sdk/v3'
import type { BunnyWebhookPayload } from '@/lib/bunny'
import { createHmac, timingSafeEqual } from 'crypto'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('X-BunnyStream-Signature')
  const version = req.headers.get('X-BunnyStream-Signature-Version')
  const algorithm = req.headers.get('X-BunnyStream-Signature-Algorithm')
  const secret = process.env.BUNNY_READ_ONLY_API_KEY

  if (!signature || !secret || version !== 'v1' || algorithm !== 'hmac-sha256') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get raw body for verification
  const rawBody = await req.text()
  
  const expectedSignature = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  // Constant-time comparison
  const isAuthentic = timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  )

  if (!isAuthentic) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  const payload: BunnyWebhookPayload = JSON.parse(rawBody)
  await tasks.trigger('bunny-webhook', payload)

  return NextResponse.json({ ok: true })
}
