// Augment Nuxt hook types to include 'content:file:beforeParse' which exists at runtime
// but is missing from current @nuxt/content type definitions for the installed version.
// This keeps nuxt.config.ts clean while preserving type safety.
import '@nuxt/schema'

declare module '@nuxt/schema' {
  interface NitroHooks {
    // (Not a Nitro hook actually, but easiest augmentation target.)
  }
  interface NuxtHooks {
    /** Fired before a content markdown file is parsed. */
    'content:file:beforeParse': (file: any) => void
  }
}

export {}
