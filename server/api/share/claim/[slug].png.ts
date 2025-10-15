import { createCanvas } from '@napi-rs/canvas'
import type { H3Event } from 'h3'
import { slugify, wrapText } from '../../../utils/share'

const WIDTH = 1200
const HEIGHT = 630

async function fetchClaims(event: H3Event) {
  // @ts-ignore dynamic import for Nuxt Content server helper
  const { serverQueryContent } = await import('#content/server')
  return serverQueryContent(event).find()
}

async function getClaim(event: H3Event, rawSlug: string) {
  const norm = slugify(rawSlug)
  const all = await fetchClaims(event)
  return (
    all.find(
      (c: any) =>
        c?._path?.startsWith('/grifts/') &&
        slugify(c?.meta?.claim || c?.title || '') === norm
    ) || null
  )
}

// wrapText now imported from shared utils

export default defineEventHandler(async (event: H3Event) => {
  const slug = getRouterParam(event, 'slug') || ''
  if (!slug) {
    setResponseStatus(event, 400)
    return 'Missing slug'
  }

  const claim = await getClaim(event, slug)
  if (!claim) {
    setResponseStatus(event, 404)
    return 'Not found'
  }

  const claimText: string = String(claim.meta?.claim || claim.title || '')
  const translation: string = String(claim.meta?.translation || '')

  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
  wrapText(ctx, claimText, WIDTH / 2, HEIGHT / 2 - 60, WIDTH - 160, 64)

  if (translation) {
    ctx.fillStyle = '#68D2FF'
    ctx.font = '42px system-ui, -apple-system, sans-serif'
    wrapText(ctx, translation, WIDTH / 2, HEIGHT / 2 + 110, WIDTH - 180, 54)
  }

  ctx.fillStyle = '#94a3b8'
  ctx.font = '28px system-ui, -apple-system, sans-serif'
  ctx.fillText('WakeUpNPC.com', WIDTH / 2, HEIGHT - 45)

  const png = canvas.toBuffer('image/png')
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=86400'
  )
  return png
})
