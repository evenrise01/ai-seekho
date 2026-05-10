import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  // Admin routes: require session + admin role check happens in layout
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in?redirect=/admin', request.url))
    }
  }

  // Consumer protected routes
  const consumerProtected = ['/profile', '/watch']
  if (consumerProtected.some(p => pathname.startsWith(p))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
