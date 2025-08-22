import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import css from '@eslint/css'
import { defineConfig } from 'eslint/config'

// NOTE: Prettier is still used (see .prettierrc) for formatting incl. vueIndentScriptAndStyle.
// Keep ESLint focused on code-quality; avoid overlapping style rules that can conflict.

export default defineConfig([
  // Ignore markdown and generated/build artifacts
  {
    ignores: [
      '**/*.md',
      '.nuxt/**',
      'node_modules/**',
      '.output/**',
      'dist/**',
      'public/**',
      '.tailwind-resolved.json',
      '**/.tailwind-resolved.json',
      '.vscode/**',
      '**/.vscode/**',
      'tsconfig.json',
    ],
  },
  // Base JS config (no vue-specific rules here)
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: (await import('@typescript-eslint/parser')).default,
    },
    rules: {},
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
  // Treat VS Code settings as JSONC (comments allowed)
  { files: ['.vscode/*.json'], plugins: { json }, language: 'json/jsonc' },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    ignores: ['.tailwind-resolved.json'],
  },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    ignores: ['.tailwind-resolved.json'],
  },
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    ignores: ['.tailwind-resolved.json'],
  },
])
