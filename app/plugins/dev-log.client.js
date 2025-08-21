export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return
  console.log(
    '🟢 Dev Tokens: /dev/tokens  |  Dump full config: pnpm run tw:config'
  )
})
