// Composable for generating shareable social media images
export const useShareImageGenerator = () => {
  const generateGriftImage = async (grift, decode) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Set canvas size (optimal for social media)
    canvas.width = 1200
    canvas.height = 630

    // Background
    ctx.fillStyle = '#1e293b' // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1e293b')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Text styling
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw grift (main text)
    ctx.font = 'bold 48px -apple-system, system-ui, sans-serif'
    wrapText(
      ctx,
      grift,
      canvas.width / 2,
      canvas.height / 2 - 50,
      canvas.width - 100,
      60
    )

    // Draw decode
    ctx.font = '36px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#68D2FF' // seagull color
    wrapText(
      ctx,
      decode,
      canvas.width / 2,
      canvas.height / 2 + 80,
      canvas.width - 100,
      50
    )

    // Add branding
    ctx.font = '24px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#94a3b8' // slate-400
    ctx.fillText('WakeUpNPC.com', canvas.width / 2, canvas.height - 40)

    return canvasToBlob(canvas)
  }

  const generateQuoteImage = async (quote, attribution) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 1200
    canvas.height = 630

    // Background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Quote styling
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // MICROSCOPIC FONTS - GUARANTEE FIT
    const quoteLength = quote.length
    let fontSize, lineHeight, quoteMarkSize

    if (quoteLength > 1200) {
      fontSize = 3
      lineHeight = 6
      quoteMarkSize = 50
    } else if (quoteLength > 1000) {
      fontSize = 3.5
      lineHeight = 6.5
      quoteMarkSize = 60
    } else if (quoteLength > 900) {
      fontSize = 4
      lineHeight = 7
      quoteMarkSize = 70
    } else if (quoteLength > 800) {
      fontSize = 4.5
      lineHeight = 7.5
      quoteMarkSize = 70
    } else if (quoteLength > 700) {
      fontSize = 5
      lineHeight = 8
      quoteMarkSize = 80
    } else if (quoteLength > 600) {
      fontSize = 6
      lineHeight = 9
      quoteMarkSize = 90
    } else if (quoteLength > 500) {
      fontSize = 8
      lineHeight = 12
      quoteMarkSize = 100
    } else if (quoteLength > 400) {
      fontSize = 11
      lineHeight = 16
      quoteMarkSize = 110
    } else if (quoteLength > 300) {
      fontSize = 15
      lineHeight = 22
      quoteMarkSize = 120
    } else if (quoteLength > 200) {
      fontSize = 21
      lineHeight = 29
      quoteMarkSize = 120
    } else if (quoteLength > 150) {
      fontSize = 27
      lineHeight = 37
      quoteMarkSize = 120
    } else {
      fontSize = 42
      lineHeight = 55
      quoteMarkSize = 120
    }

    // Smaller quote marks for long quotes to save space
    ctx.font = `bold ${quoteMarkSize}px serif`
    ctx.fillStyle = '#68D2FF'
    ctx.fillText('"', 100, 200)
    ctx.fillText('"', canvas.width - 100, 430)

    // Quote text with dynamic sizing
    ctx.font = `italic ${fontSize}px -apple-system, system-ui, sans-serif`
    ctx.fillStyle = '#ffffff'
    wrapText(
      ctx,
      quote,
      canvas.width / 2,
      canvas.height / 2 - 20,
      canvas.width - 200,
      lineHeight
    )

    // Attribution
    ctx.font = '32px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#68D2FF'
    ctx.fillText(`— ${attribution}`, canvas.width / 2, canvas.height / 2 + 120)

    // Branding
    ctx.font = '24px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('WakeUpNPC.com', canvas.width / 2, canvas.height - 40)

    return canvasToBlob(canvas)
  }

  const generateMemeShareImage = async (imageUrl, title) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = 1200
        canvas.height = 630

        // Calculate image scaling to fit while maintaining aspect ratio
        const scale = Math.min(
          canvas.width / img.width,
          (canvas.height - 100) / img.height
        )
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (canvas.width - scaledWidth) / 2
        const y = (canvas.height - 100 - scaledHeight) / 2

        // Background
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

        // Add title overlay if provided
        if (title) {
          // Semi-transparent overlay for text
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(0, canvas.height - 100, canvas.width, 100)

          // Title text
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(title, canvas.width / 2, canvas.height - 60)

          // Branding
          ctx.font = '20px -apple-system, system-ui, sans-serif'
          ctx.fillStyle = '#68D2FF'
          ctx.fillText('WakeUpNPC.com', canvas.width / 2, canvas.height - 25)
        }

        resolve(canvasToBlob(canvas))
      }

      img.src = imageUrl
    })
  }

  // Helper function to wrap text
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let lines = []

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        lines.push(line)
        line = words[n] + ' '
      } else {
        line = testLine
      }
    }
    lines.push(line)

    // Draw lines
    const startY = y - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight)
    })
  }

  // Helper to convert canvas to blob
  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 0.9)
    })
  }

  const blobToDataUrl = (blob) =>
    new Promise((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.readAsDataURL(blob)
    })

  const slugPart = (t = '') =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60)

  const generateGriftShareAsset = async (grift, decode) => {
    const blob = await generateGriftImage(grift, decode)
    const dataUrl = await blobToDataUrl(blob)
    const filename = `grift-${slugPart(grift)}.png`
    return { dataUrl, filename }
  }
  const generateQuoteShareAsset = async (quote, attribution) => {
    const blob = await generateQuoteImage(quote, attribution)
    const dataUrl = await blobToDataUrl(blob)
    const filename =
      `quote-${slugPart(attribution)}-${slugPart(quote)}`.substring(0, 80) +
      '.png'
    return { dataUrl, filename }
  }
  const generateMemeShareAsset = async (img, title) => {
    const blob = await generateMemeShareImage(img, title)
    const dataUrl = await blobToDataUrl(blob)
    const filename = `meme-${slugPart(title)}.png`
    return { dataUrl, filename }
  }

  return {
    generateGriftImage,
    generateQuoteImage,
    generateMemeShareImage,
    generateGriftShareAsset,
    generateQuoteShareAsset,
    generateMemeShareAsset,
  }
}
