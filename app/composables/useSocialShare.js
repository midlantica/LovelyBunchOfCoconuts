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
      // RENDER AT 2X RESOLUTION to eliminate text anti-aliasing artifacts
      const scale = 2
      const finalWidth = 1600 // 16:9 ratio - OPTIMAL for Twitter/Facebook!
      const finalHeight = 900

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas to 2x size for high-res rendering
      canvas.width = finalWidth * scale
      canvas.height = finalHeight * scale

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Load and use YOUR prepared share-frame.png
      const backgroundImg = new Image()
      backgroundImg.crossOrigin = 'anonymous'
      backgroundImg.onload = () => {
        // Draw your prepared background image at 2x size
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)

        // No inner frame - use full canvas with padding
        const paddingX = 80 * scale // Padding from left/right edges
        const paddingY = 60 * scale // Padding from top/bottom edges (extra bottom for logo)
        const textAreaWidth = canvas.width - paddingX * 2
        const textAreaHeight = canvas.height - paddingY * 2

        // Calculate the center point of the full canvas
        const centerX = canvas.width / 2
        const centerY = (canvas.height - 60 * scale) / 2 // Slightly higher to account for logo space

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

          // Calculate optimal font size for quote text - MUCH BIGGER for 16:9
          const quoteOptimalSize = calculateOptimalFontSize(
            90 * scale, // Base font size - INCREASED for wider format
            quoteText.length,
            textAreaWidth, // Use full text area width
            textAreaHeight // Use full text area height
          )

          // Quote text (all white as requested) - smart sizing for mobile readability
          ctx.fillStyle = '#ffffff'
          ctx.font = `100 ${quoteOptimalSize.fontSize}px Barlow Condensed, Arial, sans-serif`
          ctx.textAlign = 'center'

          // Word wrap for quote - use full width
          const words = quoteText.split(' ')
          const lines = []
          let currentLine = words[0]
          const maxWidth = textAreaWidth

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
            // Calculate optimal size for author (smaller than quote text) - BIGGER
            const authorOptimalSize = calculateOptimalFontSize(
              65 * scale, // Base author font size - INCREASED
              authorName.length,
              textAreaWidth, // Use full text area width
              textAreaHeight // Use full text area height
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
        } else if (type === 'grift') {
          // Grift layout centered on inner frame center
          // Check multiple possible locations for grift/decode data
          const griftText =
            content.grift ||
            content.meta?.grift ||
            content.claim ||
            content.meta?.claim ||
            content.title ||
            'Political Grift'
          const decodeText =
            content.decode ||
            content.meta?.decode ||
            content.translation ||
            content.meta?.translation ||
            'Decode'

          // Extract just the translation part (remove claim + dash if present)
          let cleanDecodeText = decodeText
          if (decodeText && decodeText.includes(' - ')) {
            // Find the first " - " and take everything after it
            const dashIndex = decodeText.indexOf(' - ')
            if (dashIndex !== -1) {
              cleanDecodeText = decodeText.substring(dashIndex + 3).trim()
            }
          }

          // EQUAL SIZING: Calculate for longest text, use for both
          // Goal: Fill about 2/3 of vertical space with text (4 lines total: 2 grift + 2 decode)
          // Layout: grift (2 lines) + gap + line + gap + decode (2 lines)
          // Calculate maximum usable height (leaving margin for logo at bottom)
          const logoSafetyMargin = 100 * scale // Extra margin from bottom to avoid logo
          const maxUsableHeight = textAreaHeight - logoSafetyMargin
          const targetHeight = (maxUsableHeight * 2) / 3 // Target 2/3 of available space

          // For 4 lines of text with gaps and line:
          // visualHeight ≈ fontSize * 5.125 (calculated from ascent + 3*lineHeight + descent)
          // plus gaps and line height
          // Estimate: fontSize * 5.5 (accounting for gaps and line)
          const estimatedFontSize = targetHeight / 5.5
          const baseFontSize = Math.max(
            80 * scale,
            Math.floor(estimatedFontSize)
          )

          // Calculate optimal size for GRIFT text
          const griftOptimalSize = calculateOptimalFontSize(
            baseFontSize,
            griftText.length,
            textAreaWidth, // Full width
            maxUsableHeight // Full available height
          )

          // Calculate optimal size for DECODE text
          const decodeOptimalSize = calculateOptimalFontSize(
            baseFontSize,
            cleanDecodeText.length,
            textAreaWidth, // Full width
            maxUsableHeight // Full available height
          )

          // Use the SMALLER of the two sizes for BOTH texts (so both fit)
          const unifiedFontSize = Math.min(
            griftOptimalSize.fontSize,
            decodeOptimalSize.fontSize
          )
          const unifiedLineHeight = Math.min(
            griftOptimalSize.lineHeight,
            decodeOptimalSize.lineHeight
          )

          // WORD WRAP for Grift text
          ctx.fillStyle = '#ffffff'
          ctx.font = `100 ${unifiedFontSize}px Barlow Condensed, Arial, sans-serif`
          ctx.textAlign = 'center'

          const griftWords = griftText.split(' ')
          const griftLines = []
          let currentGriftLine = griftWords[0]

          for (let i = 1; i < griftWords.length; i++) {
            const word = griftWords[i]
            const width = ctx.measureText(currentGriftLine + ' ' + word).width
            if (width < textAreaWidth) {
              currentGriftLine += ' ' + word
            } else {
              griftLines.push(currentGriftLine)
              currentGriftLine = word
            }
          }
          griftLines.push(currentGriftLine)

          // WORD WRAP for Decode text (do this BEFORE calculating heights)
          const decodeWords = cleanDecodeText.split(' ')
          const decodeLines = []
          let currentDecodeLine = decodeWords[0]

          for (let i = 1; i < decodeWords.length; i++) {
            const word = decodeWords[i]
            const width = ctx.measureText(currentDecodeLine + ' ' + word).width
            if (width < textAreaWidth) {
              currentDecodeLine += ' ' + word
            } else {
              decodeLines.push(currentDecodeLine)
              currentDecodeLine = word
            }
          }
          decodeLines.push(currentDecodeLine)

          // Gap between the two text blocks (1rem equivalent - doubled for more breathing room)
          const textGap = unifiedFontSize * 1.0

          // For positioning: calculate actual visual bounds accounting for ascenders/descenders
          // First line visual top: baseline - ascender (≈ fontSize * 0.75)
          // Last line visual bottom: baseline + descender (≈ fontSize * 0.25)
          const ascentHeight = unifiedFontSize * 0.75
          const descentHeight = unifiedFontSize * 0.25

          // Actual visual height of N lines = ascent + (N-1)*lineHeight + descent
          const griftVisualHeight =
            ascentHeight +
            (griftLines.length - 1) * unifiedLineHeight +
            descentHeight
          const decodeVisualHeight =
            ascentHeight +
            (decodeLines.length - 1) * unifiedLineHeight +
            descentHeight

          // Total content height including gap
          const totalContentHeight =
            griftVisualHeight + textGap + decodeVisualHeight

          // Center the content block vertically
          // blockStartY is the visual TOP of the grift text block (not baseline, but actual top)
          const blockStartY = centerY - totalContentHeight / 2

          // POSITION THE TEXTS
          // blockStartY is visual top, so first line baseline is offset by ascent
          const griftStartY = blockStartY + ascentHeight

          // Calculate where grift text visually ends
          const griftVisualEnd = blockStartY + griftVisualHeight

          // Decode starts after the gap
          const decodeStartY = griftVisualEnd + textGap + ascentHeight

          // Line centered in the gap
          const lineY = griftVisualEnd + textGap / 2

          // Draw grift lines
          griftLines.forEach((line, index) => {
            drawCenteredText(
              ctx,
              line,
              centerX,
              griftStartY + index * unifiedLineHeight
            )
          })

          // Draw horizontal rule at the calculated line position
          const ruleHeight = 3 * scale

          // Ensure line is within canvas bounds
          if (lineY > 0 && lineY < canvas.height) {
            ctx.fillStyle = '#6DD3FF'
            ctx.globalAlpha = 0.5
            const ruleWidth = textAreaWidth * 0.8
            ctx.fillRect(
              centerX - ruleWidth / 2,
              lineY - ruleHeight / 2,
              ruleWidth,
              ruleHeight
            )
            ctx.globalAlpha = 1
          } else {
            console.warn('Line Y position out of bounds:', lineY)
          }

          // Draw decode lines - WHITE color!
          ctx.fillStyle = '#ffffff'
          decodeLines.forEach((line, index) => {
            drawCenteredText(
              ctx,
              line,
              centerX,
              decodeStartY + index * unifiedLineHeight
            )
          })
        } else if (type === 'meme') {
          // Meme layout - fills entire inner panel but stays within bounds
          const memeText =
            content.title || content.description || 'Political Meme'

          // For now, just show text - scaled by 2x
          ctx.fillStyle = '#ffffff'
          ctx.font = `100 ${70 * scale}px Barlow Condensed, Arial, sans-serif`
          ctx.textAlign = 'center'

          // Word wrap for meme text - use full width
          const words = memeText.split(' ')
          const lines = []
          let currentLine = words[0]
          const maxWidth = textAreaWidth

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

          // Draw meme text centered on inner frame center - scaled by 2x
          const lineHeight = 60 * scale
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

        // Scale down the high-res canvas to final size for smooth anti-aliasing
        const finalCanvas = document.createElement('canvas')
        const finalCtx = finalCanvas.getContext('2d')
        finalCanvas.width = finalWidth
        finalCanvas.height = finalHeight

        // Enable smoothing for the scale-down operation
        finalCtx.imageSmoothingEnabled = true
        finalCtx.imageSmoothingQuality = 'high'

        // Draw the 2x canvas scaled down to 1x
        finalCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight)

        // Export the final 1080x1080 image
        finalCanvas.toBlob(
          (blob) => {
            resolve(blob)
          },
          'image/png',
          1.0
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
          // Find the meme image in the DOM with timeout
          const findImagePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Image search timeout'))
            }, 3000)

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
                if (img.src && img.naturalWidth > 50 && img.complete) {
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
                  !img.src.includes('icon') &&
                  img.complete
                ) {
                  foundImage = img
                  break
                }
              }
            }

            clearTimeout(timeout)
            if (foundImage) {
              resolve(foundImage)
            } else {
              reject(new Error('No meme image found'))
            }
          })

          const foundImage = await findImagePromise

          // Fetch the image with timeout
          const controller = new AbortController()
          const fetchTimeout = setTimeout(() => controller.abort(), 5000)

          const response = await fetch(foundImage.src, {
            signal: controller.signal,
          })
          clearTimeout(fetchTimeout)

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`)
          }

          const memeBlob = await response.blob()

          // Create canvas with logo overlay
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d', { willReadFrequently: false })

          if (!ctx) {
            throw new Error('Failed to get canvas context')
          }

          canvas.width = foundImage.naturalWidth
          canvas.height = foundImage.naturalHeight

          // Draw original image
          ctx.drawImage(foundImage, 0, 0, canvas.width, canvas.height)

          // Load and draw logo with timeout
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

              // Convert to blob with timeout
              const finalBlob = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error('Canvas to blob timeout'))
                }, 5000)

                canvas.toBlob(
                  (blob) => {
                    clearTimeout(timeout)
                    if (blob) {
                      resolve(blob)
                    } else {
                      reject(new Error('Failed to create blob from canvas'))
                    }
                  },
                  'image/png',
                  1.0
                )
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
              try {
                const { useUniversalClipboard } = await import(
                  '~/composables/useUniversalClipboard'
                )
                const { copyImageToClipboard } = useUniversalClipboard()

                await copyImageToClipboard(memeBlob, {
                  contentType: 'meme',
                  onSuccess: (message) => onFeedback?.(message),
                  onError: (message) => onFeedback?.(message),
                })
              } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError)
                onFeedback?.('Error copying meme')
              }
            }
          }

          // Set up logo load with timeout
          const logoLoadPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Logo load timeout'))
            }, 3000)

            logoImg.onload = () => {
              clearTimeout(timeout)
              resolve()
            }
            logoImg.onerror = (error) => {
              clearTimeout(timeout)
              reject(error)
            }
          })

          logoImg.src = '/wakeupnpc-mini.png'

          try {
            await logoLoadPromise
            await applyLogoAndCopy()
          } catch (logoError) {
            console.warn('Logo load failed, copying without logo:', logoError)
            // Logo failed, copy without it
            try {
              const { useUniversalClipboard } = await import(
                '~/composables/useUniversalClipboard'
              )
              const { copyImageToClipboard } = useUniversalClipboard()

              await copyImageToClipboard(memeBlob, {
                contentType: 'meme',
                onSuccess: (message) => onFeedback?.(message),
                onError: (message) => onFeedback?.(message),
              })
            } catch (fallbackError) {
              console.error('Fallback copy failed:', fallbackError)
              onFeedback?.('Error copying meme')
            }
          }
        } catch (error) {
          console.error('Error copying meme:', error)
          onFeedback?.(error.message || 'Error copying meme')
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
                'image/png': imageBlob,
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
              clipboardItems.push(new ClipboardItem({ 'image/png': imageBlob }))

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
                  new ClipboardItem({ 'image/png': imageBlob }),
                ])
                showToast('Image copied 😀')
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
          a.download = `wakeupnpc-${type}-${Date.now()}.png`
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
