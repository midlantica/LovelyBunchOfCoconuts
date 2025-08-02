<!-- components/wall/ClaimPanel.vue -->
<template>
  <div
    v-if="claim && claim.claim && claim.translation && slug"
    class="flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] px-4 py-3 border hover:border hover:border-seagull-400 border-transparent rounded-lg h-full text-white transition-colors cursor-pointer"
  >
    <div class="my-auto">
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2 class="font-light text-xl line-clamp-1 tracking-wide">
          {{ claim.claim }}
        </h2>
      </div>
      <hr class="my-2 border-white/10 border-t" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2
          class="font-light text-xl line-clamp-1 tracking-wide"
          v-if="claim.translation"
        >
          {{ claim.translation }}
        </h2>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col gap-2 bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] px-4 py-3 rounded-lg h-full text-white"
  >
    <div class="my-auto">
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2 class="line-clamp-1">
          {{ claim && claim.claim ? claim.claim : 'Missing claim' }}
        </h2>
      </div>
      <hr class="my-2 border-white/10 border-t" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2 class="line-clamp-1" v-if="claim && claim.translation">
          {{ claim.translation }}
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    claim: Object,
    slug: String,
  })
</script>
