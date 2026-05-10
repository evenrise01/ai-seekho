import { hc } from 'hono/client'
import type { AppType } from '@ai-seekho/api'

export const apiClient = hc<AppType>(
  process.env.NEXT_PUBLIC_HONO_API_URL ?? 'http://127.0.0.1:8787'
)
