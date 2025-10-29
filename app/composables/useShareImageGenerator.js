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

    // Layout constants - more aggressive
    const padding = 40 // Reduced from 60
    const brandingHeight = 50 // Reduced from 60
    const dividerHeight = 15 // Reduced from 20
    const maxWidth = canvas.width - padding * 2

    // Available height split between grift and decode
    const availableHeight = canvas.height - brandingHeight - padding * 2
    const griftHeight = availableHeight * 0.48 // Increased from 45%
    const decodeHeight = availableHeight * 0.48 // Increased from 45%

    // Calculate optimal font size for grift - more aggressive
    const griftOptimal = calculateOptimalFontSize(
      ctx,
      `'${grift}'`,
      maxWidth,
      griftHeight,
      40, // min size increased
      160, // max size increased from 100
      'bold',
      '-apple-system, system-ui, sans-serif'
    )

    // Calculate optimal font size for decode - more aggressive
    const decodeOptimal = calculateOptimalFontSize(
      ctx,
      decode,
      maxWidth,
      decodeHeight,
      35, // min size increased
      130, // max size increased from 80
      'normal',
      '-apple-system, system-ui, sans-serif'
    )

    // Calculate positions
    const griftTotalHeight = griftOptimal.lines.length * griftOptimal.lineHeight
    const decodeTotalHeight =
      decodeOptimal.lines.length * decodeOptimal.lineHeight
    const totalContentHeight =
      griftTotalHeight + dividerHeight + decodeTotalHeight

    // Center all content vertically
    let currentY = padding + (availableHeight - totalContentHeight) / 2

    // Draw grift (main text)
    ctx.font = `bold ${griftOptimal.fontSize}px -apple-system, system-ui, sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    griftOptimal.lines.forEach((line, index) => {
      ctx.fillText(
        line,
        canvas.width / 2,
        currentY + index * griftOptimal.lineHeight
      )
    })

    currentY += griftTotalHeight + dividerHeight

    // Draw decode
    ctx.font = `normal ${decodeOptimal.fontSize}px -apple-system, system-ui, sans-serif`
    ctx.fillStyle = '#68D2FF' // seagull color

    decodeOptimal.lines.forEach((line, index) => {
      ctx.fillText(
        line,
        canvas.width / 2,
        currentY + index * decodeOptimal.lineHeight
      )
    })

    // Add branding
    ctx.font = '22px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#94a3b8' // slate-400
    ctx.fillText('WakeUpNPC.com', canvas.width / 2, canvas.height - 30)

    return canvasToBlob(canvas)
  }

  const generateQuoteImage = async (quote, attribution) => {
    // Character limit check - return null if quote is too long
    if (quote.length > 800) {
      return null
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size to match share-frame.png and Figma design
      canvas.width = 1600
      canvas.height = 900

      // Load share-frame.png as background
      const bgImage = new Image()
      bgImage.crossOrigin = 'anonymous'

      bgImage.onload = () => {
        // Draw background image
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height)

        // Text area matching Figma design: 1550px wide, generous vertical space
        const padding = 40 // Padding matching Figma
        const textWidth = 1550 // Full design width from Figma
        const logoHeight = 120 // Space reserved for bottom logo
        const textHeight = canvas.height - logoHeight - padding * 2 // Available height for text

        // Combine quote and attribution for unified text measurement (inline)
        const fullText = `${quote}\n— ${attribution}`

        // Character-count-based font size adjustments
        const charCount = quote.length
        let minFontSize = 30
        let maxFontSize = 81

        // ~130 chars (Hayek "Marxism has led to..."): needs 15% bigger
        // Hayek quote is exactly 127 characters
        if (charCount >= 115 && charCount <= 135) {
          maxFontSize = 93 // 81 * 1.15 = 93.15
        }

        // Calculate optimal font size
        const optimal = calculateOptimalFontSize(
          ctx,
          fullText,
          textWidth,
          textHeight,
          minFontSize,
          maxFontSize,
          '300',
          '"Barlow Condensed", sans-serif'
        )

        // Set font with optimal size and light weight
        ctx.font = `300 ${optimal.fontSize}px "Barlow Condensed", sans-serif`
        ctx.fillStyle = '#FFFFFF' // White text (fixed - was red for debug)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        // Calculate vertical centering
        const totalTextHeight = optimal.lines.length * optimal.lineHeight
        const startY = padding + (textHeight - totalTextHeight) / 2

        // Find where attribution starts (after blank line)
        let attributionStartIndex = -1
        for (let i = 0; i < optimal.lines.length; i++) {
          if (optimal.lines[i].trim().startsWith('—')) {
            attributionStartIndex = i
            break
          }
        }

        // Draw each line with proper styling
        optimal.lines.forEach((line, index) => {
          if (index === attributionStartIndex) {
            // Attribution line - use cyan color
            ctx.fillStyle = '#68D2FF'
          }

          if (line.trim()) {
            // Only draw non-empty lines
            ctx.fillText(
              line,
              canvas.width / 2,
              startY + index * optimal.lineHeight
            )
          }
        })

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

  // Calculate optimal font size that maximizes text while fitting in bounds
  const calculateOptimalFontSize = (
    ctx,
    text,
    maxWidth,
    maxHeight,
    minSize = 30,
    maxSize = 200,
    fontWeight = '300',
    fontFamily = '"Barlow Condensed", sans-serif'
  ) => {
    let optimalSize = minSize
    let optimalLines = []

    // Binary search for optimal font size
    let low = minSize
    let high = maxSize

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const lineHeight = mid * 1.545 // Figma line-height: 102px for 66px font = 1.545

      ctx.font = `${fontWeight} ${mid}px ${fontFamily}`

      // Calculate wrapped lines
      const words = text.split(' ')
      let lines = []
      let line = ''

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && line) {
          lines.push(line)
          line = word
        } else {
          line = testLine
        }
      }
      if (line) lines.push(line)

      // Check if it fits
      const totalHeight = lines.length * lineHeight

      if (totalHeight <= maxHeight) {
        // Fits! Try larger
        optimalSize = mid
        optimalLines = lines
        low = mid + 1
      } else {
        // Too big, try smaller
        high = mid - 1
      }
    }

    return {
      fontSize: optimalSize,
      lineHeight: optimalSize * 1.545, // Figma: 102px line-height for 66px font
      lines: optimalLines,
    }
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
