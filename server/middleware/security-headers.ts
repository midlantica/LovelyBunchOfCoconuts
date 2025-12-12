export default defineEventHandler((event) => {
  // Don't apply security headers to static assets
  const path = event.node.req.url || ''
  if (
    path.startsWith('/ads/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/memes/') ||
    path.startsWith('/profiles/')
  ) {
    return
  }

  const headers = event.node.res

  // Content Security Policy - restrictive but allows necessary resources
  headers.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gc.zgo.at https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: http: https: blob:",
      "connect-src 'self' https://wakeupnpc.goatcounter.com https://api.iconify.design",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // HTTP Strict Transport Security - force HTTPS
  headers.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // Prevent clickjacking
  headers.setHeader('X-Frame-Options', 'DENY')

  // Cross-Origin Opener Policy
  headers.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  // Cross-Origin Resource Policy - allow same-site for static assets
  headers.setHeader('Cross-Origin-Resource-Policy', 'same-site')

  // Prevent MIME type sniffing
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // Referrer Policy
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy - disable unnecessary features
  headers.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  )
})
