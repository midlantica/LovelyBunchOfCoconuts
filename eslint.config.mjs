import js from "@eslint/js"
import vue from "eslint-plugin-vue"
import vueParser from "vue-eslint-parser"

export default [
  js.configs.recommended, // ✅ Base JS Rules

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
    },
    plugins: { vue },
    rules: {
      ...vue.configs["vue3-recommended"].rules, // ✅ Apply Vue 3 Rules

      // 🔥 Your custom Vue rules
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: 2,
          multiline: {
            max: 1,
            allowFirstLine: false,
          },
        },
      ],
    },
  },
]
