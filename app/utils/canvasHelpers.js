// utils/canvasHelpers.js
// Shared canvas drawing utilities for share image generation

/**
 * Draw a rounded rectangle on a canvas context.
 */
export function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}

/**
 * Draw centered text at a given position.
 * Assumes ctx.textAlign is already set to 'center'.
 */
export function drawCenteredText(ctx, text, centerX, y) {
  ctx.fillText(text, centerX, y)
}

/**
 * Word-wrap text into lines that fit within maxWidth.
 * Returns an array of line strings.
 */
export function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let currentLine = words[0] || ''

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i]
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = words[i]
    }
  }
  lines.push(currentLine)
  return lines
}

/**
 * Heuristic font-size calculator based on estimated text capacity.
 * Used by grift renderer for equal-sizing both text blocks.
 *
 * @param {number} baseFontSize - Starting font size
 * @param {number} textLength   - Character count of the text
 * @param {number} maxWidth     - Available width in px
 * @param {number} maxHeight    - Available height in px
 * @returns {{ fontSize: number, lineHeight: number }}
 */
export function estimateFontSize(
  baseFontSize,
  textLength,
  maxWidth,
  maxHeight
) {
  const size15 = baseFontSize * 1.15
  const size10 = baseFontSize * 1.1
  const sizeOrig = baseFontSize
  const size5s = baseFontSize * 0.95
  const size10s = baseFontSize * 0.9
  const size15s = baseFontSize * 0.85

  const lineHeight = size15 * 1.375
  const charsPerLine = Math.floor(maxWidth / size15)
  const maxLines = Math.floor(maxHeight / lineHeight)
  const capacity = charsPerLine * maxLines * 0.75

  if (textLength <= capacity * 0.6) {
    return { fontSize: size15, lineHeight: size15 * 1.375 }
  } else if (textLength <= capacity * 0.75) {
    return { fontSize: size10, lineHeight: size10 * 1.375 }
  } else if (textLength <= capacity * 0.9) {
    return { fontSize: sizeOrig, lineHeight: sizeOrig * 1.375 }
  } else if (textLength <= capacity * 1.1) {
    return { fontSize: size5s, lineHeight: size5s * 1.375 }
  } else if (textLength <= capacity * 1.3) {
    return { fontSize: size10s, lineHeight: size10s * 1.375 }
  } else {
    return { fontSize: size15s, lineHeight: size15s * 1.375 }
  }
}

/**
 * Binary-search font-size calculator.
 * Finds the largest font size where wrapped text fits within maxHeight.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} minSize
 * @param {number} maxSize
 * @param {string} fontWeight  - e.g. '300', 'bold'
 * @param {string} fontFamily  - e.g. 'Barlow Condensed, Arial, sans-serif'
 * @param {number} [lineHeightMultiplier=1.47] - line-height as a multiple of font size
 * @returns {{ fontSize: number, lineHeight: number, lines: string[] }}
 */
export function binarySearchFontSize(
  ctx,
  text,
  maxWidth,
  maxHeight,
  minSize,
  maxSize,
  fontWeight,
  fontFamily,
  lineHeightMultiplier = 1.47
) {
  let optimalSize = minSize
  let optimalLines = []

  let low = minSize
  let high = maxSize

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const lh = mid * lineHeightMultiplier

    ctx.font = `${fontWeight} ${mid}px ${fontFamily}`

    const words = text.split(' ')
    const lines = []
    let line = ''

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)

    if (lines.length * lh <= maxHeight) {
      optimalSize = mid
      optimalLines = lines
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return {
    fontSize: optimalSize,
    lineHeight: optimalSize * lineHeightMultiplier,
    lines: optimalLines,
  }
}

/**
 * Convert a canvas to a PNG Blob with timeout protection.
 */
export function canvasToBlob(canvas, type = 'image/png', quality = 1.0) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Canvas to blob timeout'))
    }, 5000)

    canvas.toBlob(
      (blob) => {
        clearTimeout(timeout)
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob from canvas'))
      },
      type,
      quality
    )
  })
}

/**
 * Convert a Blob to a base64 string (without the data: prefix).
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result.split(',')[1])
      } else {
        reject(new Error('Failed to convert blob to base64'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Load an image from a URL with timeout and crossOrigin support.
 * @param {string} src
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const timeout = setTimeout(() => {
      reject(new Error(`Image load timeout: ${src}`))
    }, timeoutMs)

    img.onload = () => {
      clearTimeout(timeout)
      resolve(img)
    }
    img.onerror = (err) => {
      clearTimeout(timeout)
      reject(err)
    }
    img.src = src
  })
}

/**
 * Strip HTML tags and markdown formatting from text.
 * Useful for cleaning bio/description text before canvas rendering.
 */
export function stripMarkup(text) {
  return text
    .replace(/<em>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/<i>/gi, '')
    .replace(/<\/i>/gi, '')
    .replace(/<strong>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<b>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+?)_/g, '$1')
    .replace(/__([^_]+?)__/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract a filename from content path, falling back to timestamp.
 */
export function getFilenameFromContent(content, contentType) {
  const path = content?._path || content?.path
  if (path) {
    const segments = path.split('/')
    return `${segments[segments.length - 1]}.png`
  }
  return `lboc-${contentType}-${Date.now()}.png`
}
