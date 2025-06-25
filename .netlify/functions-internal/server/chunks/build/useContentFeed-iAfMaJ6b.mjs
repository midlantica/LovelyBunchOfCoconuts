import { ref, watch, defineComponent, createElementBlock, shallowRef, getCurrentInstance, provide, cloneVNode, h } from 'vue';
import { debounce } from 'lodash-es';

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
      const fetchClaims = fetch("/api/content?type=claims").then((res) => res.json()).then((data) => Array.isArray(data) ? data : []);
      const fetchQuotes = fetch("/api/content?type=quotes").then((res) => res.json()).then((data) => Array.isArray(data) ? data : []);
      const fetchMemes = fetch("/api/content?type=memes").then((res) => res.json()).then((data) => Array.isArray(data) ? data : []);
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

export { useContentFeed as u };
//# sourceMappingURL=useContentFeed-iAfMaJ6b.mjs.map
