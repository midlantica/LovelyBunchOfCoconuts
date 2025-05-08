// server/routes/.well-known/appspecific/com.chrome.devtools.json.ts
export default defineEventHandler((event) => {
  // Return empty response for Chrome DevTools requests
  return {}
})
