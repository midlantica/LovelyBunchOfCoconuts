import { increment } from '../../utils/likesStore'
import { checkRateLimit, getRateLimitHeaders } from '../../utils/rateLimiter'

function normalizeId(id: string): string {
  if (!id) return ''
  let normalized = id

  // Decode URL encoding if present
  try {
    if (normalized.includes('%')) {
      normalized = decodeURIComponent(normalized)
    }
  } catch (e) {
    // If decoding fails, use original
  }

  // Apply standard normalization
  normalized = normalized
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/\/(claims|memes|quotes)\/(?:\1\/)+/g, '/$1/') // Collapse duplicated segments
    .replace(/_/g, '-') // Convert underscores to hyphens
    .replace(/\/+/g, '/') // Collapse multiple slashes

  // Ensure leading slash
  if (normalized && !normalized.startsWith('/')) {
    normalized = '/' + normalized
  }

  return normalized
}

export default defineEventHandler(async (event) => {
  try {
    // Check rate limit first
    const rateLimitResult = checkRateLimit(event)
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

    // Set rate limit headers
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      setResponseHeader(event, key, value)
    }

    // If rate limit exceeded, return 429
    if (!rateLimitResult.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage:
          'Too Many Requests - Rate limit exceeded. Please try again later.',
      })
    }

    const rawId = event.context.params?.id || ''
    if (!rawId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing id' })
    }

    const normalizedId = normalizeId(rawId)
    if (!normalizedId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
    }

    const body = (await readBody(event).catch(() => ({}))) as any
    // direction: +1 (like) or -1 (unlike). Default +1.
    let delta = 1
    if (typeof body?.delta === 'number') {
      delta = body.delta > 0 ? 1 : -1
    }
    const count = await increment(normalizedId, delta)
    return { id: normalizedId, count }
  } catch (e: any) {
    // Preserve 429 status code for rate limit errors
    if (e?.statusCode === 429) {
      throw e
    }
    throw createError({
      statusCode: 400,
      statusMessage: e?.message || 'bad-request',
    })
  }
})
