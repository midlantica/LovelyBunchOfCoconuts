// Plugin to transform meme content and detect YouTube URLs
export default defineNuxtPlugin(() => {
  // Helper function to extract YouTube URL from markdown content
  function extractYouTubeUrl(content) {
    if (!content) return null

    // Match YouTube URLs in markdown links: [text](youtube_url)
    const markdownLinkRegex =
      /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w\-&=?]+)\)/g
    const match = markdownLinkRegex.exec(content)
    if (match) {
      console.log('🎬 Found YouTube URL in markdown link:', match[2])
      return match[2]
    }

    // Match standalone YouTube URLs
    const standaloneRegex =
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w\-&=?]+/g
    const standaloneMatch = standaloneRegex.exec(content)
    if (standaloneMatch) {
      console.log('🎬 Found standalone YouTube URL:', standaloneMatch[0])
      return standaloneMatch[0]
    }

    return null
  }

  // Helper function to get YouTube thumbnail
  function getYouTubeThumbnail(url) {
    try {
      let videoId = ''

      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0]
      } else if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0]
      }

      if (videoId) {
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        console.log('🖼️ Generated thumbnail:', thumbnail)
        return thumbnail
      }
    } catch (error) {
      console.error('Error generating YouTube thumbnail:', error)
    }

    return ''
  }

  // Function to transform meme content
  function transformMemeContent(meme) {
    if (!meme || meme._transformed) return meme

    console.log('🔄 Transforming meme:', meme.title)

    // Get the raw content for YouTube detection
    let rawContent = ''

    // Try to get content from different possible sources
    if (meme.body?.children) {
      rawContent = meme.body.children
        .map((child) => {
          if (child.type === 'text') return child.value
          if (child.type === 'element' && child.tag === 'a') {
            return `[${child.children?.[0]?.value || ''}](${
              child.props?.href || ''
            })`
          }
          return ''
        })
        .join(' ')
    } else if (meme.body?.value) {
      rawContent = meme.body.value
    } else if (meme.bodyText) {
      rawContent = meme.bodyText
    }

    console.log(
      '📝 Raw content for YouTube detection:',
      rawContent.substring(0, 200)
    )

    // Check for YouTube URLs
    const youtubeUrl = extractYouTubeUrl(rawContent)

    if (youtubeUrl) {
      console.log('✅ YouTube URL found, setting video properties')
      meme.isVideo = true
      meme.youtubeUrl = youtubeUrl
      meme.image = getYouTubeThumbnail(youtubeUrl)
    } else {
      console.log('❌ No YouTube URL found')
      meme.isVideo = false
      meme.youtubeUrl = ''
      meme.image = meme.image || ''
    }

    console.log('🎯 Final meme data:', {
      title: meme.title,
      isVideo: meme.isVideo,
      youtubeUrl: meme.youtubeUrl,
      image: meme.image,
    })

    // Mark as transformed to avoid re-processing
    meme._transformed = true

    return meme
  }

  // Make the transformer available globally
  return {
    provide: {
      transformMemeContent,
    },
  }
})
