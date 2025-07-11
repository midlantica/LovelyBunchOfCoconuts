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
  // Shuffle all arrays for randomness
  claims = shuffle([...claims])
  quotes = shuffle([...quotes])
  memes = shuffle([...memes])

  const output = []

  // Helper function to create rows
  const createRow = (type, items) => {
    if (type === 'claimPair') {
      return {
        type: 'claimPair',
        data: items.map((item) => ({ type: 'claim', data: item })),
      }
    } else if (type === 'quote') {
      return { type: 'quote', data: items[0] }
    } else if (type === 'memeRow') {
      return {
        type: 'memeRow',
        data: items.map((item) => ({ type: 'meme', data: item })),
      }
    }
  }

  // Generate rows in the strict pattern
  while (claims.length >= 2 && quotes.length >= 2 && memes.length >= 2) {
    output.push(createRow('claimPair', claims.splice(0, 2)))
    output.push(createRow('quote', quotes.splice(0, 1)))
    output.push(createRow('memeRow', memes.splice(0, 2)))
    output.push(createRow('quote', quotes.splice(0, 1)))
  }

  // Handle remaining items to avoid consecutive rows of the same type
  const remainingItems = []

  claims.forEach((claim) => remainingItems.push({ type: 'claim', data: claim }))
  quotes.forEach((quote) => remainingItems.push({ type: 'quote', data: quote }))
  memes.forEach((meme) => remainingItems.push({ type: 'meme', data: meme }))

  shuffle(remainingItems)

  let lastType = output.length > 0 ? output[output.length - 1].type : null

  while (remainingItems.length > 0) {
    const nextItemIndex = remainingItems.findIndex(
      (item) => item.type !== lastType
    )
    if (nextItemIndex !== -1) {
      const [nextItem] = remainingItems.splice(nextItemIndex, 1)
      output.push(nextItem)
      lastType = nextItem.type
    } else {
      // If no different type is found, append the remaining items as is
      remainingItems.forEach((item) => {
        if (item.type !== lastType) {
          output.push(item)
          lastType = item.type
        }
      })
      break
    }
  }

  return output
}
