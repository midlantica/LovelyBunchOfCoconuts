export default defineEventHandler((event) => {
  console.log('Incoming request:', event.node.req.url)
})
