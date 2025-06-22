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

  while (claimIndex < claims.length || quoteIndex < quotes.length || memeIndex < memes.length) {
    // Add 2 claims (or 1 pair)
    const claimPair = [
      { type: "claim", data: claims[claimIndex++] },
      claimIndex < claims.length ? { type: "claim", data: claims[claimIndex++] } : null,
    ].filter(Boolean)
    output.push({ type: "claimPair", data: claimPair })

    // Add 1 quote
    if (quoteIndex < quotes.length) {
      output.push({ type: "quote", data: quotes[quoteIndex++] })
    }

    // Add 2 memes (or 1 pair)
    const memePair = [
      { type: "meme", data: memes[memeIndex++] },
      memeIndex < memes.length ? { type: "meme", data: memes[memeIndex++] } : null,
    ].filter(Boolean)
    output.push({ type: "memeRow", data: memePair })

    // Add 1 quote
    if (quoteIndex < quotes.length) {
      output.push({ type: "quote", data: quotes[quoteIndex++] })
    }
  }

  return output
}
