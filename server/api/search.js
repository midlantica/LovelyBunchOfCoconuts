// server/api/search.js
// This file is no longer needed with Nuxt Content v3
// Search is now handled directly in the useContentFeed.ts composable using queryContent

export default defineEventHandler(async (event) => {
  const { query } = getQuery(event)

  // Return empty results - this endpoint is deprecated
  // Search is now handled directly in the useContentFeed.ts composable
  return {
    claims: [],
    quotes: [],
    memes: [],
    totalClaims: 0,
    totalQuotes: 0,
    totalMemes: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    message:
      'This API endpoint is deprecated. Search is now handled directly via Nuxt Content v3.',
  }
})
