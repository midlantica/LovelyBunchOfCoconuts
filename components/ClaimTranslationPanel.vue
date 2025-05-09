<!-- components/ClaimTranslationPanel.vue -->
<template>
  <router-link
    v-if="claim && claim.claim && claim.translation && slug"
    :to="slug"
    class="shadow-[inset_0_0_12px_0_#0f1e24] h-full flex flex-col gap-2 px-4 py-3 text-white bg-gray-800 rounded-lg transition-colors hover:bg-gray-700"
  >
    <div class="my-auto">
      <div class="flex items-center gap-3">
        <img src="../assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2 class="text-xl font-light tracking-wide line-clamp-1">
          {{ claim.claim }}
        </h2>
      </div>
      <hr class="border-white/10 my-2 border-t" />
      <div class="flex items-center gap-3">
        <img src="../assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2 class="text-xl font-light tracking-wide line-clamp-1" v-if="claim.translation">
          {{ claim.translation }}
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
        <img src="../assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2 class="line-clamp-1">
          {{ claim && claim.claim ? claim.claim : "Missing claim" }}
        </h2>
      </div>
      <hr class="border-white/10 my-2 border-t" />
      <div class="flex items-center gap-3">
        <img src="../assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2 class="line-clamp-1" v-if="claim && claim.translation">
          {{ claim.translation }}
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
</script>
