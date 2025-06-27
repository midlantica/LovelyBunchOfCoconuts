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
  claims = shuffle([...claims])
  quotes = shuffle([...quotes])
  memes = shuffle([...memes])

  const output = []
  let claimIndex = 0
  let quoteIndex = 0
  let memeIndex = 0

  // Precompute valid claim pairs
  const claimPairs = []
  while (claimIndex + 1 < claims.length) {
    claimPairs.push([
      { type: 'claim', data: claims[claimIndex] },
      { type: 'claim', data: claims[claimIndex + 1] },
    ])
    claimIndex += 2
  }
  // If odd number, you can choose to skip the last or show a single (not paired)
  if (claimIndex < claims.length) {
    // Optionally, add a single claim as a pair with only one item
    claimPairs.push([{ type: 'claim', data: claims[claimIndex] }])
  }

  // Precompute valid meme pairs
  const memePairs = []
  while (memeIndex + 1 < memes.length) {
    memePairs.push([
      { type: 'meme', data: memes[memeIndex] },
      { type: 'meme', data: memes[memeIndex + 1] },
    ])
    memeIndex += 2
  }
  if (memeIndex < memes.length) {
    memePairs.push([{ type: 'meme', data: memes[memeIndex] }])
  }

  // Interleave: claimPair, quote, memePair, quote, repeat
  let pairIndex = 0,
    quoteIdx = 0,
    memePairIdx = 0
  while (
    pairIndex < claimPairs.length ||
    quoteIdx < quotes.length ||
    memePairIdx < memePairs.length
  ) {
    // Add claim pair if available
    if (pairIndex < claimPairs.length) {
      output.push({ type: 'claimPair', data: claimPairs[pairIndex++] })
    }
    // Add quote if available
    if (quoteIdx < quotes.length) {
      output.push({ type: 'quote', data: quotes[quoteIdx++] })
    }
    // Add meme pair if available
    if (memePairIdx < memePairs.length) {
      output.push({ type: 'memeRow', data: memePairs[memePairIdx++] })
    }
    // Add quote if available
    if (quoteIdx < quotes.length) {
      output.push({ type: 'quote', data: quotes[quoteIdx++] })
    }
  }

  return output
}
