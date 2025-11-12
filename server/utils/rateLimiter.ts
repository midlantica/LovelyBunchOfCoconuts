// Simple in-memory rate limiter for like endpoints
// Uses sliding window approach to prevent spam

interface RateLimitEntry {
  timestamps: number[]
  lastCleanup: number
}

// Store rate limit data in memory (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes to prevent memory bloat
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastGlobalCleanup = Date.now()

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the window
}

// Default: 10 likes per minute per IP
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
}

function cleanupOldEntries() {
  const now = Date.now()
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL) return

  lastGlobalCleanup = now
  const cutoff = now - 10 * 60 * 1000 // Remove entries older than 10 minutes

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.lastCleanup < cutoff) {
      rateLimitStore.delete(key)
    }
  }
}

function getClientIdentifier(event: any): string {
  // Try to get real IP from various headers (for proxies/CDNs)
  const headers = event.node.req.headers
  const forwarded = headers['x-forwarded-for']
  const realIp = headers['x-real-ip']
  const cfConnectingIp = headers['cf-connecting-ip'] // Cloudflare

  let ip = 'unknown'

  if (typeof forwarded === 'string') {
    // x-forwarded-for can be a comma-separated list, take the first one
    ip = forwarded.split(',')[0].trim()
  } else if (typeof realIp === 'string') {
    ip = realIp
  } else if (typeof cfConnectingIp === 'string') {
    ip = cfConnectingIp
  } else if (event.node.req.socket?.remoteAddress) {
    ip = event.node.req.socket.remoteAddress
  }

  // Normalize IPv6 localhost to IPv4
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1'
  }

  return ip
}

export function checkRateLimit(
  event: any,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupOldEntries()

  const identifier = getClientIdentifier(event)
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get or create entry for this identifier
  let entry = rateLimitStore.get(identifier)
  if (!entry) {
    entry = {
      timestamps: [],
      lastCleanup: now,
    }
    rateLimitStore.set(identifier, entry)
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)
  entry.lastCleanup = now

  // Check if limit exceeded
  const allowed = entry.timestamps.length < config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.timestamps.length)
  const resetAt =
    entry.timestamps.length > 0
      ? entry.timestamps[0] + config.windowMs
      : now + config.windowMs

  // If allowed, record this request
  if (allowed) {
    entry.timestamps.push(now)
  }

  return { allowed, remaining, resetAt }
}

export function getRateLimitHeaders(result: {
  allowed: boolean
  remaining: number
  resetAt: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(DEFAULT_CONFIG.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)), // Unix timestamp in seconds
  }
}

// For testing/debugging - clear rate limits for an identifier
export function clearRateLimit(identifier: string) {
  rateLimitStore.delete(identifier)
}

// For testing/debugging - clear all rate limits
export function clearAllRateLimits() {
  rateLimitStore.clear()
  lastGlobalCleanup = Date.now()
}
