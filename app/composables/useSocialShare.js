// composables/useSocialShare.js
export function useSocialShare() {
  // Helper function to draw rounded rectangles
  function roundRect(ctx, x, y, width, height, radius) {
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

  // Helper function to draw centered text (natural spacing)
  function drawCenteredText(ctx, text, centerX, y) {
    ctx.fillText(text, centerX, y)
  }

  // Helper function to calculate optimal font size based on content length
  function calculateOptimalFontSize(
    baseFontSize,
    textLength,
    maxWidth,
    maxHeight
  ) {
    // More conservative sizes to handle very long text
    const size15Percent = baseFontSize * 1.15
    const size10Percent = baseFontSize * 1.1
    const sizeOriginal = baseFontSize
    const size5PercentSmaller = baseFontSize * 0.95
    const size10PercentSmaller = baseFontSize * 0.9
    const size15PercentSmaller = baseFontSize * 0.85

    // Calculate characters per line and max lines (more conservative)
    const lineHeight = size15Percent * 1.375
    const charsPerLine = Math.floor(maxWidth / size15Percent)
    const maxLines = Math.floor(maxHeight / lineHeight)

    // Estimate total capacity (more conservative - 75% efficiency for safety)
    const estimatedCapacity = charsPerLine * maxLines * 0.75

    // Choose font size based on content length - more aggressive reduction
    if (textLength <= estimatedCapacity * 0.6) {
      // Short text - use 15% larger
      return { fontSize: size15Percent, lineHeight: size15Percent * 1.375 }
    } else if (textLength <= estimatedCapacity * 0.75) {
      // Medium text - use 10% larger
      return { fontSize: size10Percent, lineHeight: size10Percent * 1.375 }
    } else if (textLength <= estimatedCapacity * 0.9) {
      // Long text - use original size
      return { fontSize: sizeOriginal, lineHeight: sizeOriginal * 1.375 }
    } else if (textLength <= estimatedCapacity * 1.1) {
      // Very long text - use 5% smaller
      return {
        fontSize: size5PercentSmaller,
        lineHeight: size5PercentSmaller * 1.375,
      }
    } else if (textLength <= estimatedCapacity * 1.3) {
      // Extremely long text - use 10% smaller
      return {
        fontSize: size10PercentSmaller,
        lineHeight: size10PercentSmaller * 1.375,
      }
    } else {
      // Ultra long text - use 15% smaller
      return {
        fontSize: size15PercentSmaller,
        lineHeight: size15PercentSmaller * 1.375,
      }
    }
  }

  // Helper function to convert blob to base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === 'string') {
          // Remove the data: URL prefix to get just the base64 part
          const base64 = result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert blob to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
  // Simple toast notification function
  const showToast = (message) => {
    // Remove existing toast
    const existingToast = document.querySelector('.share-toast')
    if (existingToast) {
      existingToast.remove()
    }

    // Create toast element
    const toast = document.createElement('div')
    toast.className = 'share-toast'
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #475569;
      z-index: 9999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: toastSlideIn 0.3s ease-out;
    `

    // Add animation keyframes
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style')
      style.id = 'toast-styles'
      style.textContent = `
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toastSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(toast)

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease-in'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }
  const generateShareImage = async (content, type) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size for social media (1200x630 is ideal for most platforms)
      canvas.width = 1200
      canvas.height = 630

      // Load the pre-designed background frame
      const backgroundImg = new Image()
      backgroundImg.crossOrigin = 'anonymous'
      backgroundImg.onload = () => {
        // Draw the complete background frame (includes background, panel, and logo)
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)

        // Inner frame specifications: 30px from top-left, 1140px width × 476px height
        const innerFrameX = 30
        const innerFrameY = 30
        const innerFrameWidth = 1140
        const innerFrameHeight = 476

        // Calculate the center point of the inner frame
        const centerX = innerFrameX + innerFrameWidth / 2
        const centerY = innerFrameY + innerFrameHeight / 2

        // Content specifications based on type - centered on inner frame center point
        if (type === 'quote') {
          // Quote layout centered on inner frame center
          let quoteText = 'Political Quote'
          let authorName = 'Author'

          // QUOTE TEXT: Use the same logic as the working PanelQuote.vue
          // PanelQuote.vue uses content.headings[0] directly (already processed by Nuxt Content)
          if (content.headings && content.headings.length > 0) {
            // Use the heading directly - Nuxt Content already processed the markdown
            quoteText = content.headings[0]
          }

          // AUTHOR: Extract just the author from attribution (remove the quote text)
          // content.attribution contains: "Quote text — Author Name"
          // We need to extract just "Author Name"
          if (content.attribution && content.attribution.trim()) {
            const attribution = content.attribution.trim()
            // Find the last " — " and take everything after it
            const lastDashIndex = attribution.lastIndexOf(' — ')
            if (lastDashIndex !== -1) {
              authorName = attribution.substring(lastDashIndex + 3).trim()
            } else {
              // Fallback: if no " — " found, use the whole attribution
              authorName = attribution
            }
          }

          // Calculate optimal font size for quote text
          const quoteOptimalSize = calculateOptimalFontSize(
            40.7, // Base font size
            quoteText.length,
            1062, // Max width
            476 // Max height
          )

          // Quote text (all white as requested) - smart sizing for mobile readability
          ctx.fillStyle = '#ffffff'
          ctx.font = `100 ${quoteOptimalSize.fontSize}px Barlow Condensed, Arial, sans-serif`
          ctx.textAlign = 'center'

          // Word wrap for quote - max width 1062 as requested
          const words = quoteText.split(' ')
          const lines = []
          let currentLine = words[0]
          const maxWidth = 1062 // Text area should not exceed 1062 width

          for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const width = ctx.measureText(currentLine + ' ' + word).width
            if (width < maxWidth) {
              currentLine += ' ' + word
            } else {
              lines.push(currentLine)
              currentLine = word
            }
          }
          lines.push(currentLine)

          // Draw the quote lines centered on inner frame center
          const totalTextHeight = lines.length * quoteOptimalSize.lineHeight
          const quoteStartY = centerY - totalTextHeight / 2

          lines.forEach((line, index) => {
            drawCenteredText(
              ctx,
              line,
              centerX,
              quoteStartY + index * quoteOptimalSize.lineHeight
            )
          })

          // Author name (light blue #6DD3FF as requested) - smart sizing for mobile readability
          if (
            authorName &&
            authorName !== 'Author' &&
            authorName.trim() !== ''
          ) {
            // Calculate optimal size for author (smaller than quote text)
            const authorOptimalSize = calculateOptimalFontSize(
              31.74, // Base author font size
              authorName.length,
              1062, // Max width
              476 // Max height
            )

            ctx.fillStyle = '#6DD3FF'
            ctx.font = `100 ${authorOptimalSize.fontSize}px Barlow Condensed, Arial, sans-serif`
            drawCenteredText(
              ctx,
              `— ${authorName}`,
              centerX,
              quoteStartY + totalTextHeight + authorOptimalSize.fontSize * 0.4
            )
          }
        } else if (type === 'claim') {
          // Claim layout centered on inner frame center
          const claimText = content.claim || 'Political Claim'
          const translationText = content.translation || 'Translation'

          // Extract just the translation part (remove claim + dash if present)
          let cleanTranslationText = translationText
          if (translationText && translationText.includes(' - ')) {
            // Find the first " - " and take everything after it
            const dashIndex = translationText.indexOf(' - ')
            if (dashIndex !== -1) {
              cleanTranslationText = translationText
                .substring(dashIndex + 3)
                .trim()
            }
          }

          // Debug: Log what we actually got
          console.log('=== CLAIM DEBUG ===')
          console.log('content:', content)
          console.log('content.claim:', content.claim)
          console.log('content.translation:', content.translation)
          console.log('Final claimText:', claimText)
          console.log('Final cleanTranslationText:', cleanTranslationText)

          // Calculate optimal font size for claim text
          const claimOptimalSize = calculateOptimalFontSize(
            45, // Base font size
            claimText.length,
            1062, // Max width
            476 // Max height
          )

          // Claim text (white) - smart sizing for mobile readability
          ctx.fillStyle = '#ffffff'
          ctx.font = `100 ${claimOptimalSize.fontSize}px Barlow Condensed, Arial, sans-serif`
          ctx.textAlign = 'center'
          drawCenteredText(
            ctx,
            claimText,
            centerX,
            centerY - claimOptimalSize.fontSize * 0.6
          )

          // Horizontal rule (#6DD3FF at 50% opacity, 820px wide)
          ctx.fillStyle = '#6DD3FF'
          ctx.globalAlpha = 0.5
          const ruleY = centerY
          const ruleWidth = 820
          ctx.fillRect(centerX - ruleWidth / 2, ruleY, ruleWidth, 2)
          ctx.globalAlpha = 1

          // Calculate optimal font size for translation text
          const translationOptimalSize = calculateOptimalFontSize(
            45, // Base font size (same as claim)
            cleanTranslationText.length,
            1062, // Max width
            476 // Max height
          )

          // Translation text (white) - smart sizing for mobile readability
          ctx.fillStyle = '#ffffff'
          ctx.font = `100 ${translationOptimalSize.fontSize}px Barlow Condensed, Arial, sans-serif`
          drawCenteredText(
            ctx,
            cleanTranslationText,
            centerX,
            centerY + translationOptimalSize.fontSize * 0.9 + 18
          )
        } else if (type === 'meme') {
          // Meme layout - fills entire inner panel but stays within bounds
          const memeText =
            content.title || content.description || 'Political Meme'

          // For now, just show text - we can enhance with actual image later
          ctx.fillStyle = '#ffffff'
          ctx.font = '100 48px Barlow Condensed, Arial, sans-serif'
          ctx.textAlign = 'center'

          // Word wrap for meme text - ensure it fits within 1062 width
          const words = memeText.split(' ')
          const lines = []
          let currentLine = words[0]
          const maxWidth = 1062 // Text area should not exceed 1062 width

          for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const width = ctx.measureText(currentLine + ' ' + word).width
            if (width < maxWidth) {
              currentLine += ' ' + word
            } else {
              lines.push(currentLine)
              currentLine = word
            }
          }
          lines.push(currentLine)

          // Draw meme text centered on inner frame center
          const lineHeight = 60
          const totalTextHeight = lines.length * lineHeight
          const memeStartY = centerY - totalTextHeight / 2

          lines.forEach((line, index) => {
            drawCenteredText(
              ctx,
              line,
              centerX,
              memeStartY + index * lineHeight
            )
          })
        }

        // Logo is already included in the background frame image

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            resolve(blob)
          },
          'image/jpeg',
          0.95
        )
      }

      backgroundImg.src = '/share-frame.png'
    })
  }

  const shareToPlatform = async (
    content,
    type,
    platform,
    url = null,
    onFeedback = null
  ) => {
    try {
      // Handle memes differently - copy raw image with logo overlay
      if (type === 'meme') {
        try {
          // Find the meme image in the DOM
          let foundImage = null
          const possibleSelectors = [
            '.modal img',
            '.modal-content img',
            '[role="dialog"] img',
            '.vfm img',
            '.modal-container img',
            '.popup img',
            '.overlay img',
          ]

          for (const selector of possibleSelectors) {
            const modalImages = document.querySelectorAll(selector)
            for (const img of modalImages) {
              if (img.src && img.naturalWidth > 50) {
                foundImage = img
                break
              }
            }
            if (foundImage) break
          }

          if (!foundImage) {
            const allImages = document.querySelectorAll('img')
            for (let i = allImages.length - 1; i >= 0; i--) {
              const img = allImages[i]
              if (
                img.src &&
                img.naturalWidth > 100 &&
                !img.src.includes('logo') &&
                !img.src.includes('icon')
              ) {
                foundImage = img
                break
              }
            }
          }

          if (!foundImage) {
            onFeedback?.('No meme image found')
            return
          }

          // Fetch the image
          const response = await fetch(foundImage.src)
          const memeBlob = await response.blob()

          // Create canvas with logo overlay
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = foundImage.naturalWidth
          canvas.height = foundImage.naturalHeight

          // Draw original image
          ctx.drawImage(foundImage, 0, 0, canvas.width, canvas.height)

          // Load and draw logo
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'

          const applyLogoAndCopy = async () => {
            try {
              const logoWidth = 158
              const logoHeight = 19
              const logoX = canvas.width - logoWidth - 5
              const logoY = canvas.height - logoHeight - 5

              ctx.globalAlpha = 0.9
              ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight)
              ctx.globalAlpha = 1.0

              // Convert to blob
              const finalBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png', 1.0)
              })

              // Use universal clipboard
              const { useUniversalClipboard } = await import(
                '~/composables/useUniversalClipboard'
              )
              const { copyImageToClipboard } = useUniversalClipboard()

              await copyImageToClipboard(finalBlob, {
                contentType: 'meme',
                onSuccess: (message) => onFeedback?.(message),
                onError: (message) => onFeedback?.(message),
              })
            } catch (error) {
              console.error('Logo overlay failed:', error)
              // Fallback: copy without logo
              const { useUniversalClipboard } = await import(
                '~/composables/useUniversalClipboard'
              )
              const { copyImageToClipboard } = useUniversalClipboard()

              await copyImageToClipboard(memeBlob, {
                contentType: 'meme',
                onSuccess: (message) => onFeedback?.(message),
                onError: (message) => onFeedback?.(message),
              })
            }
          }

          logoImg.onload = applyLogoAndCopy
          logoImg.onerror = async () => {
            // Logo failed, copy without it
            const { useUniversalClipboard } = await import(
              '~/composables/useUniversalClipboard'
            )
            const { copyImageToClipboard } = useUniversalClipboard()

            await copyImageToClipboard(memeBlob, {
              contentType: 'meme',
              onSuccess: (message) => onFeedback?.(message),
              onError: (message) => onFeedback?.(message),
            })
          }

          logoImg.src = '/wakeupnpc-mini.png'
        } catch (error) {
          console.error('Error copying meme:', error)
          onFeedback?.('Error copying meme')
        }
        return
      }

      // For claims and quotes, generate branded image
      const imageBlob = await generateShareImage(content, type)

      if (platform === 'download') {
        // Download the image
        const url = URL.createObjectURL(imageBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wakeupnpc-${type}-${Date.now()}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      // Handle different sharing modes
      if (platform === 'image') {
        // For claims and quotes, use universal clipboard utility
        const { useUniversalClipboard } = await import(
          '~/composables/useUniversalClipboard'
        )
        const { copyImageToClipboard } = useUniversalClipboard()

        await copyImageToClipboard(imageBlob, {
          contentType: type,
          onSuccess: (message) => onFeedback?.(message),
          onError: (message) => onFeedback?.(message),
        })
      } else {
        // Social media mode: try to copy both image and URL, with fallbacks
        if (navigator.clipboard?.write) {
          try {
            // Try HTML clipboard format first (best for social media)
            const htmlContent = `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <img src="data:image/jpeg;base64,${await blobToBase64(
                  imageBlob
                )}" alt="Share content" style="max-width: 100%; height: auto;" />
                <a href="${url}" style="color: #6DD3FF; text-decoration: none; font-family: Arial, sans-serif;">${url}</a>
              </div>
            `

            await navigator.clipboard.write([
              new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' }),
                'text/plain': new Blob([url], { type: 'text/plain' }),
                'image/jpeg': imageBlob,
              }),
            ])

            showToast('Image + link copied!')
          } catch (htmlError) {
            console.warn(
              'HTML clipboard not supported, trying multiple items:',
              htmlError
            )

            try {
              // Fallback: try to copy both image and URL as separate items
              const clipboardItems = []

              // Add the image
              clipboardItems.push(
                new ClipboardItem({ 'image/jpeg': imageBlob })
              )

              // Add the URL text (if available)
              if (url) {
                clipboardItems.push(
                  new ClipboardItem({
                    'text/plain': new Blob([url], { type: 'text/plain' }),
                  })
                )
              }

              // Write both to clipboard
              await navigator.clipboard.write(clipboardItems)
              showToast('Image + link copied!')
            } catch (clipboardError) {
              console.warn(
                'Multiple clipboard items not supported, trying image only:',
                clipboardError
              )

              try {
                // Fallback: try to copy just the image
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/jpeg': imageBlob }),
                ])
                showToast('Image copied')
              } catch (imageError) {
                console.warn(
                  'Image clipboard not supported, trying text only:',
                  imageError
                )

                try {
                  // Final fallback: copy just the URL text
                  await navigator.clipboard.writeText(
                    url || 'Share this content'
                  )
                  showToast('Link copied!')
                } catch (textError) {
                  console.error('All clipboard methods failed:', textError)
                  showToast('Copy failed - try downloading')
                }
              }
            }
          }
        } else {
          // Fallback for browsers without clipboard API: just download
          const downloadUrl = URL.createObjectURL(imageBlob)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = `wakeupnpc-${type}-${Date.now()}.jpg`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(downloadUrl)
          showToast('Image downloaded!')
        }
      }
    } catch (error) {
      console.error('Error sharing content:', error)
    }
  }

  const shareClaim = (claim) => shareToPlatform(claim, 'claim', 'social')
  const shareQuote = (quote) => shareToPlatform(quote, 'quote', 'social')
  const shareMeme = (meme) => shareToPlatform(meme, 'meme', 'social')

  return {
    generateShareImage,
    shareToPlatform,
    shareClaim,
    shareQuote,
    shareMeme,
  }
}
