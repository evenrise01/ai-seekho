import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: "https://clear-aardvark-118571.upstash.io",
  token: "gQAAAAAAAc8rAAIgcDI5YTAyOTA3NmVlM2E0ZGE5OGRkY2Y3YzZhZDFiNzU2Mw",
})

async function main() {
  console.log('Cleaning cache...')
  await redis.del('home:feed')
  await redis.del('home:trending')
  console.log('Cache cleaned!')
}

main().catch(console.error)
