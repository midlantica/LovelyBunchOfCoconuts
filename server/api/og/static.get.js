// Simple static branded images for social sharing
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type || 'quote'
  
  // For development, redirect to static branded images
  // In production, you could generate dynamic images
  
  let imagePath = '/og-default.png' // fallback
  
  switch (type) {
    case 'quote':
      imagePath = '/og-quote.png'
      break
    case 'claim':
      imagePath = '/og-claim.png'  
      break
    case 'meme':
      imagePath = '/og-meme.png'
      break
  }
  
  // Redirect to the static image
  await sendRedirect(event, imagePath, 302)
})
