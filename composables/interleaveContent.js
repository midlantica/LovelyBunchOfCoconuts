// composables/interleaveContent.js

export function interleaveContent(claims, quotes, memes) {
  console.log('📊 INPUT COUNTS:', {
    claims: claims.length,
    quotes: quotes.length,
    memes: memes.length,
  })

  // Create copies to avoid mutating original arrays
  const claimsCopy = [...claims]
  const quotesCopy = [...quotes]
  const memesCopy = [...memes]

  const output = []
  let patternIndex = 0 // Track position in pattern cycle

  // Pattern: [ claim | claim ] → [ ---quote--- ] → [ meme | meme ] → [ ---quote--- ] (repeating)
  const pattern = ['claimPair', 'quote', 'memeRow', 'quote']

  // Simple counting logic: continue pattern until we can't make complete pattern items
  while (true) {
    const currentPatternType = pattern[patternIndex % pattern.length]
    let patternItemCreated = false

    // Check if we can create the current pattern item
    if (currentPatternType === 'claimPair') {
      if (claimsCopy.length >= 2) {
        output.push({
          type: 'claimPair',
          data: claimsCopy.splice(0, 2),
        })
        console.log(`✅ Created claimPair (${output.length})`)
        patternItemCreated = true
      } else {
        console.log(
          `❌ Cannot create claimPair - only ${claimsCopy.length} claims left`
        )
      }
    } else if (currentPatternType === 'quote') {
      if (quotesCopy.length >= 1) {
        output.push({
          type: 'quote',
          data: quotesCopy.splice(0, 1)[0],
        })
        console.log(`✅ Created quote (${output.length})`)
        patternItemCreated = true
      } else {
        console.log(`❌ Cannot create quote - no quotes left`)
      }
    } else if (currentPatternType === 'memeRow') {
      if (memesCopy.length >= 2) {
        output.push({
          type: 'memeRow',
          data: memesCopy.splice(0, 2),
        })
        console.log(`✅ Created memeRow (${output.length})`)
        patternItemCreated = true
      } else {
        console.log(
          `❌ Cannot create memeRow - only ${memesCopy.length} memes left`
        )
      }
    }

    // If we couldn't create the expected pattern item, try alternatives
    if (!patternItemCreated) {
      let alternativeCreated = false

      // Try to create any available pattern item as a fallback
      if (claimsCopy.length >= 2) {
        output.push({
          type: 'claimPair',
          data: claimsCopy.splice(0, 2),
        })
        console.log(
          `🔄 Fallback: Created claimPair instead of ${currentPatternType}`
        )
        alternativeCreated = true
      } else if (memesCopy.length >= 2) {
        output.push({
          type: 'memeRow',
          data: memesCopy.splice(0, 2),
        })
        console.log(
          `🔄 Fallback: Created memeRow instead of ${currentPatternType}`
        )
        alternativeCreated = true
      } else if (quotesCopy.length >= 1) {
        output.push({
          type: 'quote',
          data: quotesCopy.splice(0, 1)[0],
        })
        console.log(
          `🔄 Fallback: Created quote instead of ${currentPatternType}`
        )
        alternativeCreated = true
      } else if (claimsCopy.length >= 1) {
        // Create a single-item claimPair for template compatibility
        output.push({
          type: 'claimPair',
          data: claimsCopy.splice(0, 1),
        })
        console.log(
          `🔄 Fallback: Created single-item claimPair instead of ${currentPatternType}`
        )
        alternativeCreated = true
      } else if (memesCopy.length >= 1) {
        // Create a single-item memeRow for template compatibility
        output.push({
          type: 'memeRow',
          data: memesCopy.splice(0, 1),
        })
        console.log(
          `🔄 Fallback: Created single-item memeRow instead of ${currentPatternType}`
        )
        alternativeCreated = true
      }

      // If no alternatives possible, we're truly done
      if (!alternativeCreated) {
        console.log(`🏁 No more pattern items or alternatives possible`)
        break
      }
    }

    patternIndex++
  }

  console.log('🏁 PATTERN COMPLETE. Remaining items:', {
    claims: claimsCopy.length,
    quotes: quotesCopy.length,
    memes: memesCopy.length,
  })

  console.log(
    `📊 PATTERN CREATED ${output.length} items, ALL content processed through pattern system`
  )

  console.log(
    '🎯 FINAL OUTPUT PATTERN:',
    output.map((item, i) => `${i}: ${item.type}`).slice(0, 20)
  )

  return output
}
