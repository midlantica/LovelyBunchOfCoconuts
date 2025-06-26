import { _ as __nuxt_component_0, a as __nuxt_component_2 } from './TheFooter-B-0Psyky.mjs';
import __nuxt_component_0$1 from './Icon-CT7HiOLN.mjs';
import { ref, watch, mergeProps, useSSRContext } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrIncludeBooleanAttr } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/server-renderer/index.mjs';
import { u as useRoute, a as useRouter } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/ofetch@1.4.1/node_modules/ofetch/dist/node.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/node-mock-http@1.0.1/node_modules/node-mock-http/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unstorage@1.16.0_db0@0.3.2_better-sqlite3@12.1.1__ioredis@5.6.1/node_modules/unstorage/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unstorage@1.16.0_db0@0.3.2_better-sqlite3@12.1.1__ioredis@5.6.1/node_modules/unstorage/drivers/fs.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unstorage@1.16.0_db0@0.3.2_better-sqlite3@12.1.1__ioredis@5.6.1/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unstorage@1.16.0_db0@0.3.2_better-sqlite3@12.1.1__ioredis@5.6.1/node_modules/unstorage/drivers/lru-cache.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/db0@0.3.2_better-sqlite3@12.1.1/node_modules/db0/dist/connectors/better-sqlite3.mjs';
import './config-CcmVt8v2.mjs';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'node:buffer';
import 'node:util';
import 'node:net';
import 'node:path';
import '../_/renderer.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue-bundle-renderer@2.1.1/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unhead@2.0.11/node_modules/unhead/dist/server.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/devalue@5.1.1/node_modules/devalue/index.js';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unhead@2.0.11/node_modules/unhead/dist/utils.mjs';
import 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unhead@2.0.11/node_modules/unhead/dist/plugins.mjs';

const _sfc_main$1 = {
  __name: "ContentNavigation",
  __ssrInlineRender: true,
  props: {
    prevSlug: String,
    nextSlug: String,
    contentType: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    useRouter();
    const props = __props;
    const prefetchContent = async (slug) => {
      if (!slug || slug === "/") return;
      try {
        const pathParts = slug.split("/");
        const contentType = pathParts[1];
        if (contentType && ["claims", "quotes", "memes"].includes(contentType)) {
          console.log(`Pre-fetching content for: ${slug}`);
          const slugParts = pathParts.slice(2);
          const fullPath = `/${contentType}/${slugParts.join("/")}`;
          await fetch(`/api/content/item?path=${encodeURIComponent(fullPath)}`, {
            method: "GET",
            headers: {
              "X-Purpose": "prefetch"
            }
          });
          console.log(`Pre-fetched content for: ${slug}`);
        }
      } catch (error) {
        console.error(`Error pre-fetching content for ${slug}:`, error);
      }
    };
    watch(
      () => props.prevSlug,
      (newSlug) => {
        if (newSlug) prefetchContent(newSlug);
      }
    );
    watch(
      () => props.nextSlug,
      (newSlug) => {
        if (newSlug) prefetchContent(newSlug);
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-wrap justify-between gap-3" }, _attrs))}><button class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded-sm text-slate-400 hover:text-white">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:home-20-solid",
        size: "1.25rem"
      }, null, _parent));
      _push(`</button><div class="flex gap-4"><button${ssrIncludeBooleanAttr(!__props.prevSlug) ? " disabled" : ""} class="${ssrRenderClass([{ "opacity-50 cursor-not-allowed": !__props.prevSlug }, "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"])}">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:arrow-left-16-solid",
        size: "1.5rem"
      }, null, _parent));
      _push(`</button><button${ssrIncludeBooleanAttr(!__props.nextSlug) ? " disabled" : ""} class="${ssrRenderClass([{ "opacity-50 cursor-not-allowed": !__props.nextSlug }, "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"])}">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:arrow-right-16-solid",
        size: "1.5rem"
      }, null, _parent));
      _push(`</button></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContentNavigation.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "content-detail",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const prevSlug = ref(null);
    const nextSlug = ref(null);
    const contentType = ref(null);
    watch(() => route.meta.navigation, (newNavigation) => {
      if (newNavigation) {
        prevSlug.value = newNavigation.prevSlug;
        nextSlug.value = newNavigation.nextSlug;
        contentType.value = newNavigation.contentType;
      }
    }, { immediate: true, deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TheHeader = __nuxt_component_0;
      const _component_ContentNavigation = _sfc_main$1;
      const _component_TheFooter = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "gap-3 grid grid-rows-[auto_auto_1fr_auto] h-screen" }, _attrs))} data-v-bf44d176>`);
      _push(ssrRenderComponent(_component_TheHeader, { class: "top-0 left-0 z-10 sticky w-full" }, null, _parent));
      _push(`<div class="mx-auto px-4 w-full max-w-screen-md" data-v-bf44d176>`);
      _push(ssrRenderComponent(_component_ContentNavigation, {
        "prev-slug": prevSlug.value,
        "next-slug": nextSlug.value,
        "content-type": contentType.value
      }, null, _parent));
      _push(`</div><div class="detail-scroll-container" data-v-bf44d176><main class="gap-3 mx-auto px-4 w-full max-w-screen-md" data-v-bf44d176>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
      _push(ssrRenderComponent(_component_TheFooter, { class: "w-full" }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/content-detail.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const contentDetail = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bf44d176"]]);

export { contentDetail as default };
//# sourceMappingURL=content-detail-CBXDdiuL.mjs.map
