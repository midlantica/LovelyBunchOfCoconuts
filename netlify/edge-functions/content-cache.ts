// Pro Plan: Edge Function for intelligent content caching
export default async (request: Request, context: any) => {
  const url = new URL(request.url)

  // Cache static content aggressively
  if (
    url.pathname.startsWith('/memes/') ||
    url.pathname.startsWith('/content/') ||
    url.pathname.endsWith('.json')
  ) {
    const response = await context.next()

    // Add edge caching headers for content
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
    headers.set('Netlify-CDN-Cache-Control', 'public, max-age=86400')
    headers.set('Vary', 'Accept-Encoding')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return context.next()
}

export const config = {
  path: ['/memes/*', '/content/*', '/*.json'],
}
