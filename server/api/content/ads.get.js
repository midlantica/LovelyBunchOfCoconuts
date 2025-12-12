// Server API endpoint for ads
// Reads from the pre-built content-ads.json file
// This works in both development and production (Netlify)

import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Read from the pre-built JSON file in the public directory
    // In production (Netlify), this file is in the dist folder
    // In development, it's in the public folder
    let jsonPath

    // Check if we're in production (Netlify) or development
    if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
      // Production: file is in dist/public or .output/public
      jsonPath = join(process.cwd(), '.output', 'public', 'content-ads.json')
      console.log('🔍 Production mode - looking for ads at:', jsonPath)
    } else {
      // Development: file is in public folder
      jsonPath = join(process.cwd(), 'public', 'content-ads.json')
      console.log('🔍 Development mode - looking for ads at:', jsonPath)
    }

    const fileContent = await readFile(jsonPath, 'utf-8')
    const adsData = JSON.parse(fileContent)

    if (adsData && Array.isArray(adsData)) {
      // Filter only active ads
      const activeAds = adsData.filter((ad) => ad.active !== false)

      console.log(
        `✅ Loaded ${activeAds.length} active ads from content-ads.json`
      )
      console.log(
        'Ad IDs:',
        activeAds.map((ad) => ad.id)
      )

      return {
        data: activeAds,
      }
    }

    // Fallback: return empty array if data is invalid
    console.warn('⚠️ Invalid ads data in content-ads.json')
    return {
      data: [],
    }
  } catch (error) {
    console.error('❌ Error fetching ads:', error.message)
    console.error('Error details:', error)
    // Return empty array instead of failing
    return {
      data: [],
    }
  }
})
