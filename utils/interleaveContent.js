// utils/interleaveContent.js

// Fisher-Yates shuffle for true randomness
function shuffle(array) {
  let m = array.length,
    t,
    i
  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

export function interleaveContent(claims, quotes, memes) {
  // Shuffle each content type for random order
  claims = shuffle([...claims])
  quotes = shuffle([...quotes])
  memes = shuffle([...memes])

  const output = []
  let quoteIndex = 0
  let memeIndex = 0

  // Group claims into pairs
  const claimPairs = []
  for (let i = 0; i < claims.length; i += 2) {
    const pair = [
      { type: "claim", data: claims[i] },
      claims[i + 1] ? { type: "claim", data: claims[i + 1] } : null,
    ].filter(Boolean)
    claimPairs.push({ type: "claimPair", data: pair })
  }

  // Interleave claims and quotes
  const claimQuoteList = []
  const pairsPerQuote = 2
  for (let i = 0; i < claimPairs.length; i++) {
    claimQuoteList.push(claimPairs[i])
    if ((i + 1) % pairsPerQuote === 0 && quoteIndex < quotes.length) {
      claimQuoteList.push({ type: "quote", data: quotes[quoteIndex] })
      quoteIndex++
    }
  }
  while (quoteIndex < quotes.length) {
    claimQuoteList.push({ type: "quote", data: quotes[quoteIndex] })
    quoteIndex++
  }

  // Insert meme pairs
  output.push(...claimQuoteList)
  const totalMemePairs = Math.ceil(memes.length / 2)
  if (totalMemePairs > 0) {
    const totalSlots = claimQuoteList.length + totalMemePairs
    const possiblePositions = Array.from({ length: totalSlots }, (_, i) => i)
    const minDistance = Math.max(1, Math.floor(totalSlots / (totalMemePairs + 1)))
    const memePositions = []
    let seed = claimQuoteList.length

    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    for (let i = 0; i < totalMemePairs && possiblePositions.length; i++) {
      const randomIndex = Math.floor(pseudoRandom() * possiblePositions.length)
      const position = possiblePositions.splice(randomIndex, 1)[0]
      memePositions.push(position)
    }
    memePositions.sort((a, b) => a - b)

    let offset = 0
    for (const position of memePositions) {
      const memePair = [
        memeIndex < memes.length ? { type: "meme", data: memes[memeIndex++] } : null,
        memeIndex < memes.length ? { type: "meme", data: memes[memeIndex++] } : null,
      ].filter(Boolean)
      output.splice(position + offset, 0, { type: "memeRow", data: memePair })
      offset++
    }
  }

  return output
}
