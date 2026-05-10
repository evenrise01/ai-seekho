// @ts-ignore
import { db, content } from '@ai-seekho/db'

async function checkContent() {
  const allContent = await db.select().from(content)
  console.log('--- Content Status ---')
  allContent.forEach((c: any) => {
    console.log(`ID: ${c.id}, Title: ${c.title}, Status: ${c.status}, VideoStatus: ${c.videoStatus}`)
  })
}

checkContent().catch(console.error)
