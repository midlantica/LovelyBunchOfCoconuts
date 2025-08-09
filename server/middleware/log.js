export default defineEventHandler((event) => {
  // Only log requests when explicitly enabled to avoid terminal spam
  if (process.env.DEBUG_REQUESTS === '1') {
    console.log('Incoming request:', event.node.req.url)
  }
})
