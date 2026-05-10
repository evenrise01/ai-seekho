import withPWA from 'next-pwa'
import type { NextConfig } from 'next'

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // Next.js config
})

export default config
