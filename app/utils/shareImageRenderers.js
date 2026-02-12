// utils/shareImageRenderers.js
// Per-type canvas renderers for share image generation.
// Each renderer draws onto a pre-scaled 2x canvas with the background already applied.

import {
  drawCenteredText,
  wrapText,
  estimateFontSize,
  binarySearchFontSize,
  stripMarkup,
} from '~/utils/canvasHelpers'

// ─── Constants ───────────────────────────────────────────────────────────────
const FONT = 'Barlow Condensed, Arial, sans-serif'
const COLOR_WHITE = '#FFFFFF'
const COLOR_CYAN = '#6DD3FF'

// ─── Quote Renderer ──────────────────────────────────────────────────────────

/**
 * Render a quote onto the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} content - Nuxt Content document
 * @param {{ scale: number, textAreaWidth: number, textAreaHeight: number, centerX: number, centerY: number }} layout
 */
export function renderQuote(ctx, content, layout) {
  const { scale, textAreaWidth, textAreaHeight, centerX, centerY } = layout

  let quoteText = 'Political Quote'
  let authorName = 'Author'

  if (content.headings && content.headings.length > 0) {
    quoteText = content.headings[0]
  }

  if (content.attribution && content.attribution.trim()) {
    const attribution = content.attribution.trim()
    const lastDashIndex = attribution.lastIndexOf(' — ')
    if (lastDashIndex !== -1) {
      authorName = attribution.substring(lastDashIndex + 3).trim()
    } else {
      authorName = attribution
    }
  }

  // Character-count-based font size adjustments
  const charCount = quoteText.length
  let minFontSize = 30 * scale
  let maxFontSize = 81 * scale

  if (charCount >= 25 && charCount <= 40) maxFontSize = 101 * scale
  if (charCount >= 95 && charCount <= 115) maxFontSize = 98 * scale
  if (charCount >= 116 && charCount <= 135) maxFontSize = 93 * scale
  if (charCount >= 200 && charCount <= 279) maxFontSize = 65 * scale
  if (charCount >= 280 && charCount <= 379) maxFontSize = 60 * scale
  if (charCount >= 380 && charCount <= 449) maxFontSize = 52 * scale
  if (charCount >= 450) maxFontSize = 50 * scale

  const optimal = binarySearchFontSize(
    ctx,
    quoteText,
    textAreaWidth,
    textAreaHeight,
    minFontSize,
    maxFontSize,
    '300',
    FONT
  )

  ctx.fillStyle = COLOR_WHITE
  ctx.font = `300 ${optimal.fontSize}px ${FONT}`
  ctx.textAlign = 'center'

  const lines = wrapText(ctx, quoteText, textAreaWidth)
  const totalTextHeight = lines.length * optimal.lineHeight
  const startY = centerY - totalTextHeight / 2

  lines.forEach((line, i) => {
    drawCenteredText(ctx, line, centerX, startY + i * optimal.lineHeight)
  })

  // Author attribution
  if (authorName && authorName !== 'Author' && authorName.trim() !== '') {
    ctx.fillStyle = COLOR_CYAN
    ctx.font = `300 ${optimal.fontSize}px ${FONT}`
    drawCenteredText(
      ctx,
      `— ${authorName}`,
      centerX,
      startY + totalTextHeight + optimal.fontSize * 0.21
    )
  }
}

// ─── Grift Renderer ──────────────────────────────────────────────────────────

/**
 * Render a grift (claim + decode) onto the canvas.
 */
export function renderGrift(ctx, content, layout) {
  const { scale, textAreaWidth, textAreaHeight, centerX, centerY } = layout

  const griftText =
    content.grift ||
    content.meta?.grift ||
    content.claim ||
    content.meta?.claim ||
    content.title ||
    'Political Grift'

  let decodeText =
    content.decode ||
    content.meta?.decode ||
    content.translation ||
    content.meta?.translation ||
    'Decode'

  // Extract just the translation part
  if (decodeText && decodeText.includes(' - ')) {
    const dashIndex = decodeText.indexOf(' - ')
    if (dashIndex !== -1) {
      decodeText = decodeText.substring(dashIndex + 3).trim()
    }
  }

  const logoSafetyMargin = 100 * scale
  const maxUsableHeight = textAreaHeight - logoSafetyMargin
  const targetHeight = (maxUsableHeight * 2) / 3

  const estimatedFontSize = targetHeight / 5.5
  const baseFontSize = Math.max(80 * scale, Math.floor(estimatedFontSize))

  const griftOpt = estimateFontSize(
    baseFontSize,
    griftText.length,
    textAreaWidth,
    maxUsableHeight
  )
  const decodeOpt = estimateFontSize(
    baseFontSize,
    decodeText.length,
    textAreaWidth,
    maxUsableHeight
  )

  const unifiedFontSize = Math.min(griftOpt.fontSize, decodeOpt.fontSize)
  const unifiedLineHeight = Math.min(griftOpt.lineHeight, decodeOpt.lineHeight)

  // Word wrap both blocks
  ctx.fillStyle = '#ffffff'
  ctx.font = `100 ${unifiedFontSize}px ${FONT}`
  ctx.textAlign = 'center'

  const griftLines = wrapText(ctx, griftText, textAreaWidth)
  const decodeLines = wrapText(ctx, decodeText, textAreaWidth)

  const textGap = unifiedFontSize * 1.0
  const ascentHeight = unifiedFontSize * 0.75
  const descentHeight = unifiedFontSize * 0.25

  const griftVisualHeight =
    ascentHeight + (griftLines.length - 1) * unifiedLineHeight + descentHeight
  const decodeVisualHeight =
    ascentHeight + (decodeLines.length - 1) * unifiedLineHeight + descentHeight

  const totalContentHeight = griftVisualHeight + textGap + decodeVisualHeight
  const blockStartY = centerY - totalContentHeight / 2
  const griftStartY = blockStartY + ascentHeight
  const griftVisualEnd = blockStartY + griftVisualHeight
  const decodeStartY = griftVisualEnd + textGap + ascentHeight
  const lineY = griftVisualEnd + textGap / 2

  // Draw grift lines
  griftLines.forEach((line, i) => {
    drawCenteredText(ctx, line, centerX, griftStartY + i * unifiedLineHeight)
  })

  // Draw horizontal rule
  const ruleHeight = 3 * scale
  const canvasHeight = ctx.canvas.height
  if (lineY > 0 && lineY < canvasHeight) {
    ctx.fillStyle = COLOR_CYAN
    ctx.globalAlpha = 0.5
    const ruleWidth = textAreaWidth * 0.8
    ctx.fillRect(
      centerX - ruleWidth / 2,
      lineY - ruleHeight / 2,
      ruleWidth,
      ruleHeight
    )
    ctx.globalAlpha = 1
  }

  // Draw decode lines
  ctx.fillStyle = '#ffffff'
  decodeLines.forEach((line, i) => {
    drawCenteredText(ctx, line, centerX, decodeStartY + i * unifiedLineHeight)
  })
}

// ─── Meme Renderer ───────────────────────────────────────────────────────────

/**
 * Render a meme text overlay onto the canvas.
 */
export function renderMeme(ctx, content, layout) {
  const { scale, textAreaWidth, centerX, centerY } = layout

  const memeText = content.title || content.description || 'Political Meme'

  ctx.fillStyle = '#ffffff'
  ctx.font = `100 ${70 * scale}px ${FONT}`
  ctx.textAlign = 'center'

  const lines = wrapText(ctx, memeText, textAreaWidth)
  const lineHeight = 60 * scale
  const totalTextHeight = lines.length * lineHeight
  const startY = centerY - totalTextHeight / 2

  lines.forEach((line, i) => {
    drawCenteredText(ctx, line, centerX, startY + i * lineHeight)
  })
}

// ─── Profile Renderer ────────────────────────────────────────────────────────

/**
 * Render a profile (image + name + bio) onto the canvas.
 */
export async function renderProfile(ctx, content, layout) {
  const { scale, textAreaWidth, textAreaHeight, centerX, paddingY } = layout

  const profileName = content.meta?.profile || content.profile || 'Profile'
  const bioText = content.bio || content.description || ''
  const status = content.meta?.status || content.status || ''

  const profileImageSize = 308 * scale
  const profileImageY = paddingY - 30 * scale

  // Load and draw profile image
  if (content.imagePath) {
    try {
      await _drawProfileImage(ctx, content.imagePath, {
        centerX,
        profileImageY,
        profileImageSize,
        status,
        scale,
      })
    } catch (error) {
      console.warn(
        'Profile image loading failed, continuing without image:',
        error
      )
    }
  }

  // Calculate text area below image
  const textStartY = profileImageY + profileImageSize + 25 * scale
  const canvasHeight = ctx.canvas.height
  const remainingHeight = canvasHeight - textStartY - paddingY

  // Clean profile name
  let cleanName = profileName
  if (cleanName.toLowerCase().startsWith('img ')) {
    cleanName = cleanName.substring(4).trim()
  } else if (cleanName.toLowerCase().startsWith('img')) {
    cleanName = cleanName.substring(3).trim()
  }

  // Draw profile name
  const nameFontSize = 81 * scale
  ctx.fillStyle = COLOR_WHITE
  ctx.font = `300 ${nameFontSize}px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  drawCenteredText(ctx, cleanName.toUpperCase(), centerX, textStartY)

  // Draw bio text
  if (bioText) {
    const cleanBio = stripMarkup(bioText)
    const bioStartY = textStartY + nameFontSize + 30 * scale
    const bioAreaHeight = remainingHeight - (bioStartY - textStartY)

    const bioOptimal = binarySearchFontSize(
      ctx,
      cleanBio,
      textAreaWidth,
      bioAreaHeight,
      30 * scale,
      51 * scale,
      '300',
      FONT
    )

    ctx.fillStyle = '#E5E5E5'
    ctx.font = `300 ${bioOptimal.fontSize}px ${FONT}`

    const bioLines = wrapText(ctx, cleanBio, textAreaWidth)
    const maxBioLines = Math.floor(bioAreaHeight / bioOptimal.lineHeight)
    const linesToDraw = bioLines.slice(0, maxBioLines)

    linesToDraw.forEach((line, i) => {
      drawCenteredText(
        ctx,
        line,
        centerX,
        bioStartY + i * bioOptimal.lineHeight
      )
    })
  }
}

// ─── Private: Profile Image Drawing ──────────────────────────────────────────

function _drawProfileImage(ctx, imagePath, opts) {
  const { centerX, profileImageY, profileImageSize, status, scale } = opts

  return new Promise((resolve, reject) => {
    const profileImg = new Image()
    profileImg.crossOrigin = 'anonymous'

    const imageTimeout = setTimeout(() => {
      reject(new Error('Profile image load timeout'))
    }, 5000)

    profileImg.onload = () => {
      clearTimeout(imageTimeout)
      try {
        // Circular clip
        ctx.save()
        ctx.beginPath()
        ctx.arc(
          centerX,
          profileImageY + profileImageSize / 2,
          profileImageSize / 2,
          0,
          Math.PI * 2
        )
        ctx.closePath()
        ctx.clip()

        // Object-fit: cover
        const imgAspect = profileImg.width / profileImg.height
        let drawWidth, drawHeight, drawX, drawY

        if (imgAspect > 1) {
          drawHeight = profileImageSize
          drawWidth = drawHeight * imgAspect
          drawX = centerX - drawWidth / 2
          drawY = profileImageY
        } else {
          drawWidth = profileImageSize
          drawHeight = drawWidth / imgAspect
          drawX = centerX - drawWidth / 2
          drawY = profileImageY + (profileImageSize - drawHeight) / 2
        }

        ctx.drawImage(profileImg, drawX, drawY, drawWidth, drawHeight)
        ctx.restore()

        // Hero/zero badge
        _drawStatusBadge(ctx, {
          centerX,
          profileImageY,
          profileImageSize,
          status,
          scale,
        })

        resolve()
      } catch (drawError) {
        console.warn('Error drawing profile image:', drawError)
        ctx.restore()
        resolve()
      }
    }

    profileImg.onerror = (error) => {
      clearTimeout(imageTimeout)
      console.warn('Failed to load profile image:', error)
      reject(error)
    }

    profileImg.src = imagePath
  })
}

function _drawStatusBadge(ctx, opts) {
  const { centerX, profileImageY, profileImageSize, status, scale } = opts

  const badgeSize = 48 * scale
  const badgeX =
    centerX + (profileImageSize / 2) * Math.cos(Math.PI / 4) - badgeSize / 2
  const badgeY =
    profileImageY +
    profileImageSize / 2 +
    (profileImageSize / 2) * Math.sin(Math.PI / 4) -
    badgeSize / 2

  const gradient = ctx.createRadialGradient(
    badgeX + badgeSize / 2,
    badgeY + badgeSize / 2,
    0,
    badgeX + badgeSize / 2,
    badgeY + badgeSize / 2,
    badgeSize / 2
  )

  if (status === 'hero') {
    gradient.addColorStop(0, '#00e300')
    gradient.addColorStop(1, '#007800')
  } else {
    gradient.addColorStop(0, '#ff0a0a')
    gradient.addColorStop(1, '#7d0000')
  }

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(
    badgeX + badgeSize / 2,
    badgeY + badgeSize / 2,
    badgeSize / 2,
    0,
    Math.PI * 2
  )
  ctx.fill()

  // Draw check mark or X
  ctx.strokeStyle = COLOR_WHITE
  ctx.lineWidth = 5 * scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const iconSize = badgeSize * 0.5
  const iconCX = badgeX + badgeSize / 2
  const iconCY = badgeY + badgeSize / 2

  if (status === 'hero') {
    ctx.beginPath()
    ctx.moveTo(iconCX - iconSize * 0.3, iconCY)
    ctx.lineTo(iconCX - iconSize * 0.05, iconCY + iconSize * 0.3)
    ctx.lineTo(iconCX + iconSize * 0.35, iconCY - iconSize * 0.3)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(iconCX - iconSize * 0.3, iconCY - iconSize * 0.3)
    ctx.lineTo(iconCX + iconSize * 0.3, iconCY + iconSize * 0.3)
    ctx.moveTo(iconCX + iconSize * 0.3, iconCY - iconSize * 0.3)
    ctx.lineTo(iconCX - iconSize * 0.3, iconCY + iconSize * 0.3)
    ctx.stroke()
  }
}
