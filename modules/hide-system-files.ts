import { defineNuxtModule } from '@nuxt/kit'

// Proper Nuxt module to hide system files (.DS_Store) from @nuxt/content parsing
export default defineNuxtModule({
  meta: { name: 'hide-system-files' },
  setup(_options, nuxt) {
    // @ts-ignore - hook provided by @nuxt/content runtime
    nuxt.hooks.hook('content:file:beforeParse', (file: any) => {
      const id = file?.id || file?._id || file?.path || ''
      if (id.endsWith('.DS_Store')) file.raw = ''
    })
  },
})
