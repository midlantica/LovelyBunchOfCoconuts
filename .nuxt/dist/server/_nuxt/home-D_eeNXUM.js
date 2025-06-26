import { _ as __nuxt_component_0$1, a as __nuxt_component_2 } from "./TheFooter-BN9T1Plv.js";
import __nuxt_component_0 from "./Icon-B_75CSgK.js";
import { s as serverRenderer_cjs_prodExports, v as vueExports } from "../server.mjs";
import { debounce } from "lodash-es";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { u as useContentFeed } from "./useContentFeed-BYnw4BX3.js";
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
const _sfc_main$2 = {
  __name: "PillButton",
  __ssrInlineRender: true,
  props: {
    label: { type: String, required: true },
    count: { type: [Number, String], default: 0 },
    on: { type: Boolean, default: false }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({
        class: ["pill-btn", __props.on ? "pill-on" : "pill-off"],
        type: "button"
      }, _attrs))} data-v-b5e25849><span class="pill-label" data-v-b5e25849>${serverRenderer_cjs_prodExports.ssrInterpolate(__props.label)}</span><span class="pill-count" data-v-b5e25849>${serverRenderer_cjs_prodExports.ssrInterpolate(__props.count)}</span></button>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PillButton.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const PillButton = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-b5e25849"]]);
const _sfc_main$1 = {
  __name: "SearchBar",
  __ssrInlineRender: true,
  props: {
    search: String,
    claimCount: { type: Number, default: 0 },
    quoteCount: { type: Number, default: 0 },
    memeCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true })
    },
    totalClaimCount: { type: Number, default: 0 },
    totalQuoteCount: { type: Number, default: 0 },
    totalMemeCount: { type: Number, default: 0 },
    totalItemCount: { type: Number, default: 0 }
  },
  emits: ["update:search", "update:filters"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const searchTerm = vueExports.ref(props.search || "");
    vueExports.ref(null);
    const debouncedEmitSearch = debounce((val) => emit("update:search", val), 300);
    const pillClaimCount = vueExports.computed(() => props.claimCount ?? 0);
    const pillQuoteCount = vueExports.computed(() => props.quoteCount ?? 0);
    const pillMemeCount = vueExports.computed(() => props.memeCount ?? 0);
    const pills = [
      { key: "claims", label: "CLAIMS", count: pillClaimCount },
      { key: "quotes", label: "QUOTES", count: pillQuoteCount },
      { key: "memes", label: "MEMES", count: pillMemeCount }
    ];
    function ensureFilterKeys(obj) {
      obj = obj && typeof obj === "object" ? obj : {};
      return {
        claims: typeof obj.claims === "boolean" ? obj.claims : true,
        quotes: typeof obj.quotes === "boolean" ? obj.quotes : true,
        memes: typeof obj.memes === "boolean" ? obj.memes : true
      };
    }
    function toggleFilter(key) {
      const filters = ensureFilterKeys(props.filters);
      const keys = Object.keys(filters);
      const onCount = keys.filter((k) => filters[k]).length;
      if (onCount === keys.length) {
        keys.forEach((k) => filters[k] = false);
        filters[key] = true;
      } else if (onCount === 1 && filters[key]) {
        keys.forEach((k) => filters[k] = true);
      } else {
        filters[key] = !filters[key];
        if (Object.values(filters).every((v) => !v)) {
          filters[key] = true;
        }
      }
      emit("update:filters", { ...filters });
    }
    function resetFilters() {
      emit("update:filters", { claims: true, quotes: true, memes: true });
    }
    vueExports.watch(searchTerm, (newValue) => {
      debouncedEmitSearch(newValue);
      if (newValue === "") resetFilters();
    });
    vueExports.watch(
      () => props.search,
      (newValue) => searchTerm.value = newValue
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "flex flex-col items-start gap-2 w-full h-auto text-seagull-950" }, _attrs))}><div class="relative flex flex-row gap-0 w-full">`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_Icon, {
        name: "mdi:magnify",
        size: "2rem",
        class: "top-[.4rem] left-[.75rem] absolute text-slate-200/60"
      }, null, _parent));
      _push(`<input type="search"${serverRenderer_cjs_prodExports.ssrRenderAttr("value", searchTerm.value)} class="bg-transparent focus:bg-transparent ps-12 pt-[.3rem] pr-3 pb-[.5rem] border-[#6dd3ff73] border-[1.5px] focus:border-seagull-400/50 rounded-lg outline-none w-full text-[1.5rem] text-slate-200 placeholder:text-seagull-200/50 leading-tight tracking-wide" placeholder="Search..."></div><div class="flex flex-row items-center gap-3 px-0 w-full"><div class="flex flex-row gap-2"><!--[-->`);
      serverRenderer_cjs_prodExports.ssrRenderList(pills, (pill) => {
        _push(serverRenderer_cjs_prodExports.ssrRenderComponent(PillButton, {
          key: pill.key,
          label: pill.label,
          count: pill.count.value,
          on: __props.filters[pill.key],
          onClick: ($event) => toggleFilter(pill.key)
        }, null, _parent));
      });
      _push(`<!--]--></div><span class="font-light text-slate-400 uppercase tracking-wider" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "font-size": "1.155rem" })}">${serverRenderer_cjs_prodExports.ssrInterpolate(props.totalItemCount)}</span></div>`);
      if (searchTerm.value && props.totalCount === 0) {
        _push(`<div class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "margin-top": "3.5rem" })}"><h1 class="m-auto mt-16 font-light text-white text-2xl text-center">No results found.</h1></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SearchBar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "home",
  __ssrInlineRender: true,
  setup(__props) {
    const searchTerm = vueExports.ref("");
    const contentFilters = vueExports.ref({
      claims: true,
      quotes: true,
      memes: true
    });
    vueExports.provide("searchTerm", searchTerm);
    vueExports.provide("contentFilters", contentFilters);
    const { displayedItems, contentCollections } = useContentFeed(searchTerm, contentFilters);
    const pillClaimCount = vueExports.computed(() => contentCollections.claims.value.length);
    const pillQuoteCount = vueExports.computed(() => contentCollections.quotes.value.length);
    const pillMemeCount = vueExports.computed(() => contentCollections.memes.value.length);
    vueExports.computed(
      () => pillClaimCount.value + pillQuoteCount.value + pillMemeCount.value
    );
    const claimCount = vueExports.computed(() => {
      return displayedItems.value.flatMap((item) => item.type === "claimPair" ? item.data : []).filter((item) => item.type === "claim").length;
    });
    const quoteCount = vueExports.computed(() => {
      return displayedItems.value.filter((item) => item.type === "quote").length;
    });
    const memeCount = vueExports.computed(() => {
      return displayedItems.value.flatMap((item) => item.type === "memeRow" ? item.data : []).filter((item) => item.type === "meme").length;
    });
    const totalCount = vueExports.computed(() => claimCount.value + quoteCount.value + memeCount.value);
    const totalClaimCount = vueExports.computed(() => contentCollections.claims.value.length);
    const totalQuoteCount = vueExports.computed(() => contentCollections.quotes.value.length);
    const totalMemeCount = vueExports.computed(() => contentCollections.memes.value.length);
    const totalItemCount = vueExports.computed(
      () => totalClaimCount.value + totalQuoteCount.value + totalMemeCount.value
    );
    const { contentCollections: searchCollections } = useContentFeed(
      searchTerm,
      vueExports.ref({ claims: true, quotes: true, memes: true })
    );
    const searchClaimCount = vueExports.computed(() => searchCollections.claims.value.length);
    const searchQuoteCount = vueExports.computed(() => searchCollections.quotes.value.length);
    const searchMemeCount = vueExports.computed(() => searchCollections.memes.value.length);
    vueExports.watch(
      contentFilters,
      (newVal) => {
      },
      { deep: true }
    );
    console.log("SearchBar rendered", contentFilters.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TheHeader = __nuxt_component_0$1;
      const _component_SearchBar = _sfc_main$1;
      const _component_TheFooter = __nuxt_component_2;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden baser" }, _attrs))}>`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_TheHeader, { class: "top-0 left-0 z-10 sticky w-full" }, null, _parent));
      _push(`<div class="gap-3 grid grid-rows-[auto_1fr] px-4 overflow-hidden">`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_SearchBar, {
        search: searchTerm.value,
        "onUpdate:search": ($event) => searchTerm.value = $event,
        filters: contentFilters.value,
        "onUpdate:filters": ($event) => contentFilters.value = $event,
        "claim-count": searchClaimCount.value,
        "quote-count": searchQuoteCount.value,
        "meme-count": searchMemeCount.value,
        "total-count": totalCount.value,
        "total-claim-count": totalClaimCount.value,
        "total-quote-count": totalQuoteCount.value,
        "total-meme-count": totalMemeCount.value,
        "total-item-count": totalItemCount.value,
        class: "top-0 z-10 sticky justify-self-center max-w-screen-md"
      }, null, _parent));
      _push(`<div class="overflow-y-auto"><div class="mx-auto w-full max-w-screen-md"><main class="grid grid-rows-[auto]">`);
      serverRenderer_cjs_prodExports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div></div>`);
      _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_TheFooter, { class: "w-full" }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/home.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=home-D_eeNXUM.js.map
