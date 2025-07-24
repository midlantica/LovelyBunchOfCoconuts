// Server-side Open Graph image generator for memes
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const title = query.title || 'Political Meme'
  const imageUrl = query.image || ''

  try {
    // Import canvas library for server-side image generation
    const { createCanvas, loadImage } = await import('@napi-rs/canvas')

    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 630)
    gradient.addColorStop(0, '#1e293b')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 630)

    // If we have an image URL, try to load and display it
    if (imageUrl) {
      try {
        const memeImage = await loadImage(`https://wakeupnpc.com${imageUrl}`)

        // Calculate dimensions to fit image while maintaining aspect ratio
        const maxWidth = 800
        const maxHeight = 400
        const imgAspect = memeImage.width / memeImage.height
        const maxAspect = maxWidth / maxHeight

        let drawWidth, drawHeight
        if (imgAspect > maxAspect) {
          drawWidth = maxWidth
          drawHeight = maxWidth / imgAspect
        } else {
          drawWidth = maxHeight * imgAspect
          drawHeight = maxHeight
        }

        const x = (1200 - drawWidth) / 2
        const y = (630 - drawHeight) / 2 - 50

        ctx.drawImage(memeImage, x, y, drawWidth, drawHeight)

        // Add title overlay if provided
        if (title && title !== 'Political Meme') {
          // Add semi-transparent background for text
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(0, y + drawHeight - 80, 1200, 80)

          // Add title text
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 32px -apple-system, system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(title, 600, y + drawHeight - 30)
        }
      } catch (imgError) {
        console.warn('Could not load meme image:', imgError)
        // Fall back to text-only version
        drawTextOnlyMeme()
      }
    } else {
      drawTextOnlyMeme()
    }

    function drawTextOnlyMeme() {
      // Set text properties
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 48px -apple-system, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Draw title
      ctx.fillText(title, 600, 315)

      // Add "MEME" label
      ctx.font = '36px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = '#68D2FF'
      ctx.fillText('MEME', 600, 380)
    }

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
    console.error('Error generating OG image for meme:', error)

    // Fallback to redirect to a static image
    setResponseStatus(event, 302)
    setHeader(event, 'Location', 'https://wakeupnpc.com/og-fallback-meme.png')
    return ''
  }
})
