import { _ as __nuxt_component_0, a as __nuxt_component_2 } from './TheFooter-B-0Psyky.mjs';
import __nuxt_component_0$1 from './Icon-CT7HiOLN.mjs';
import { ref, provide, computed, watch, mergeProps, useSSRContext, defineComponent, createElementBlock, shallowRef, getCurrentInstance, cloneVNode, h } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr, ssrRenderList, ssrRenderStyle, ssrInterpolate } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/server-renderer/index.mjs';
import { debounce } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/lodash.js';
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
import './server.mjs';
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
    const debouncedEmitSearch = debounce((val) => emit("update:search", val), 300);
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
    watch(searchTerm, (newValue) => {
      debouncedEmitSearch(newValue);
      if (newValue === "") resetFilters();
    });
    watch(
      () => props.search,
      (newValue) => searchTerm.value = newValue
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start gap-2 w-full h-auto text-seagull-950" }, _attrs))}><div class="relative flex flex-row gap-0 w-full">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:magnify",
        size: "2rem",
        class: "top-[.4rem] left-[.75rem] absolute text-slate-200/60"
      }, null, _parent));
      _push(`<input type="search"${ssrRenderAttr("value", searchTerm.value)} class="bg-transparent focus:bg-transparent ps-12 pt-[.3rem] pr-3 pb-[.5rem] border-[#6dd3ff73] border-[1.5px] focus:border-seagull-400/50 rounded-lg outline-none w-full text-[1.5rem] text-slate-200 placeholder:text-seagull-200/50 leading-tight tracking-wide" placeholder="Search..."></div><div class="flex flex-row items-center gap-3 px-0 w-full"><div class="flex flex-row gap-2"><!--[-->`);
      ssrRenderList(pills, (pill) => {
        _push(ssrRenderComponent(PillButton, {
          key: pill.key,
          label: pill.label,
          count: pill.count.value,
          on: __props.filters[pill.key],
          onClick: ($event) => toggleFilter(pill.key)
        }, null, _parent));
      });
      _push(`<!--]--></div><span class="font-light text-slate-400 uppercase tracking-wider" style="${ssrRenderStyle({ "font-size": "1.155rem" })}">${ssrInterpolate(props.totalItemCount)}</span></div>`);
      if (searchTerm.value && props.totalCount === 0) {
        _push(`<div class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]" style="${ssrRenderStyle({ "margin-top": "3.5rem" })}"><h1 class="m-auto mt-16 font-light text-white text-2xl text-center">No results found.</h1></div>`);
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
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      var _a;
      if (mounted.value) {
        const vnodes = (_a = slots.default) == null ? void 0 : _a.call(slots);
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function shuffle(array) {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}
function interleaveContent(claims, quotes, memes) {
  claims = shuffle([...claims]);
  quotes = shuffle([...quotes]);
  memes = shuffle([...memes]);
  const output = [];
  let claimIndex = 0;
  let memeIndex = 0;
  const claimPairs = [];
  while (claimIndex + 1 < claims.length) {
    claimPairs.push([
      { type: "claim", data: claims[claimIndex] },
      { type: "claim", data: claims[claimIndex + 1] }
    ]);
    claimIndex += 2;
  }
  if (claimIndex < claims.length) {
    claimPairs.push([{ type: "claim", data: claims[claimIndex] }]);
  }
  const memePairs = [];
  while (memeIndex + 1 < memes.length) {
    memePairs.push([
      { type: "meme", data: memes[memeIndex] },
      { type: "meme", data: memes[memeIndex + 1] }
    ]);
    memeIndex += 2;
  }
  if (memeIndex < memes.length) {
    memePairs.push([{ type: "meme", data: memes[memeIndex] }]);
  }
  let pairIndex = 0, quoteIdx = 0, memePairIdx = 0;
  while (pairIndex < claimPairs.length || quoteIdx < quotes.length || memePairIdx < memePairs.length) {
    if (pairIndex < claimPairs.length) {
      output.push({ type: "claimPair", data: claimPairs[pairIndex++] });
    }
    if (quoteIdx < quotes.length) {
      output.push({ type: "quote", data: quotes[quoteIdx++] });
    }
    if (memePairIdx < memePairs.length) {
      output.push({ type: "memeRow", data: memePairs[memePairIdx++] });
    }
    if (quoteIdx < quotes.length) {
      output.push({ type: "quote", data: quotes[quoteIdx++] });
    }
  }
  return output;
}
function useContentFeed(providedSearchTerm = ref(""), providedContentFilters = ref({ claims: true, quotes: true, memes: true })) {
  const searchTerm = providedSearchTerm;
  const contentFilters = providedContentFilters;
  const displayedItems = ref([]);
  const allItems = ref([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const error = ref(null);
  const page = ref(1);
  const limit = ref(10);
  const contentCollections = {
    claims: ref([]),
    quotes: ref([]),
    memes: ref([])
  };
  const isInitialized = ref(false);
  const claimCount = ref(0);
  const quoteCount = ref(0);
  const memeCount = ref(0);
  function ensureFilterKeys(obj) {
    obj = obj && typeof obj === "object" ? obj : {};
    return {
      claims: typeof obj.claims === "boolean" ? obj.claims : true,
      quotes: typeof obj.quotes === "boolean" ? obj.quotes : true,
      memes: typeof obj.memes === "boolean" ? obj.memes : true
    };
  }
  const initialize = async () => {
    loading.value = true;
    try {
      console.log("Starting content initialization");
      const fetchClaims = fetch("/content-claims.json").then((res) => res.json()).then((data) => Array.isArray(data) ? data : []);
      const fetchQuotes = fetch("/content-quotes.json").then((res) => res.json()).then((data) => Array.isArray(data) ? data : []);
      const fetchMemes = fetch("/content-memes.json").then((res) => res.json()).then((data) => Array.isArray(data) ? data : []);
      const [claims, quotes, memes] = await Promise.all([fetchClaims, fetchQuotes, fetchMemes]);
      const filterSpecialFiles = (items) => {
        return (items || []).filter((item) => {
          var _a;
          const path = ((_a = item._path) == null ? void 0 : _a.toLowerCase()) || "";
          return !path.includes("readme") && !path.includes("__");
        });
      };
      contentCollections.claims.value = filterSpecialFiles(claims || []);
      contentCollections.quotes.value = filterSpecialFiles(quotes || []);
      contentCollections.memes.value = filterSpecialFiles(memes || []);
      claimCount.value = contentCollections.claims.value.length;
      quoteCount.value = contentCollections.quotes.value.length;
      memeCount.value = contentCollections.memes.value.length;
      if (false) ;
      else {
        console.log(
          `Claims: ${claimCount.value}  Quotes: ${quoteCount.value}  Memes: ${memeCount.value}`
        );
      }
      isInitialized.value = true;
      createContentWall();
    } catch (err) {
      console.error("Error loading content:", err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };
  const createContentWall = () => {
    const filteredCollections = {
      claims: ensureFilterKeys(contentFilters.value).claims ? contentCollections.claims.value.slice() : [],
      quotes: ensureFilterKeys(contentFilters.value).quotes ? contentCollections.quotes.value.slice() : [],
      memes: ensureFilterKeys(contentFilters.value).memes ? contentCollections.memes.value.slice() : []
    };
    const uniqueItems = {
      claims: [...new Set(filteredCollections.claims.map((c) => c._path))].map(
        (path) => filteredCollections.claims.find((c) => c._path === path)
      ),
      quotes: [...new Set(filteredCollections.quotes.map((q) => q._path))].map(
        (path) => filteredCollections.quotes.find((q) => q._path === path)
      ),
      memes: [...new Set(filteredCollections.memes.map((m) => m._path))].map(
        (path) => filteredCollections.memes.find((m) => m._path === path)
      )
    };
    const enabledTypes = Object.entries(ensureFilterKeys(contentFilters.value)).filter(([k, v]) => v).map(([k]) => k);
    let wall = [];
    if (enabledTypes.length === 1) {
      const type = enabledTypes[0];
      if (type === "claims") {
        for (let i = 0; i < uniqueItems.claims.length; i += 2) {
          const pair = [
            { type: "claim", data: uniqueItems.claims[i] },
            uniqueItems.claims[i + 1] ? { type: "claim", data: uniqueItems.claims[i + 1] } : null
          ].filter(Boolean);
          wall.push({ type: "claimPair", data: pair });
        }
      } else if (type === "quotes") {
        wall = uniqueItems.quotes.map((q) => ({ type: "quote", data: q }));
      } else if (type === "memes") {
        for (let i = 0; i < uniqueItems.memes.length; i += 2) {
          const pair = [
            { type: "meme", data: uniqueItems.memes[i] },
            uniqueItems.memes[i + 1] ? { type: "meme", data: uniqueItems.memes[i + 1] } : null
          ].filter(Boolean);
          wall.push({ type: "memeRow", data: pair });
        }
      }
    } else if (enabledTypes.length === 2) {
      if (!contentFilters.value.claims) {
        const maxLen = Math.max(uniqueItems.quotes.length, uniqueItems.memes.length);
        for (let i = 0; i < maxLen; i++) {
          if (uniqueItems.quotes[i]) wall.push({ type: "quote", data: uniqueItems.quotes[i] });
          if (uniqueItems.memes[i]) {
            const pair = [
              { type: "meme", data: uniqueItems.memes[i] },
              uniqueItems.memes[i + 1] ? { type: "meme", data: uniqueItems.memes[i + 1] } : null
            ].filter(Boolean);
            wall.push({ type: "memeRow", data: pair });
            i++;
          }
        }
      } else if (!contentFilters.value.quotes) {
        const maxLen = Math.max(
          Math.ceil(uniqueItems.claims.length / 2),
          Math.ceil(uniqueItems.memes.length / 2)
        );
        for (let i = 0, ci = 0, mi = 0; i < maxLen; i++) {
          if (ci < uniqueItems.claims.length) {
            const pair = [
              { type: "claim", data: uniqueItems.claims[ci++] },
              ci < uniqueItems.claims.length ? { type: "claim", data: uniqueItems.claims[ci++] } : null
            ].filter(Boolean);
            wall.push({ type: "claimPair", data: pair });
          }
          if (mi < uniqueItems.memes.length) {
            const pair = [
              { type: "meme", data: uniqueItems.memes[mi++] },
              mi < uniqueItems.memes.length ? { type: "meme", data: uniqueItems.memes[mi++] } : null
            ].filter(Boolean);
            wall.push({ type: "memeRow", data: pair });
          }
        }
      } else if (!contentFilters.value.memes) {
        const claimPairs = [];
        for (let i = 0; i < uniqueItems.claims.length; i += 2) {
          const pair = [
            { type: "claim", data: uniqueItems.claims[i] },
            uniqueItems.claims[i + 1] ? { type: "claim", data: uniqueItems.claims[i + 1] } : null
          ].filter(Boolean);
          claimPairs.push({ type: "claimPair", data: pair });
        }
        let quoteIndex = 0;
        const pairsPerQuote = 2;
        for (let i = 0; i < claimPairs.length; i++) {
          wall.push(claimPairs[i]);
          if ((i + 1) % pairsPerQuote === 0 && quoteIndex < uniqueItems.quotes.length) {
            wall.push({ type: "quote", data: uniqueItems.quotes[quoteIndex++] });
          }
        }
        while (quoteIndex < uniqueItems.quotes.length) {
          wall.push({ type: "quote", data: uniqueItems.quotes[quoteIndex++] });
        }
      }
    } else {
      wall = interleaveContent(uniqueItems.claims, uniqueItems.quotes, uniqueItems.memes);
    }
    allItems.value = wall;
    displayedItems.value = wall.slice(0, limit.value);
    hasMore.value = wall.length > limit.value;
    page.value = 2;
  };
  const loadMoreContent = () => {
    if (!hasMore.value || loading.value) return;
    loading.value = true;
    const start = (page.value - 1) * limit.value;
    const end = start + limit.value;
    const newItems = allItems.value.slice(start, end);
    displayedItems.value = [...displayedItems.value, ...newItems];
    hasMore.value = end < allItems.value.length;
    page.value++;
    loading.value = false;
  };
  const performSearch = async (query) => {
    loading.value = true;
    displayedItems.value = [];
    page.value = 1;
    try {
      if (query) {
        const searchParams = new URLSearchParams({ query });
        const searchUrl = `/api/content/search?${searchParams.toString()}`;
        console.log(`Searching for: "${query}" using ${searchUrl}`);
        const response = await fetch(searchUrl);
        const searchResults = await response.json();
        console.log(`Search returned ${searchResults.length} total results`);
        let claimsResults = [];
        let quotesResults = [];
        let memesResults = [];
        if (contentFilters.value.claims) {
          claimsResults = searchResults.filter((item) => {
            var _a;
            return (_a = item._path) == null ? void 0 : _a.startsWith("/claims/");
          });
          console.log(`Found ${claimsResults.length} claim results`);
        }
        if (contentFilters.value.quotes) {
          quotesResults = searchResults.filter((item) => {
            var _a;
            return (_a = item._path) == null ? void 0 : _a.startsWith("/quotes/");
          });
          console.log(`Found ${quotesResults.length} quote results`);
        }
        if (contentFilters.value.memes) {
          memesResults = searchResults.filter((item) => {
            var _a;
            return (_a = item._path) == null ? void 0 : _a.startsWith("/memes/");
          });
          console.log(`Found ${memesResults.length} meme results`);
        }
        contentCollections.claims.value = claimsResults;
        contentCollections.quotes.value = quotesResults;
        contentCollections.memes.value = memesResults;
      } else {
        console.log("Search cleared, restoring all content");
        await initialize();
        return;
      }
      createContentWall();
    } catch (err) {
      console.error("Search error:", err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };
  const debouncedSearch = debounce((term) => {
    console.log(`Debounced search triggered with term: "${term}"`);
    if (term === "") {
      console.log("Empty search term detected, restoring all content");
      initialize().then(() => {
        console.log("Content reinitialized after search cleared");
        createContentWall();
      });
    } else {
      performSearch(term);
    }
  }, 300);
  watch(
    [searchTerm, contentFilters],
    ([newSearchTerm, newFilters]) => {
      console.log(`Search term changed to: "${newSearchTerm}"`);
      if (newSearchTerm === "") {
        initialize();
      } else {
        debouncedSearch(newSearchTerm);
      }
    },
    { deep: true }
  );
  return {
    searchTerm,
    contentFilters,
    loadMoreContent,
    displayedItems,
    loading,
    hasMore,
    error,
    contentCollections,
    // <-- expose contentCollections for global counts
    claimCount,
    quoteCount,
    memeCount
  };
}
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
      const _component_SearchBar = _sfc_main$1;
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
//# sourceMappingURL=home-w8ArmWxj.mjs.map
