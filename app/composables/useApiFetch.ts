// composables/useApiFetch.ts
// Factory-created useFetch instance with project-wide defaults (Nuxt 4.4)
//
// createUseFetch() is new in Nuxt 4.4 — it creates a custom useFetch composable
// pre-configured with shared options (baseURL, headers, error handling, etc.).
// This replaces the pattern of passing the same options to every useFetch call.
//
// Usage:
//   import { useApiFetch } from '~/composables/useApiFetch'
//   const { data } = await useApiFetch('/likes/123')
//   const { data } = await useApiFetch('/likes', { method: 'POST', body: { delta: 1 } })

export const useApiFetch = createUseFetch((options) => {
  const runtimeConfig = useRuntimeConfig()
  return {
    ...options,
    // All internal API calls go to /api — no need to repeat this prefix everywhere
    baseURL: '/api',
    // Attach site URL for server-side requests that need an absolute URL
    headers: {
      ...((options as any).headers || {}),
      'x-site-url': runtimeConfig.public.siteUrl,
    },
  }
})
