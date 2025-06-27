
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'Button': typeof import("../components/Button.vue")['default']
    'ClaimDetailModal': typeof import("../components/ClaimDetailModal.vue")['default']
    'ClaimTranslationPanel': typeof import("../components/ClaimTranslationPanel.vue")['default']
    'CloseButton': typeof import("../components/CloseButton.vue")['default']
    'ContentNavigation': typeof import("../components/ContentNavigation.vue")['default']
    'MemeDetailModal': typeof import("../components/MemeDetailModal.vue")['default']
    'MemePanel': typeof import("../components/MemePanel.vue")['default']
    'ModalFrame': typeof import("../components/ModalFrame.vue")['default']
    'PillButton': typeof import("../components/PillButton.vue")['default']
    'QuoteDetailModal': typeof import("../components/QuoteDetailModal.vue")['default']
    'QuotePanel': typeof import("../components/QuotePanel.vue")['default']
    'ScrollContainer': typeof import("../components/ScrollContainer.vue")['default']
    'SearchBar': typeof import("../components/SearchBar.vue")['default']
    'TheFooter': typeof import("../components/TheFooter.vue")['default']
    'TheHeader': typeof import("../components/TheHeader.vue")['default']
    'WakeUpNPCFiller': typeof import("../components/WakeUpNPCFiller.vue")['default']
    'NuxtWelcome': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'ContentRenderer': typeof import("../.pnpm-store/@nuxt+content@3.6.1_better-sqlite3@12.1.1_magicast@0.3.5/node_modules/@nuxt/content/dist/runtime/components/ContentRenderer.vue")['default']
    'MDC': typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue")['default']
    'MDCCached': typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCCached.vue")['default']
    'MDCRenderer': typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue")['default']
    'MDCSlot': typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCSlot.vue")['default']
    'Icon': typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/Icon.vue")['default']
    'IconCSS': typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/IconCSS.vue")['default']
    'NuxtPage': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': IslandComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
      'LazyButton': LazyComponent<typeof import("../components/Button.vue")['default']>
    'LazyClaimDetailModal': LazyComponent<typeof import("../components/ClaimDetailModal.vue")['default']>
    'LazyClaimTranslationPanel': LazyComponent<typeof import("../components/ClaimTranslationPanel.vue")['default']>
    'LazyCloseButton': LazyComponent<typeof import("../components/CloseButton.vue")['default']>
    'LazyContentNavigation': LazyComponent<typeof import("../components/ContentNavigation.vue")['default']>
    'LazyMemeDetailModal': LazyComponent<typeof import("../components/MemeDetailModal.vue")['default']>
    'LazyMemePanel': LazyComponent<typeof import("../components/MemePanel.vue")['default']>
    'LazyModalFrame': LazyComponent<typeof import("../components/ModalFrame.vue")['default']>
    'LazyPillButton': LazyComponent<typeof import("../components/PillButton.vue")['default']>
    'LazyQuoteDetailModal': LazyComponent<typeof import("../components/QuoteDetailModal.vue")['default']>
    'LazyQuotePanel': LazyComponent<typeof import("../components/QuotePanel.vue")['default']>
    'LazyScrollContainer': LazyComponent<typeof import("../components/ScrollContainer.vue")['default']>
    'LazySearchBar': LazyComponent<typeof import("../components/SearchBar.vue")['default']>
    'LazyTheFooter': LazyComponent<typeof import("../components/TheFooter.vue")['default']>
    'LazyTheHeader': LazyComponent<typeof import("../components/TheHeader.vue")['default']>
    'LazyWakeUpNPCFiller': LazyComponent<typeof import("../components/WakeUpNPCFiller.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyContentRenderer': LazyComponent<typeof import("../.pnpm-store/@nuxt+content@3.6.1_better-sqlite3@12.1.1_magicast@0.3.5/node_modules/@nuxt/content/dist/runtime/components/ContentRenderer.vue")['default']>
    'LazyMDC': LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue")['default']>
    'LazyMDCCached': LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCCached.vue")['default']>
    'LazyMDCRenderer': LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue")['default']>
    'LazyMDCSlot': LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCSlot.vue")['default']>
    'LazyIcon': LazyComponent<typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/Icon.vue")['default']>
    'LazyIconCSS': LazyComponent<typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/IconCSS.vue")['default']>
    'LazyNuxtPage': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<IslandComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const Button: typeof import("../components/Button.vue")['default']
export const ClaimDetailModal: typeof import("../components/ClaimDetailModal.vue")['default']
export const ClaimTranslationPanel: typeof import("../components/ClaimTranslationPanel.vue")['default']
export const CloseButton: typeof import("../components/CloseButton.vue")['default']
export const ContentNavigation: typeof import("../components/ContentNavigation.vue")['default']
export const MemeDetailModal: typeof import("../components/MemeDetailModal.vue")['default']
export const MemePanel: typeof import("../components/MemePanel.vue")['default']
export const ModalFrame: typeof import("../components/ModalFrame.vue")['default']
export const PillButton: typeof import("../components/PillButton.vue")['default']
export const QuoteDetailModal: typeof import("../components/QuoteDetailModal.vue")['default']
export const QuotePanel: typeof import("../components/QuotePanel.vue")['default']
export const ScrollContainer: typeof import("../components/ScrollContainer.vue")['default']
export const SearchBar: typeof import("../components/SearchBar.vue")['default']
export const TheFooter: typeof import("../components/TheFooter.vue")['default']
export const TheHeader: typeof import("../components/TheHeader.vue")['default']
export const WakeUpNPCFiller: typeof import("../components/WakeUpNPCFiller.vue")['default']
export const NuxtWelcome: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const ContentRenderer: typeof import("../.pnpm-store/@nuxt+content@3.6.1_better-sqlite3@12.1.1_magicast@0.3.5/node_modules/@nuxt/content/dist/runtime/components/ContentRenderer.vue")['default']
export const MDC: typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue")['default']
export const MDCCached: typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCCached.vue")['default']
export const MDCRenderer: typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue")['default']
export const MDCSlot: typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCSlot.vue")['default']
export const Icon: typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/Icon.vue")['default']
export const IconCSS: typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/IconCSS.vue")['default']
export const NuxtPage: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: IslandComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyButton: LazyComponent<typeof import("../components/Button.vue")['default']>
export const LazyClaimDetailModal: LazyComponent<typeof import("../components/ClaimDetailModal.vue")['default']>
export const LazyClaimTranslationPanel: LazyComponent<typeof import("../components/ClaimTranslationPanel.vue")['default']>
export const LazyCloseButton: LazyComponent<typeof import("../components/CloseButton.vue")['default']>
export const LazyContentNavigation: LazyComponent<typeof import("../components/ContentNavigation.vue")['default']>
export const LazyMemeDetailModal: LazyComponent<typeof import("../components/MemeDetailModal.vue")['default']>
export const LazyMemePanel: LazyComponent<typeof import("../components/MemePanel.vue")['default']>
export const LazyModalFrame: LazyComponent<typeof import("../components/ModalFrame.vue")['default']>
export const LazyPillButton: LazyComponent<typeof import("../components/PillButton.vue")['default']>
export const LazyQuoteDetailModal: LazyComponent<typeof import("../components/QuoteDetailModal.vue")['default']>
export const LazyQuotePanel: LazyComponent<typeof import("../components/QuotePanel.vue")['default']>
export const LazyScrollContainer: LazyComponent<typeof import("../components/ScrollContainer.vue")['default']>
export const LazySearchBar: LazyComponent<typeof import("../components/SearchBar.vue")['default']>
export const LazyTheFooter: LazyComponent<typeof import("../components/TheFooter.vue")['default']>
export const LazyTheHeader: LazyComponent<typeof import("../components/TheHeader.vue")['default']>
export const LazyWakeUpNPCFiller: LazyComponent<typeof import("../components/WakeUpNPCFiller.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyContentRenderer: LazyComponent<typeof import("../.pnpm-store/@nuxt+content@3.6.1_better-sqlite3@12.1.1_magicast@0.3.5/node_modules/@nuxt/content/dist/runtime/components/ContentRenderer.vue")['default']>
export const LazyMDC: LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue")['default']>
export const LazyMDCCached: LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCCached.vue")['default']>
export const LazyMDCRenderer: LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue")['default']>
export const LazyMDCSlot: LazyComponent<typeof import("../.pnpm-store/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCSlot.vue")['default']>
export const LazyIcon: LazyComponent<typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/Icon.vue")['default']>
export const LazyIconCSS: LazyComponent<typeof import("../.pnpm-store/nuxt-icon@0.6.10_magicast@0.3.5_vite@6.3.5_@types+node@24.0.4_jiti@2.4.2_terser@5.43.1__955dd651aff02a89b3856c8914d724dc/node_modules/nuxt-icon/dist/runtime/IconCSS.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<IslandComponent<typeof import("../.pnpm-store/nuxt@3.17.5_@parcel+watcher@2.5.1_@types+node@24.0.4_better-sqlite3@12.1.1_db0@0.3.2_be_8a0cca195336401e66eaa2569f61a0cc/node_modules/nuxt/dist/app/components/server-placeholder")['default']>>

export const componentNames: string[]
