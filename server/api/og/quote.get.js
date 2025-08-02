// Server-side Open Graph image generator for quotes
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const text = query.text || 'Political Quote'
  const attribution = query.attribution || 'Anonymous'

  try {
    // Import canvas library for server-side image generation
    // Using @napi-rs/canvas which works in Node.js environments
    const { createCanvas } = await import('@napi-rs/canvas')

    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 630)
    gradient.addColorStop(0, '#1e293b')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 630)

    // Helper function to wrap text
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ')
      let line = ''
      let currentY = y

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = context.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, currentY)
          line = words[n] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      context.fillText(line, x, currentY)
      return currentY + lineHeight
    }

    // Set text properties for quote
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px -apple-system, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw quote text
    const quoteY = wrapText(ctx, `"${text}"`, 600, 250, 1000, 60)

    // Draw attribution
    ctx.font = '36px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#68D2FF'
    ctx.fillText(`— ${attribution}`, 600, quoteY + 60)

    // Add branding
    ctx.font = 'bold 24px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#68D2FF'
    ctx.textAlign = 'right'
    ctx.fillText('WakeUpNPC.com', 1140, 580)

    // Set headers for PNG image
    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')

    // Convert canvas to PNG buffer and return
    const buffer = canvas.toBuffer('image/png')
    return buffer
  } catch (error) {
    console.error('Error generating OG image:', error)

    // Fallback to redirect to a static image
    setResponseStatus(event, 302)
    setHeader(event, 'Location', 'https://wakeupnpc.com/og-fallback-quote.png')
    return ''
  }
})
