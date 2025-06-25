import { _ as __nuxt_component_0$1, a as __nuxt_component_2 } from "./TheFooter-BN9T1Plv.js";
import __nuxt_component_0 from "./Icon-B_75CSgK.js";
import { a as useRouter, v as vueExports, s as serverRenderer_cjs_prodExports, u as useRoute } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./config-DmdBDFMn.js";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "node:http";
import "node:https";
import "node:zlib";
import "node:stream";
import "node:buffer";
import "node:util";
import "node:url";
import "node:net";
import "node:fs";
import "node:path";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "#internal/nuxt/paths";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/@unhead+vue@2.0.11_vue@3.5.17_typescript@5.8.3_/node_modules/@unhead/vue/dist/index.mjs";
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
    vueExports.watch(
      () => props.prevSlug,
      (newSlug) => {
        if (newSlug) prefetchContent(newSlug);
      }
    );
    vueExports.watch(
      () => props.nextSlug,
      (newSlug) => {
        if (newSlug) prefetchContent(newSlug);
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "flex flex-wrap justify-between gap-3" }, _attrs))}><button class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded-sm text-slate-400 hover:text-white">`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_Icon, {
        name: "heroicons:home-20-solid",
        size: "1.25rem"
      }, null, _parent));
      _push(`</button><div class="flex gap-4"><button${serverRenderer_cjs_prodExports.ssrIncludeBooleanAttr(!__props.prevSlug) ? " disabled" : ""} class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "opacity-50 cursor-not-allowed": !__props.prevSlug }, "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"])}">`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_Icon, {
        name: "heroicons:arrow-left-16-solid",
        size: "1.5rem"
      }, null, _parent));
      _push(`</button><button${serverRenderer_cjs_prodExports.ssrIncludeBooleanAttr(!__props.nextSlug) ? " disabled" : ""} class="${serverRenderer_cjs_prodExports.ssrRenderClass([{ "opacity-50 cursor-not-allowed": !__props.nextSlug }, "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"])}">`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_Icon, {
        name: "heroicons:arrow-right-16-solid",
        size: "1.5rem"
      }, null, _parent));
      _push(`</button></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContentNavigation.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "content-detail",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const prevSlug = vueExports.ref(null);
    const nextSlug = vueExports.ref(null);
    const contentType = vueExports.ref(null);
    vueExports.watch(() => route.meta.navigation, (newNavigation) => {
      if (newNavigation) {
        prevSlug.value = newNavigation.prevSlug;
        nextSlug.value = newNavigation.nextSlug;
        contentType.value = newNavigation.contentType;
      }
    }, { immediate: true, deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TheHeader = __nuxt_component_0$1;
      const _component_ContentNavigation = _sfc_main$1;
      const _component_TheFooter = __nuxt_component_2;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "gap-3 grid grid-rows-[auto_auto_1fr_auto] h-screen" }, _attrs))} data-v-bf44d176>`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_TheHeader, { class: "top-0 left-0 z-10 sticky w-full" }, null, _parent));
      _push(`<div class="mx-auto px-4 w-full max-w-screen-md" data-v-bf44d176>`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_ContentNavigation, {
        "prev-slug": prevSlug.value,
        "next-slug": nextSlug.value,
        "content-type": contentType.value
      }, null, _parent));
      _push(`</div><div class="detail-scroll-container" data-v-bf44d176><main class="gap-3 mx-auto px-4 w-full max-w-screen-md" data-v-bf44d176>`);
      serverRenderer_cjs_prodExports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_TheFooter, { class: "w-full" }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/content-detail.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const contentDetail = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bf44d176"]]);
export {
  contentDetail as default
};
//# sourceMappingURL=content-detail-56wEeknf.js.map
