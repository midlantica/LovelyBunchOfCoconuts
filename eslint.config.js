import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import css from '@eslint/css'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  // Ignore markdown and generated/build artifacts
  { ignores: ['**/*.md', '.nuxt/**', 'node_modules/**', '.output/**', 'dist/**', 'public/**', 'tsconfig.json'] },
  // Base JS config (no vue-specific rules here)
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: (await import('@typescript-eslint/parser')).default,
    },
  },

  // Apply Vue recommended rules only to .vue files
  ...pluginVue.configs['flat/essential'].map((c) => ({
    ...c,
    files: ['**/*.vue'],
  })),
  {
    files: ['**/*.vue'],
    rules: {
      // Relax this rule to accommodate single-word UI component names
      'vue/multi-word-component-names': 'off',
    },
  },

  // JSON
  { files: ['**/*.json'], plugins: { json }, language: 'json/json' },
  { files: ['**/*.jsonc'], plugins: { json }, language: 'json/jsonc' },
  { files: ['**/*.json5'], plugins: { json }, language: 'json/json5' },

  // (Markdown intentionally ignored above)

  // CSS (disabled for now due to parser limitations with PostCSS/Tailwind syntax)
  // { files: ['assets/**/*.css'], plugins: { css }, language: 'css/css' },
])
