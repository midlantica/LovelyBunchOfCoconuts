// server/routes/well-known.js
export default defineEventHandler((event) => {
  // Return empty response for Chrome DevTools requests
  return {}
})
