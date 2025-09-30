// composables/useUniversalClipboard.js
// Universal clipboard utility that works across all browsers and platforms

export function useUniversalClipboard() {
  // Detect platform
  const isMobile = () => {
    if (typeof navigator === 'undefined') return false
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      (window.innerWidth <= 768 && window.innerHeight <= 1024)
    )
  }

  const isIOS = () => {
    if (typeof navigator === 'undefined') return false
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  const isSafari = () => {
    if (typeof navigator === 'undefined') return false
    return (
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      !window.chrome
    )
  }

  // Convert blob to data URL (avoiding blob: URLs that CSP blocks)
  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Copy image blob to clipboard with universal compatibility
  const copyImageToClipboard = async (imageBlob, options = {}) => {
    const { onSuccess, onError, contentType = 'image' } = options

    try {
      // Strategy 1: Modern Clipboard API with PNG conversion (best compatibility)
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          // Convert to PNG for better clipboard compatibility
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()

          // Use data URL instead of blob URL to avoid CSP issues
          const dataUrl = await blobToDataURL(imageBlob)

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = dataUrl
          })

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Convert to PNG blob
          const pngBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png', 1.0)
          })

          if (!pngBlob) {
            throw new Error('Failed to create PNG blob')
          }

          // Try to copy PNG
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob }),
          ])

          onSuccess?.('Image copied!')
          return true
        } catch (clipboardError) {
          console.warn('Clipboard API failed:', clipboardError)
          // Fall through to next strategy
        }
      }

      // Strategy 2: Mobile - Use Web Share API or download
      if (isMobile()) {
        try {
          if (navigator.share && navigator.canShare) {
            const file = new File([imageBlob], `wakeupnpc-${contentType}.png`, {
              type: 'image/png',
            })

            if (navigator.canShare({ files: [file] })) {
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
          a.download = `wakeupnpc-${contentType}-${Date.now()}.png`
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          onSuccess?.('Image downloaded!')
          return true
        } catch (mobileError) {
          console.warn('Mobile sharing failed:', mobileError)
        }
      }

      // Strategy 3: Desktop fallback - Download with instructions
      const url = URL.createObjectURL(imageBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wakeupnpc-${contentType}-${Date.now()}.png`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onError?.('Image downloaded - right-click file to copy')
      return false
    } catch (error) {
      console.error('All clipboard strategies failed:', error)
      onError?.(
        isMobile()
          ? 'Copy failed - try long-press image'
          : 'Copy failed - try right-click > Copy Image'
      )
      return false
    }
  }

  // Copy text to clipboard (for URLs, etc.)
  const copyTextToClipboard = async (text, options = {}) => {
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
