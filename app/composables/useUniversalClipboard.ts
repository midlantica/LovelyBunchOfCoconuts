// composables/useUniversalClipboard.ts
// Universal clipboard utility that works across all browsers and platforms

interface CopyImageOptions {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  contentType?: string
  filename?: string | null
  maxRetries?: number
}

interface CopyTextOptions {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export function useUniversalClipboard() {
  // Detect platform with more comprehensive checks
  const isMobile = (): boolean => {
    if (typeof navigator === 'undefined') return false
    const ua =
      navigator.userAgent ||
      (navigator as any).vendor ||
      (window as any).opera ||
      ''
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        ua
      ) ||
      (window.innerWidth <= 768 && window.innerHeight <= 1024) ||
      ('ontouchstart' in window && window.innerWidth <= 1024)
    )
  }

  const isIOS = (): boolean => {
    if (typeof navigator === 'undefined') return false
    const ua =
      navigator.userAgent ||
      (navigator as any).vendor ||
      (window as any).opera ||
      ''
    return (
      /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  }

  const isSafari = (): boolean => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent || ''
    return (
      /^((?!chrome|android).)*safari/i.test(ua) &&
      !(window as any).chrome &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
    )
  }

  const isWindows = (): boolean => {
    if (typeof navigator === 'undefined') return false
    return /Win/i.test(navigator.platform || navigator.userAgent)
  }

  // Convert blob to data URL with timeout protection
  const blobToDataURL = (blob: Blob, timeoutMs = 5000): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      const timeout = setTimeout(() => {
        reader.abort()
        reject(new Error('Blob conversion timeout'))
      }, timeoutMs)

      reader.onload = () => {
        clearTimeout(timeout)
        resolve(reader.result as string)
      }
      reader.onerror = () => {
        clearTimeout(timeout)
        reject(reader.error)
      }
      reader.readAsDataURL(blob)
    })
  }

  // Helper to create image with retry and timeout
  const loadImageFromDataURL = (
    dataUrl: string,
    timeoutMs = 5000
  ): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, timeoutMs)

      img.onload = () => {
        clearTimeout(timeout)
        resolve(img)
      }
      img.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }
      img.src = dataUrl
    })
  }

  // Convert canvas to blob with timeout protection
  const canvasToBlob = (
    canvas: HTMLCanvasElement,
    type = 'image/png',
    quality = 1.0
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
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
        type,
        quality
      )
    })
  }

  // Copy image blob to clipboard with universal compatibility and retry logic
  const copyImageToClipboard = async (
    imageBlob: Blob,
    options: CopyImageOptions = {}
  ): Promise<boolean> => {
    const {
      onSuccess,
      onError,
      contentType = 'image',
      filename = null,
      maxRetries = 2,
    } = options

    let lastError: unknown = null

    // Try up to maxRetries times
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait a bit before retry
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
        }

        // Strategy 1: Modern Clipboard API with PNG conversion
        if (navigator.clipboard && navigator.clipboard.write) {
          try {
            // Convert to PNG for better clipboard compatibility
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: false })

            if (!ctx) {
              throw new Error('Failed to get canvas context')
            }

            // Use data URL instead of blob URL to avoid CSP issues
            const dataUrl = await blobToDataURL(imageBlob)
            const img = await loadImageFromDataURL(dataUrl)

            canvas.width = img.naturalWidth || img.width
            canvas.height = img.naturalHeight || img.height

            // Draw image
            ctx.drawImage(img, 0, 0)

            // Convert to PNG blob
            const pngBlob = await canvasToBlob(canvas, 'image/png', 1.0)

            // Safari/iOS specific handling
            if (isSafari() || isIOS()) {
              // Safari prefers specific MIME types
              const clipboardItem = new ClipboardItem({
                'image/png': pngBlob,
              })
              await navigator.clipboard.write([clipboardItem])
            } else {
              // Chrome/Firefox - try multiple formats
              try {
                const clipboardItem = new ClipboardItem({
                  'image/png': pngBlob,
                })
                await navigator.clipboard.write([clipboardItem])
              } catch {
                // Fallback: try with just PNG
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': pngBlob }),
                ])
              }
            }

            onSuccess?.('Image copied 😀')
            return true
          } catch (clipboardError) {
            console.warn(
              `Clipboard API attempt ${attempt + 1} failed:`,
              clipboardError
            )
            lastError = clipboardError
            // Fall through to retry or next strategy
            if (attempt < maxRetries) continue
          }
        }

        // Strategy 2: Mobile - Use Web Share API or download
        if (isMobile()) {
          try {
            if (navigator.share) {
              const fileName = filename || `wakeupnpc-${contentType}.png`
              const file = new File([imageBlob], fileName, {
                type: 'image/png',
                lastModified: Date.now(),
              })

              // Check if sharing files is supported
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'WakeUpNPC Content',
                  text: 'Share from WakeUpNPC',
                  files: [file],
                })
                onSuccess?.('Shared!')
                return true
              }
            }

            // Fallback: Download
            const url = URL.createObjectURL(imageBlob)
            const a = document.createElement('a')
            a.href = url
            a.download =
              filename || `wakeupnpc-${contentType}-${Date.now()}.png`
            a.style.display = 'none'
            document.body.appendChild(a)

            // Trigger download
            a.click()

            // Cleanup
            setTimeout(() => {
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }, 100)

            onSuccess?.('Image downloaded!')
            return true
          } catch (mobileError) {
            console.warn('Mobile sharing failed:', mobileError)
            lastError = mobileError
          }
        }

        // Strategy 3: Desktop fallback - Download with instructions
        const url = URL.createObjectURL(imageBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename || `wakeupnpc-${contentType}-${Date.now()}.png`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)

        const message = isWindows()
          ? 'Image downloaded - right-click file to copy'
          : 'Image downloaded!'
        onSuccess?.(message)
        return true
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error)
        lastError = error
        if (attempt < maxRetries) continue
      }
    }

    // All attempts failed
    console.error('All clipboard strategies failed:', lastError)
    const errorMessage = isMobile()
      ? 'Copy failed - image downloaded instead'
      : isWindows()
        ? 'Copy failed - image downloaded (right-click to copy)'
        : 'Copy failed - image downloaded'
    onError?.(errorMessage)
    return false
  }

  // Copy text to clipboard (for URLs, etc.)
  const copyTextToClipboard = async (
    text: string,
    options: CopyTextOptions = {}
  ): Promise<boolean> => {
    const { onSuccess, onError } = options

    try {
      // Strategy 1: Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        onSuccess?.('Copied!')
        return true
      }

      // Strategy 2: Legacy execCommand (Windows fallback)
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.setAttribute('readonly', '')
      textArea.setAttribute('aria-hidden', 'true')

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, textArea.value.length)

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        onSuccess?.('Copied!')
        return true
      }

      throw new Error('execCommand failed')
    } catch (error) {
      console.error('Text clipboard failed:', error)
      onError?.('Copy failed - please try manually')
      return false
    }
  }

  return {
    copyImageToClipboard,
    copyTextToClipboard,
    isMobile,
    isIOS,
    isSafari,
  }
}
