// Debug script to test content loading
import { queryCollection } from '@nuxt/content'

export async function debugContent() {
  try {
    console.log('=== DEBUGGING CONTENT ===')

    // Test fetching a few items from each collection
    const claims = await queryCollection('claims').limit(3).all()
    const quotes = await queryCollection('quotes').limit(3).all()
    const memes = await queryCollection('memes').limit(3).all()

    console.log(
      'Claims sample:',
      claims.map((c) => ({ title: c.title, path: c._path, id: c.id }))
    )
    console.log(
      'Quotes sample:',
      quotes.map((q) => ({ title: q.title, path: q._path, id: q.id }))
    )
    console.log(
      'Memes sample:',
      memes.map((m) => ({ title: m.title, path: m._path, id: m.id }))
    )

    // Test fetching a specific item
    if (claims.length > 0) {
      const firstClaim = claims[0]
      console.log('Trying to fetch first claim by path:', firstClaim._path)

      const refetchedClaim = await queryCollection('claims')
        .where({ _path: firstClaim._path })
        .first()

      console.log('Refetched claim:', refetchedClaim ? 'SUCCESS' : 'FAILED')
    }
  } catch (error) {
    console.error('Debug error:', error)
  }
}
