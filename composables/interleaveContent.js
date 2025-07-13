// composables/interleaveContent.js

export function interleaveContent(claims, quotes, memes) {
  // Create copies to avoid mutating original arrays
  const claimsCopy = [...claims]
  const quotesCopy = [...quotes]
  const memesCopy = [...memes]

  // Shuffle arrays for different content on each reload
  // Fisher-Yates shuffle for true randomness
  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  shuffle(claimsCopy)
  shuffle(quotesCopy)
  shuffle(memesCopy)

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
        patternItemCreated = true
      }
    } else if (currentPatternType === 'quote') {
      if (quotesCopy.length >= 1) {
        output.push({
          type: 'quote',
          data: quotesCopy.splice(0, 1)[0],
        })
        patternItemCreated = true
      }
    } else if (currentPatternType === 'memeRow') {
      if (memesCopy.length >= 2) {
        output.push({
          type: 'memeRow',
          data: memesCopy.splice(0, 2),
        })
        patternItemCreated = true
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
        alternativeCreated = true
      } else if (memesCopy.length >= 2) {
        output.push({
          type: 'memeRow',
          data: memesCopy.splice(0, 2),
        })
        alternativeCreated = true
      } else if (quotesCopy.length >= 1) {
        output.push({
          type: 'quote',
          data: quotesCopy.splice(0, 1)[0],
        })
        alternativeCreated = true
      } else if (claimsCopy.length >= 1) {
        // Create a single-item claimPair for template compatibility
        output.push({
          type: 'claimPair',
          data: claimsCopy.splice(0, 1),
        })
        alternativeCreated = true
      } else if (memesCopy.length >= 1) {
        // Create a single-item memeRow for template compatibility
        output.push({
          type: 'memeRow',
          data: memesCopy.splice(0, 1),
        })
        alternativeCreated = true
      }

      // If no alternatives possible, we're truly done
      if (!alternativeCreated) {
        break
      }
    }

    patternIndex++
  }

  return output
}
