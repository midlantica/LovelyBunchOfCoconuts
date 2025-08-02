export default defineNuxtPlugin((nuxtApp) => {
  if (process.dev) {
    console.log('🟢 Tailwind Config: http://localhost:3000/_tailwind/')
  }
})
