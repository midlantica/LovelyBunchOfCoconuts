// /composables/useNavigation.js
import { computed } from 'vue'

export function useNavigation(items, currentSlug, basePath = '') {
  return computed(() => {
    if (!items.value || !items.value.length) {
      console.warn(`🚨 No items found for navigation in ${basePath}`)
      return { prevSlug: '/', nextSlug: '/' }
    }

    // Ensure currentSlug is a string
    const normalizedSlug = String(
      currentSlug.value || currentSlug
    ).toLowerCase()
    // console.log("🔍 Normalized Current Slug:", normalizedSlug);

    // ✅ Find index properly
    const index = items.value.findIndex((item) => {
      const formattedPath = item.path.toLowerCase()
      // console.log("🟡 Checking Path:", formattedPath);
      return formattedPath === `${basePath}/${normalizedSlug}`
    })

    if (index === -1) {
      // console.warn(`⚠️ Could not find slug: ${normalizedSlug} in ${basePath}`);
      return { prevSlug: '/', nextSlug: '/' }
    }

    // console.log("✅ Found Slug at Index:", index);

    const prevIndex = index === 0 ? items.value.length - 1 : index - 1
    const nextIndex = index === items.value.length - 1 ? 0 : index + 1

    return {
      prevSlug: items.value[prevIndex]?.path || '/',
      nextSlug: items.value[nextIndex]?.path || '/',
    }
  })
}
