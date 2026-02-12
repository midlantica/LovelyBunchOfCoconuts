// composables/useSocialShare.js
// Thin orchestrator for share/copy/download operations.
// Canvas rendering is delegated to ~/utils/shareImageRenderers.js
// Canvas helpers live in ~/utils/canvasHelpers.js

import {
  canvasToBlob,
  blobToBase64,
  loadImage,
  getFilenameFromContent,
} from '~/utils/canvasHelpers'

import {
  renderQuote,
  renderGrift,
  renderMeme,
  renderProfile,
} from '~/utils/shareImageRenderers'

export function useSocialShare() {
  // ─── Toast (via shared useToast composable) ──────────────────────────────────

  const { showToast } = useToast()

  // ─── Image Generation ────────────────────────────────────────────────────────

  const generateShareImage = async (content, type) => {
    const scale = 2
    const finalWidth = 1600
    const finalHeight = 900

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = finalWidth * scale
    canvas.height = finalHeight * scale

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Load background
    const backgroundImg = await loadImage('/share-frame.png')
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)

    // Layout constants
    const paddingX = 80 * scale
    const paddingY = 60 * scale
    const layout = {
      scale,
      textAreaWidth: canvas.width - paddingX * 2,
      textAreaHeight: canvas.height - paddingY * 2,
      centerX: canvas.width / 2,
      centerY: (canvas.height - 60 * scale) / 2,
      paddingY,
    }

    // Delegate to type-specific renderer
    const renderers = {
      quote: renderQuote,
      grift: renderGrift,
      meme: renderMeme,
      profile: renderProfile,
    }
    const renderer = renderers[type]
    if (renderer) {
      await renderer(ctx, content, layout)
    }

    // Scale down 2x → 1x for smooth anti-aliasing
    const finalCanvas = document.createElement('canvas')
    const finalCtx = finalCanvas.getContext('2d')
    finalCanvas.width = finalWidth
    finalCanvas.height = finalHeight
    finalCtx.imageSmoothingEnabled = true
    finalCtx.imageSmoothingQuality = 'high'
    finalCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight)

    return canvasToBlob(finalCanvas)
  }

  // ─── Meme Image Handling (DOM scraping + logo overlay) ─────────────────────

  const _findMemeImage = () => {
    const selectors = [
      '.modal img',
      '.modal-content img',
      '[role="dialog"] img',
      '.vfm img',
      '.modal-container img',
      '.popup img',
      '.overlay img',
    ]

    for (const selector of selectors) {
      for (const img of document.querySelectorAll(selector)) {
        if (img.src && img.naturalWidth > 50 && img.complete) return img
      }
    }

    // Fallback: last large image on page
    const allImages = [...document.querySelectorAll('img')]
    for (let i = allImages.length - 1; i >= 0; i--) {
      const img = allImages[i]
      if (
        img.src &&
        img.naturalWidth > 100 &&
        !img.src.includes('logo') &&
        !img.src.includes('icon') &&
        img.complete
      ) {
        return img
      }
    }

    return null
  }

  const _applyLogoOverlay = async (canvas, ctx) => {
    try {
      const logoImg = await loadImage('/wakeupnpc-mini.png', 3000)
      const logoWidth = 158
      const logoHeight = 19
      ctx.globalAlpha = 0.9
      ctx.drawImage(
        logoImg,
        canvas.width - logoWidth - 5,
        canvas.height - logoHeight - 5,
        logoWidth,
        logoHeight
      )
      ctx.globalAlpha = 1.0
    } catch {
      console.warn('Logo overlay failed, continuing without logo')
    }
  }

  const _downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const _handleMemeShare = async (content, platform, onFeedback) => {
    const foundImage = _findMemeImage()
    if (!foundImage) throw new Error('No meme image found')

    const controller = new AbortController()
    const fetchTimeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(foundImage.src, { signal: controller.signal })
    clearTimeout(fetchTimeout)
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.status}`)

    const memeBlob = await response.blob()

    // Create canvas with logo overlay
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) throw new Error('Failed to get canvas context')

    canvas.width = foundImage.naturalWidth
    canvas.height = foundImage.naturalHeight
    ctx.drawImage(foundImage, 0, 0, canvas.width, canvas.height)

    await _applyLogoOverlay(canvas, ctx)

    let finalBlob
    try {
      finalBlob = await canvasToBlob(canvas)
    } catch {
      // Fallback to original blob without logo
      finalBlob = memeBlob
    }

    const filename = getFilenameFromContent(content, 'meme')

    if (platform === 'download') {
      _downloadBlob(finalBlob, filename)
      onFeedback?.('Image downloaded!')
    } else {
      // Copy to clipboard
      const { useUniversalClipboard } =
        await import('~/composables/useUniversalClipboard')
      const { copyImageToClipboard } = useUniversalClipboard()

      await copyImageToClipboard(finalBlob, {
        contentType: 'meme',
        filename,
        onSuccess: (msg) => onFeedback?.(msg),
        onError: (msg) => onFeedback?.(msg),
      })
    }
  }

  // ─── Main Share Orchestrator ─────────────────────────────────────────────────

  const shareToPlatform = async (
    content,
    type,
    platform,
    url = null,
    onFeedback = null
  ) => {
    try {
      // Memes use DOM scraping + logo overlay instead of canvas generation
      if (type === 'meme') {
        await _handleMemeShare(content, platform, onFeedback)
        return
      }

      // Generate branded image for quotes, grifts, profiles
      const imageBlob = await generateShareImage(content, type)
      const filename = getFilenameFromContent(content, type)

      if (platform === 'download') {
        _downloadBlob(imageBlob, filename)
        onFeedback?.('Image downloaded!')
        return
      }

      if (platform === 'image') {
        const { useUniversalClipboard } =
          await import('~/composables/useUniversalClipboard')
        const { copyImageToClipboard } = useUniversalClipboard()

        await copyImageToClipboard(imageBlob, {
          contentType: type,
          filename,
          onSuccess: (msg) => onFeedback?.(msg),
          onError: (msg) => onFeedback?.(msg),
        })
        return
      }

      // Social media mode: copy image + URL with progressive fallbacks
      await _copyWithFallbacks(imageBlob, url)
    } catch (error) {
      console.error('Error sharing content:', error)
      onFeedback?.(error.message || 'Error sharing content')
    }
  }

  const _copyWithFallbacks = async (imageBlob, url) => {
    if (!navigator.clipboard?.write) {
      _downloadBlob(imageBlob, `wakeupnpc-share-${Date.now()}.png`)
      showToast('Image downloaded!')
      return
    }

    try {
      // Try HTML clipboard format (best for social media)
      const base64 = await blobToBase64(imageBlob)
      const htmlContent = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <img src="data:image/jpeg;base64,${base64}" alt="Share content" style="max-width: 100%; height: auto;" />
          <a href="${url}" style="color: #6DD3FF; text-decoration: none; font-family: Arial, sans-serif;">${url}</a>
        </div>
      `
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([url], { type: 'text/plain' }),
          'image/png': imageBlob,
        }),
      ])
      showToast('Image + link copied!')
    } catch {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': imageBlob }),
        ])
        showToast('Image copied 😀')
      } catch {
        try {
          await navigator.clipboard.writeText(url || 'Share this content')
          showToast('Link copied!')
        } catch {
          showToast('Copy failed - try downloading')
        }
      }
    }
  }

  // ─── Convenience Wrappers ────────────────────────────────────────────────────

  const shareGrift = (grift) => shareToPlatform(grift, 'grift', 'social')
  const shareQuote = (quote) => shareToPlatform(quote, 'quote', 'social')
  const shareMeme = (meme) => shareToPlatform(meme, 'meme', 'social')

  return {
    generateShareImage,
    shareToPlatform,
    shareGrift,
    shareQuote,
    shareMeme,
  }
}
