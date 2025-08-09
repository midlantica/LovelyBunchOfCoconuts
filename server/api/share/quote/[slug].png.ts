import { createCanvas } from '@napi-rs/canvas'
import type { H3Event } from 'h3'

const W = 1200
const H = 630

function slugify(str: string = '') {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

async function fetchQuotes(event: H3Event) {
  // @ts-ignore dynamic import
  const { serverQueryContent } = await import('#content/server')
  return serverQueryContent(event).find()
}

async function findQuote(event: H3Event, rawSlug: string) {
  const all = await fetchQuotes(event)
  const norm = rawSlug.toLowerCase()
  return (
    all.find((q: any) => {
      if (!q?._path?.startsWith('/quotes/')) return false
      const composite = slugify(
        `${slugify(q.attribution || 'unknown')}-${slugify(q.quoteText || q.title || '')}`
      )
      return (
        composite === norm ||
        composite.startsWith(norm) ||
        norm.startsWith(composite)
      )
    }) || null
  )
}

function wrap(
  ctx: any,
  text: string,
  x: number,
  y: number,
  mw: number,
  lh: number
) {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []
  for (let i = 0; i < words.length; i++) {
    const tl = line + words[i] + ' '
    if (ctx.measureText(tl).width > mw && i > 0) {
      lines.push(line)
      line = words[i] + ' '
    } else line = tl
  }
  lines.push(line)
  const sy = y - ((lines.length - 1) * lh) / 2
  lines.forEach((l, idx) => ctx.fillText(l.trim(), x, sy + idx * lh))
}

export default defineEventHandler(async (event: H3Event) => {
  const slug = getRouterParam(event, 'slug') || ''
  if (!slug) {
    setResponseStatus(event, 400)
    return 'Missing slug'
  }
  const quote = await findQuote(event, slug)
  if (!quote) {
    setResponseStatus(event, 404)
    return 'Not found'
  }
  const quoteText: string = String(quote.quoteText || quote.title || '')
  const attribution: string = String(quote.attribution || 'Unknown')
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#1e293b')
  grad.addColorStop(1, '#0f172a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#68D2FF'
  ctx.font = 'bold 120px serif'
  ctx.fillText('“', 120, 180)
  ctx.fillText('”', W - 120, H - 180)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 48px system-ui, -apple-system, sans-serif'
  wrap(ctx, quoteText, W / 2, H / 2 - 40, W - 220, 62)
  ctx.fillStyle = '#68D2FF'
  ctx.font = '36px system-ui, -apple-system, sans-serif'
  ctx.fillText(`— ${attribution}`, W / 2, H / 2 + 160)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '28px system-ui, -apple-system, sans-serif'
  ctx.fillText('WakeUpNPC.com', W / 2, H - 45)
  const png = canvas.toBuffer('image/png')
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=86400'
  )
  return png
})
