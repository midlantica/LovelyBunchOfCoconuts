import { computed } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs';

function useNavigation(items, currentSlug, basePath = "") {
  return computed(() => {
    var _a, _b;
    if (!items.value || !items.value.length) {
      console.warn(`\u{1F6A8} No items found for navigation in ${basePath}`);
      return { prevSlug: "/", nextSlug: "/" };
    }
    const normalizedSlug = String(currentSlug.value || currentSlug).toLowerCase();
    const index = items.value.findIndex((item) => {
      const formattedPath = item.path.toLowerCase();
      return formattedPath === `${basePath}/${normalizedSlug}`;
    });
    if (index === -1) {
      return { prevSlug: "/", nextSlug: "/" };
    }
    const prevIndex = index === 0 ? items.value.length - 1 : index - 1;
    const nextIndex = index === items.value.length - 1 ? 0 : index + 1;
    return {
      prevSlug: ((_a = items.value[prevIndex]) == null ? void 0 : _a.path) || "/",
      nextSlug: ((_b = items.value[nextIndex]) == null ? void 0 : _b.path) || "/"
    };
  });
}

export { useNavigation as u };
//# sourceMappingURL=useNavigation-DrmvaAAr.mjs.map
