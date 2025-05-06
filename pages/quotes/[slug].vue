<!-- pages/quotes/[slug].vue -->
<template>
  <div v-if="currentItem" class="quotes-pg w-full flex flex-col gap-3">
    <ContentNavigation :prev-slug="prevSlug" :next-slug="nextSlug" />
    <div class="quote-details p-4 text-white bg-gray-800 rounded-md">
      <article class="prose prose-invert">
        <div v-if="currentItem.body">
          <ContentRenderer :value="currentItem.body">
            <template #default="{ data }">
              <div v-for="(node, index) in data" :key="index">
                <!-- Render h2 (quote) -->
                <h2 v-if="node.tag === 'h2'" class="text-xl font-light tracking-wider">
                  {{ node.children[0]?.value }}
                </h2>
                <!-- Render attribution with em-dash -->
                <p
                  v-else-if="node.type === 'element' && node.children?.[0]?.value"
                  class="text-lg font-light text-slate-300"
                >
                  — {{ node.children[0].value }}
                </p>
              </div>
            </template>
          </ContentRenderer>
        </div>
        <div v-else>
          <!-- Fallback rendering -->
          <h2 class="text-xl font-light tracking-wider">{{ currentItem.title || "No title" }}</h2>
          <p class="text-lg font-light text-slate-300">— (Attribution missing)</p>
        </div>
      </article>
    </div>
  </div>
  <div v-else>
    <p class="text-red-500">🚨 Quote not found!</p>
  </div>
</template>

<script setup>
import { useContentNavigation } from "@/composables/useContentNavigation"

const { currentItem, prevSlug, nextSlug } = useContentNavigation("quotes")

// Safe debug
console.log("currentItem:", {
  title: currentItem.title,
  slug: currentItem._path,
  bodyExists: !!currentItem.body,
  body: currentItem.body ? "present" : "undefined",
})
</script>

<style scoped>
/* Keep Tailwind styles consistent */
.prose :where(p):not(:where([class~="not-prose"], [class~="not-prose"] *)) {
  @apply text-lg font-light text-slate-300 tracking-wider;
}
</style>
