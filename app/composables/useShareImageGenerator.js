// composables/useShareImageGenerator.js
// Composable for generating shareable social media images.
// Used by modal components (ModalQuote, ModalGrift, ModalMeme) for OG-style previews.
// Delegates to shared canvas utilities in ~/utils/canvasHelpers.js

import {
  binarySearchFontSize,
  canvasToBlob,
  loadImage,
} from '~/utils/canvasHelpers'

export const useShareImageGenerator = () => {
  // ─── Grift Image ─────────────────────────────────────────────────────────────

  const generateGriftImage = async (grift, decode) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 1200
    canvas.height = 630

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1e293b')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const padding = 40
    const brandingHeight = 50
    const dividerHeight = 15
    const maxWidth = canvas.width - padding * 2
    const availableHeight = canvas.height - brandingHeight - padding * 2
    const griftHeight = availableHeight * 0.48
    const decodeHeight = availableHeight * 0.48

    const griftOptimal = binarySearchFontSize(
      ctx,
      `'${grift}'`,
      maxWidth,
      griftHeight,
      40,
      160,
      'bold',
      '-apple-system, system-ui, sans-serif'
    )

    const decodeOptimal = binarySearchFontSize(
      ctx,
      decode,
      maxWidth,
      decodeHeight,
      35,
      130,
      'normal',
      '-apple-system, system-ui, sans-serif'
    )

    const griftTotalHeight = griftOptimal.lines.length * griftOptimal.lineHeight
    const decodeTotalHeight =
      decodeOptimal.lines.length * decodeOptimal.lineHeight
    const totalContentHeight =
      griftTotalHeight + dividerHeight + decodeTotalHeight

    let currentY = padding + (availableHeight - totalContentHeight) / 2

    // Draw grift text
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

    // Draw decode text
    ctx.font = `normal ${decodeOptimal.fontSize}px -apple-system, system-ui, sans-serif`
    ctx.fillStyle = '#68D2FF'

    decodeOptimal.lines.forEach((line, index) => {
      ctx.fillText(
        line,
        canvas.width / 2,
        currentY + index * decodeOptimal.lineHeight
      )
    })

    // Branding
    ctx.font = '22px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('WakeUpNPC.com', canvas.width / 2, canvas.height - 30)

    return canvasToBlob(canvas)
  }

  // ─── Quote Image ─────────────────────────────────────────────────────────────

  const generateQuoteImage = async (quote, attribution) => {
    if (quote.length > 800) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1600
    canvas.height = 900

    // Load background
    const bgImage = await loadImage('/share-frame.png')
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height)

    const padding = 40
    const textWidth = 1550
    const logoHeight = 120
    const textHeight = canvas.height - logoHeight - padding * 2

    const fullText = `${quote}\n— ${attribution}`

    const charCount = quote.length
    let minFontSize = 30
    let maxFontSize = 81

    if (charCount >= 115 && charCount <= 135) {
      maxFontSize = 93
    }

    const optimal = binarySearchFontSize(
      ctx,
      fullText,
      textWidth,
      textHeight,
      minFontSize,
      maxFontSize,
      '300',
      '"Barlow Condensed", sans-serif',
      1.545 // Figma line-height ratio
    )

    ctx.font = `300 ${optimal.fontSize}px "Barlow Condensed", sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const totalTextHeight = optimal.lines.length * optimal.lineHeight
    const startY = padding + (textHeight - totalTextHeight) / 2

    // Find attribution line
    let attributionStartIndex = -1
    for (let i = 0; i < optimal.lines.length; i++) {
      if (optimal.lines[i].trim().startsWith('—')) {
        attributionStartIndex = i
        break
      }
    }

    optimal.lines.forEach((line, index) => {
      if (index === attributionStartIndex) {
        ctx.fillStyle = '#68D2FF'
      }
      if (line.trim()) {
        ctx.fillText(
          line,
          canvas.width / 2,
          startY + index * optimal.lineHeight
        )
      }
    })

    return canvasToBlob(canvas)
  }

  // ─── Meme Share Image ────────────────────────────────────────────────────────

  const generateMemeShareImage = async (imageUrl, title) => {
    const img = await loadImage(imageUrl)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1200
    canvas.height = 630

    const scale = Math.min(
      canvas.width / img.width,
      (canvas.height - 100) / img.height
    )
    const scaledWidth = img.width * scale
    const scaledHeight = img.height * scale
    const x = (canvas.width - scaledWidth) / 2
    const y = (canvas.height - 100 - scaledHeight) / 2

    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

    if (title) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px -apple-system, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(title, canvas.width / 2, canvas.height - 60)

      ctx.font = '20px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = '#68D2FF'
      ctx.fillText('WakeUpNPC.com', canvas.width / 2, canvas.height - 25)
    }

    return canvasToBlob(canvas)
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

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

  // ─── Asset Generators (return { dataUrl, filename }) ─────────────────────────

  const generateGriftShareAsset = async (grift, decode) => {
    const blob = await generateGriftImage(grift, decode)
    const dataUrl = await blobToDataUrl(blob)
    const filename = `grift-${slugPart(grift)}.png`
    return { dataUrl, filename }
  }

  const generateQuoteShareAsset = async (quote, attribution) => {
    const blob = await generateQuoteImage(quote, attribution)
    if (!blob) return null
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
