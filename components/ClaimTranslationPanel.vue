<!-- components/ClaimTranslationPanel.vue -->
<template>
  <router-link
    v-if="claimHeadings.length && slug"
    :to="slug"
    class="shadow-[inset_0_0_12px_0_#0f1e24] h-full flex flex-col gap-2 px-4 py-3 text-white bg-gray-800 rounded-lg transition-colors hover:bg-gray-700"
  >
    <div class="my-auto">
      <div class="flex items-center gap-3">
        <img src="../assets/icons/npc_icon.svg"
alt="NPC"
class="w-8" />
        <h2 class="line-clamp-1">
          {{ claimHeadings[0] }}
        </h2>
      </div>
      <hr class="border-white/10 my-2 border-t" />
      <div class="flex items-center gap-3">
        <img src="../assets/icons/player_icon.svg"
alt="Player"
class="w-8" />
        <h2 class="line-clamp-1" v-if="translationHeadings.length">
          {{ translationHeadings[0] }}
        </h2>
      </div>
    </div>
  </router-link>
  <div
    v-else
    class="shadow-[inset_0_0_12px_0_#0f1e24] h-full flex flex-col gap-2 px-4 py-3 text-white bg-gray-800 rounded-lg"
  >
    <div class="my-auto">
      <div class="flex items-center gap-3">
        <img src="../assets/icons/npc_icon.svg"
alt="NPC"
class="w-8" />
        <h2 class="line-clamp-1">
          {{ claimHeadings.length ? claimHeadings[0] : "Missing claim" }}
        </h2>
      </div>
      <hr class="border-white/10 my-2 border-t" />
      <div class="flex items-center gap-3">
        <img src="../assets/icons/player_icon.svg"
alt="Player"
class="w-8" />
        <h2 class="line-clamp-1" v-if="translationHeadings.length">
          {{ translationHeadings[0] }}
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from "vue"

  const props = defineProps({
    claim: Object,
    slug: String,
  })

  const extractHeadings = (body) => {
    // Nuxt Content v3 structure
    if (body?.content) {
      return (body.content.children || [])
        .filter(node => node.tag === 'h1' || node.tag === 'h2')
        .map(node => node.children[0].value)
    }
    
    // Fallback to v2 structure
    if (body?.value) {
      return body.value
        .filter((node) => Array.isArray(node) && (node[0] === "h1" || node[0] === "h2"))
        .map((node) => node[2])
    }
    
    return []
  }

  const claimHeadings = computed(() => extractHeadings(props.claim?.body ?? {}))
  const translationHeadings = computed(() =>
    claimHeadings.value.length > 1 ? [claimHeadings.value[1]] : []
  )
</script>
