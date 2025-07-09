import type { FlatConfigComposer } from "../node_modules/.pnpm/eslint-flat-config-utils@2.1.0/node_modules/eslint-flat-config-utils/dist/index.mjs"
import { defineFlatConfigs } from "../node_modules/.pnpm/@nuxt+eslint-config@1.4.1_@typescript-eslint+utils@8.35.0_eslint@9.30.0_jiti@2.4.2__typ_12177489bf0feb4c63afa1d2f02680cd/node_modules/@nuxt/eslint-config/dist/flat.mjs"
import type { NuxtESLintConfigOptionsResolved } from "../node_modules/.pnpm/@nuxt+eslint-config@1.4.1_@typescript-eslint+utils@8.35.0_eslint@9.30.0_jiti@2.4.2__typ_12177489bf0feb4c63afa1d2f02680cd/node_modules/@nuxt/eslint-config/dist/flat.mjs"

declare const configs: FlatConfigComposer
declare const options: NuxtESLintConfigOptionsResolved
declare const withNuxt: typeof defineFlatConfigs
export default withNuxt
export { withNuxt, defineFlatConfigs, configs, options }