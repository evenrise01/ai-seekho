import { requireAdminSession } from '@/lib/auth-helpers'
import { db } from '@ai-seekho/db'
import NewContentClient from './client'

export default async function NewContentPage() {
  await requireAdminSession()
  const tools = await db.query.tools.findMany({
    orderBy: (t, { asc }) => [asc(t.name)],
  })

  return <NewContentClient tools={tools} />
}
