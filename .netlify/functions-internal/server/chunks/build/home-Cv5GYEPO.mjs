import { _ as __nuxt_component_0, a as __nuxt_component_2 } from './TheFooter-B-0Psyky.mjs';
import __nuxt_component_0$1 from './Icon-CqYqGx2s.mjs';
import { ref, provide, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr, ssrRenderList, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useContentFeed } from './useContentFeed-iAfMaJ6b.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import '@iconify/vue/dist/offline';
import '@iconify/vue';
import './config-BFzuITvt.mjs';
import './server.mjs';
import 'vue-router';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'lodash-es';

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
      _push(`<button${ssrRenderAttrs(mergeProps({
        class: ["pill-btn", __props.on ? "pill-on" : "pill-off"],
        type: "button"
      }, _attrs))} data-v-b5e25849><span class="pill-label" data-v-b5e25849>${ssrInterpolate(__props.label)}</span><span class="pill-count" data-v-b5e25849>${ssrInterpolate(__props.count)}</span></button>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
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
    const searchTerm = ref(props.search || "");
    ref(null);
    const pillClaimCount = computed(() => {
      var _a;
      return (_a = props.claimCount) != null ? _a : 0;
    });
    const pillQuoteCount = computed(() => {
      var _a;
      return (_a = props.quoteCount) != null ? _a : 0;
    });
    const pillMemeCount = computed(() => {
      var _a;
      return (_a = props.memeCount) != null ? _a : 0;
    });
    const pills = [
      {
        key: "claims",
        label: "CLAIMS",
        count: pillClaimCount
        // pass the computed ref itself
      },
      {
        key: "quotes",
        label: "QUOTES",
        count: pillQuoteCount
      },
      {
        key: "memes",
        label: "MEMES",
        count: pillMemeCount
      }
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
    watch(searchTerm, (newValue) => {
      emit("update:search", newValue);
      if (newValue === "") {
        resetFilters();
      }
    });
    watch(
      () => props.search,
      (newValue) => searchTerm.value = newValue
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start gap-2 w-full h-auto text-seagull-950" }, _attrs))} data-v-8ac9ee62><div class="relative flex flex-row gap-0 w-full" data-v-8ac9ee62>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:magnify",
        size: "2rem",
        class: "top-[.4rem] left-[.75rem] absolute text-slate-200/60"
      }, null, _parent));
      _push(`<input type="search"${ssrRenderAttr("value", searchTerm.value)} class="bg-transparent focus:bg-transparent ps-12 pt-[.3rem] pr-3 pb-[.5rem] border-[#6dd3ff73] border-[1.5px] focus:border-seagull-400/50 rounded-lg outline-none w-full text-[1.5rem] text-slate-200 placeholder:text-seagull-200/50 leading-tight tracking-wide" placeholder="Search..." data-v-8ac9ee62></div><div class="flex flex-row items-center gap-3 px-0 w-full" data-v-8ac9ee62><div class="flex flex-row gap-2" data-v-8ac9ee62><!--[-->`);
      ssrRenderList(pills, (pill) => {
        _push(ssrRenderComponent(PillButton, {
          key: pill.key,
          label: pill.label,
          count: pill.count.value,
          on: __props.filters[pill.key],
          onClick: ($event) => toggleFilter(pill.key)
        }, null, _parent));
      });
      _push(`<!--]--></div><span class="font-light text-slate-400 uppercase tracking-wider" style="${ssrRenderStyle({ "font-size": "1.155rem" })}" data-v-8ac9ee62>${ssrInterpolate(props.totalItemCount)}</span></div>`);
      if (searchTerm.value && props.totalCount === 0) {
        _push(`<div class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]" style="${ssrRenderStyle({ "margin-top": "3.5rem" })}" data-v-8ac9ee62><h1 class="m-auto mt-16 font-light text-white text-2xl text-center" data-v-8ac9ee62>No results found.</h1></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SearchBar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-8ac9ee62"]]);
const _sfc_main = {
  __name: "home",
  __ssrInlineRender: true,
  setup(__props) {
    const searchTerm = ref("");
    const contentFilters = ref({
      claims: true,
      quotes: true,
      memes: true
    });
    provide("searchTerm", searchTerm);
    provide("contentFilters", contentFilters);
    const { displayedItems, contentCollections } = useContentFeed(searchTerm, contentFilters);
    const pillClaimCount = computed(() => contentCollections.claims.value.length);
    const pillQuoteCount = computed(() => contentCollections.quotes.value.length);
    const pillMemeCount = computed(() => contentCollections.memes.value.length);
    computed(
      () => pillClaimCount.value + pillQuoteCount.value + pillMemeCount.value
    );
    const claimCount = computed(() => {
      return displayedItems.value.flatMap((item) => item.type === "claimPair" ? item.data : []).filter((item) => item.type === "claim").length;
    });
    const quoteCount = computed(() => {
      return displayedItems.value.filter((item) => item.type === "quote").length;
    });
    const memeCount = computed(() => {
      return displayedItems.value.flatMap((item) => item.type === "memeRow" ? item.data : []).filter((item) => item.type === "meme").length;
    });
    const totalCount = computed(() => claimCount.value + quoteCount.value + memeCount.value);
    const totalClaimCount = computed(() => contentCollections.claims.value.length);
    const totalQuoteCount = computed(() => contentCollections.quotes.value.length);
    const totalMemeCount = computed(() => contentCollections.memes.value.length);
    const totalItemCount = computed(
      () => totalClaimCount.value + totalQuoteCount.value + totalMemeCount.value
    );
    const { contentCollections: searchCollections } = useContentFeed(
      searchTerm,
      ref({ claims: true, quotes: true, memes: true })
    );
    const searchClaimCount = computed(() => searchCollections.claims.value.length);
    const searchQuoteCount = computed(() => searchCollections.quotes.value.length);
    const searchMemeCount = computed(() => searchCollections.memes.value.length);
    watch(
      contentFilters,
      (newVal) => {
      },
      { deep: true }
    );
    console.log("SearchBar rendered", contentFilters.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TheHeader = __nuxt_component_0;
      const _component_SearchBar = __nuxt_component_1;
      const _component_TheFooter = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "gap-4 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden baser" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_TheHeader, { class: "top-0 left-0 z-10 sticky w-full" }, null, _parent));
      _push(`<div class="gap-3 grid grid-rows-[auto_1fr] px-4 overflow-hidden">`);
      _push(ssrRenderComponent(_component_SearchBar, {
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
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div></div>`);
      _push(ssrRenderComponent(_component_TheFooter, { class: "w-full" }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/home.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=home-Cv5GYEPO.mjs.map
