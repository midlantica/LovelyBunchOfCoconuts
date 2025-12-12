// Server API endpoint for ads
// Reads from the pre-built content-ads.json file
// This works in both development and production (Netlify)

import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Try multiple possible paths for the content-ads.json file
    const possiblePaths = [
      join(process.cwd(), 'public', 'content-ads.json'), // Dev
      join(process.cwd(), '.output', 'public', 'content-ads.json'), // Nuxt build
      join(process.cwd(), 'dist', 'content-ads.json'), // Netlify dist
      join(process.cwd(), 'content-ads.json'), // Root fallback
    ]

    console.log('🔍 Searching for content-ads.json in multiple locations...')
    console.log('Current working directory:', process.cwd())
    console.log('Environment:', {
      NETLIFY: process.env.NETLIFY,
      NODE_ENV: process.env.NODE_ENV,
    })

    let adsData = null
    let successPath = null

    // Try each path until we find the file
    for (const jsonPath of possiblePaths) {
      try {
        console.log('Trying path:', jsonPath)
        const fileContent = await readFile(jsonPath, 'utf-8')
        adsData = JSON.parse(fileContent)
        successPath = jsonPath
        console.log('✅ Found content-ads.json at:', jsonPath)
        break
      } catch (err) {
        console.log('❌ Not found at:', jsonPath, '-', err.message)
        continue
      }
    }

    if (adsData && Array.isArray(adsData)) {
      // Filter only active ads
      const activeAds = adsData.filter((ad) => ad.active !== false)

      console.log(
        `✅ Loaded ${activeAds.length} active ads from ${successPath}`
      )
      console.log(
        'Ad IDs:',
        activeAds.map((ad) => ad.id)
      )

      return {
        data: activeAds,
      }
    }

    // Fallback: return empty array if data is invalid or not found
    console.warn('⚠️ No valid ads data found in any location')
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
