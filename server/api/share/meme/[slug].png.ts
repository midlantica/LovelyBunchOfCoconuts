import { createCanvas, loadImage } from '@napi-rs/canvas'
import type { H3Event } from 'h3'
import { slugify } from '../../../utils/share'

async function fetchMemes(event: H3Event) {
  // @ts-ignore dynamic import
  const { serverQueryContent } = await import('#content/server')
  return serverQueryContent(event).find()
}

export default defineEventHandler(async (event: H3Event) => {
  const slug = getRouterParam(event, 'slug') || ''
  if (!slug) {
    setResponseStatus(event, 400)
    return 'Missing slug'
  }
  const all = await fetchMemes(event)
  const meme = all?.find(
    (m: any) =>
      m?._path?.startsWith('/memes/') &&
      slugify(m.title || m.description || '') === slug.toLowerCase()
  )
  if (!meme) {
    setResponseStatus(event, 404)
    return 'Not found'
  }
  const canvas = createCanvas(1200, 630)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, 1200, 630)
  const imgPath = meme.image || meme.images?.[0]
  if (imgPath) {
    try {
      const runtimeConfig = useRuntimeConfig()
      const base = runtimeConfig.public.siteUrl || 'http://localhost:3000'
      const abs = imgPath.startsWith('http') ? imgPath : base + imgPath
      const img = await loadImage(abs)
      const scale = Math.min(1100 / img.width, 500 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (1200 - w) / 2
      const y = (630 - h) / 2 - 20
      ctx.drawImage(img, x, y, w, h)
    } catch (e) {
      // ignore image load failure
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 630 - 110, 1200, 110)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const text = meme.title || meme.description || ''
  ctx.fillText(text.substring(0, 100), 600, 630 - 60)
  ctx.fillStyle = '#68D2FF'
  ctx.font = '26px system-ui, -apple-system, sans-serif'
  ctx.fillText('LovelyBunchOfCoconuts.com', 600, 630 - 25)
  const png = canvas.toBuffer('image/png')
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Cache-Control',
    'public, max-age=1800, stale-while-revalidate=86400'
  )
  return png
})
