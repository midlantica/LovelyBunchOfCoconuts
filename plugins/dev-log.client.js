export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    console.log('🟢 Tailwind Config: http://localhost:3000/_tailwind/')
  }
})
