import { auth } from './auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in?redirect=/admin')
  if ((session.user as any).role !== 'admin') redirect('/')
  return session
}

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
