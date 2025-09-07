<!-- components/wall/ClaimPanel.vue -->
<template>
  <div
    v-if="claim && claim.claim && claim.translation && slug"
    class="group relative shadow-inset-card flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 px-4 py-3 border hover:border hover:border-seagull-400/50 border-transparent rounded-lg h-full text-white transition-colors cursor-pointer"
  >
    <!-- Single like overlay (number left / heart right) -->
    <div class="top-1 right-1 z-10 absolute">
      <UiLikeButton
        :id="claim?._path || claim?.path || slug"
        :title="claim?.claim || 'claim'"
        :count-inside="true"
        :hide-zero="true"
        :faded-unliked="true"
        @click.stop
      />
    </div>
    <div class="my-auto">
      <!-- Original paired structure: claim + translation -->
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2
          class="text-shadow-xs font-[100] text-xl line-clamp-1 tracking-wide"
          v-if="claim.claim"
        >
          {{ claim.claim }}
        </h2>
      </div>
      <UiDividerArrow wrapper-class="my-2" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2
          class="text-shadow-xs font-[100] text-xl line-clamp-1 tracking-wide"
          v-if="claim.translation"
        >
          {{ claim.translation }}
        </h2>
      </div>
    </div>
  </div>
  <div
    v-else
    class="relative shadow-inset-card flex flex-col gap-2 bg-slate-800 px-4 py-3 rounded-lg h-full text-white"
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
