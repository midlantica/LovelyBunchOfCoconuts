import { promises as fs } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  try {
    // Read markdown files directly from content/ads folder
    const adsDir = join(process.cwd(), 'content', 'ads')
    const files = await fs.readdir(adsDir)

    // Filter for markdown files only (exclude README files)
    const mdFiles = files.filter(
      (file) =>
        file.endsWith('.md') &&
        !file.toLowerCase().includes('readme') &&
        !file.startsWith('_')
    )

    // Parse each markdown file
    const ads = []
    for (const file of mdFiles) {
      const filePath = join(adsDir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const parsed = matter(content)
      const slug = file.replace('.md', '')

      // Map old size values to new ones
      let size = parsed.data.size || 'square'
      if (size === 'small') size = 'square'
      if (size === 'large') size = 'horizontal'

      ads.push({
        id: parsed.data.id || slug,
        title: parsed.data.title || 'Advertisement',
        type: parsed.data.type || 'claim',
        size: size,
        advertiser: parsed.data.advertiser || 'Demo Advertiser',
        campaign: parsed.data.campaign || 'Test Campaign',
        link: parsed.data.link || '#',
        image: parsed.data.image || `/ads/${slug}.png`,
        frequency: parsed.data.frequency || 10,
        active: parsed.data.active !== false,
        _path: `/ads/${slug}`,
      })
    }

    // Filter only active ads
    const activeAds = ads.filter((ad) => ad.active !== false)

    console.log(
      `Loaded ${activeAds.length} active ads directly from markdown files`
    )

    return {
      data: activeAds,
    }
  } catch (error) {
    console.error('Error fetching ads:', error)
    return {
      data: [],
    }
  }
})
