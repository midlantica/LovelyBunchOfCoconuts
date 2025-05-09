// eslint.config.js
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import nuxt from "eslint-plugin-nuxt";

export default [
  // Base JavaScript rules with Nuxt/Vue globals
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        // Nuxt-specific auto-imports
        useAsyncData: "readonly",
        definePageMeta: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        // Vue reactivity auto-imports from Nuxt
        ref: "readonly",
        computed: "readonly",
        reactive: "readonly",
        toRefs: "readonly",
        watch: "readonly",
        watchEffect: "readonly",
        onMounted: "readonly",
        onUnmounted: "readonly",
        // Add more as needed
      },
    },
  },

  // Vue-specific config
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: {
      vue: vue,
    },
    rules: {
      ...vue.configs["flat/recommended"].rules,
      "vue/max-attributes-per-line": ["error", { singleline: 2, multiline: 1 }],
      "vue/script-indent": ["error", 2, { baseIndent: 1 }],
    },
  },

  // Nuxt-specific config
  {
    files: ["**/*.vue", "**/*.js", "**/*.ts"],
    plugins: {
      nuxt: nuxt,
    },
    rules: {
      ...nuxt.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        queryCollection: "readonly", // Your custom function
      },
    },
  },
];