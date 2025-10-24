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
    // Character limit check - return null if quote is too long
    // Allow quotes up to 800 chars to match Figma design capacity
    if (quote.length > 800) {
      return null
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size to match share-frame.png
      canvas.width = 1600
      canvas.height = 900

      // Load share-frame.png as background
      const bgImage = new Image()
      bgImage.crossOrigin = 'anonymous'

      bgImage.onload = () => {
        // Draw background image
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height)

        // Text area specifications
        const textX = 25
        const textY = 27
        const textWidth = 1550
        const textHeight = 768

        // Calculate font size based on character count
        // MUCH smaller sizes for long quotes so they actually FIT in the text area (1550×768)
        const quoteLength = quote.length
        let fontSize, lineHeight, letterSpacing

        if (quoteLength > 650) {
          // Very long quotes like Chesterton - MUCH smaller to fit
          fontSize = 45
          lineHeight = 54
          letterSpacing = 0.45
        } else if (quoteLength > 580) {
          fontSize = 50
          lineHeight = 60
          letterSpacing = 0.5
        } else if (quoteLength > 500) {
          fontSize = 56
          lineHeight = 67
          letterSpacing = 0.56
        } else if (quoteLength > 420) {
          fontSize = 64
          lineHeight = 77
          letterSpacing = 0.64
        } else if (quoteLength > 350) {
          fontSize = 72
          lineHeight = 86
          letterSpacing = 0.72
        } else if (quoteLength > 280) {
          fontSize = 82
          lineHeight = 98
          letterSpacing = 0.82
        } else if (quoteLength > 220) {
          fontSize = 94
          lineHeight = 113
          letterSpacing = 0.94
        } else if (quoteLength > 160) {
          fontSize = 108
          lineHeight = 130
          letterSpacing = 1.08
        } else {
          // Short quotes get the largest size
          fontSize = 124
          lineHeight = 149
          letterSpacing = 1.24
        }

        // Quote text with Barlow Condensed Light - RED COLOR TO TEST
        ctx.font = `300 ${fontSize}px "Barlow Condensed", sans-serif`
        ctx.fillStyle = '#ff0000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        // Apply letter spacing (canvas doesn't have native letter-spacing, so we'll use the font as-is)
        // The letter-spacing will need to be handled in the wrapText function if precision is critical

        // Center the text vertically in the text area
        const centerY = textY + textHeight / 2
        wrapTextCentered(
          ctx,
          quote,
          textX + textWidth / 2,
          centerY,
          textWidth,
          lineHeight
        )

        // Attribution - positioned below quote with some spacing
        ctx.font = `300 ${Math.max(fontSize * 0.7, 48)}px "Barlow Condensed", sans-serif`
        ctx.fillStyle = '#68D2FF'
        ctx.textAlign = 'center'
        ctx.fillText(
          `— ${attribution}`,
          canvas.width / 2,
          textY + textHeight - 80
        )

        resolve(canvasToBlob(canvas))
      }

      bgImage.onerror = () => {
        reject(new Error('Failed to load share-frame.png'))
      }

      bgImage.src = '/share-frame.png'
    })
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

  // Helper function to wrap text and center vertically
  const wrapTextCentered = (ctx, text, x, centerY, maxWidth, lineHeight) => {
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

    // Calculate total height of text block
    const totalHeight = lines.length * lineHeight
    // Start Y position to center the block vertically
    const startY = centerY - totalHeight / 2

    // Draw lines
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
    // If blob is null (quote too long), return null
    if (!blob) {
      return null
    }
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
