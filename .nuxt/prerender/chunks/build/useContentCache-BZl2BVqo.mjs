import { reactive } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs';

const contentCache = reactive({
  claims: {},
  quotes: {},
  memes: {},
  allClaims: null,
  allQuotes: null,
  allMemes: null
});
const loadingStates = reactive({
  claims: {},
  quotes: {},
  memes: {},
  allClaims: false,
  allQuotes: false,
  allMemes: false
});
function useContentCache() {
  const getContentItem = async (contentType, slug) => {
    const fullPath = `/${contentType}/${slug}`;
    if (contentCache[contentType][fullPath]) {
      return contentCache[contentType][fullPath];
    }
    loadingStates[contentType][fullPath] = true;
    try {
      if (!contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]) {
        const res = await fetch(`/content-${contentType}.json`);
        const data = await res.json();
        contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = data;
      }
      const allItems = contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`];
      const item = allItems.find((entry) => entry._path === fullPath);
      if (item) {
        contentCache[contentType][fullPath] = item;
      }
      return item || null;
    } catch (error) {
      console.error(`Error loading ${contentType} item from static JSON:`, error);
      return null;
    } finally {
      loadingStates[contentType][fullPath] = false;
    }
  };
  const getAllContent = async (contentType) => {
    if (contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`]) {
      return contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`];
    }
    loadingStates[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = true;
    try {
      const response = await fetch(`/content-${contentType}.json`);
      const data = await response.json();
      if (data && !data.error) {
        contentCache[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = data;
      }
      return data;
    } catch (error) {
      console.error(`Error fetching all ${contentType}:`, error);
      return [];
    } finally {
      loadingStates[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`] = false;
    }
  };
  const prefetchContentItem = async (path) => {
    if (!path || path === "/") return;
    const pathParts = path.split("/");
    if (pathParts.length < 3) return;
    const contentType = pathParts[1];
    const slugParts = pathParts.slice(2);
    const slug = slugParts.join("/");
    if (["claims", "quotes", "memes"].includes(contentType) && !contentCache[contentType][`/${contentType}/${slug}`]) {
      console.log(`Prefetching ${contentType} item: ${slug}`);
      getContentItem(contentType, slug).catch((err) => {
        console.error(`Error prefetching ${contentType} item:`, err);
      });
    }
  };
  const isLoading = (contentType, slug) => {
    const fullPath = `/${contentType}/${slug}`;
    return !!loadingStates[contentType][fullPath];
  };
  const isLoadingAll = (contentType) => {
    return loadingStates[`all${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`];
  };
  return {
    getContentItem,
    getAllContent,
    prefetchContentItem,
    isLoading,
    isLoadingAll,
    contentCache
  };
}

export { useContentCache as u };
//# sourceMappingURL=useContentCache-BZl2BVqo.mjs.map
