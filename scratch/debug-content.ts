import { db } from './packages/db/src/index'
import * as schema from './packages/db/src/schema'

async function main() {
  console.log('--- CONTENT ---')
  const content = await db.query.content.findMany()
  console.table(content.map(c => ({
    id: c.id,
    title: c.chapterTitle,
    status: c.status,
    videoStatus: c.videoStatus,
    isTrending: c.isTrending
  })))

  console.log('\n--- RAILS ---')
  const rails = await db.query.rails.findMany({
    with: {
      tiles: true
    }
  })
  console.table(rails.map(r => ({
    id: r.id,
    name: r.name,
    isVisible: r.isVisible,
    tileCount: r.tiles.length
  })))
}

main().catch(console.error)
