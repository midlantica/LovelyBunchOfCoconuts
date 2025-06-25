import { reactive } from 'vue';

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
      const response = await fetch(`/api/content/item?path=${encodeURIComponent(fullPath)}`);
      const data = await response.json();
      if (data && !data.error) {
        contentCache[contentType][fullPath] = data;
      }
      return data;
    } catch (error) {
      console.error(`Error fetching ${contentType} item:`, error);
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
      const response = await fetch(`/api/content?type=${contentType}`);
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
//# sourceMappingURL=useContentCache-lE4rpJVf.mjs.map
