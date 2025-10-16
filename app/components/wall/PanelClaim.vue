<!-- components/wall/ClaimPanel.vue -->
<template>
  <div
    v-if="claim && claim.claim && claim.translation && slug"
    class="group isolate relative shadow-inset-card flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 px-4 py-3 border hover:border hover:border-seagull-400/50 border-transparent rounded-lg h-full text-white transition-colors cursor-pointer"
    @click="openModal"
  >
    <!-- Like button only -->
    <div class="top-1 right-1 z-[20] absolute">
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
          class="text-shadow-xs font-100 text-xl line-clamp-1 tracking-wide"
          v-if="claim.claim"
        >
          {{ claim.claim }}
        </h2>
      </div>
      <UiDividerArrow wrapper-class="my-2" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2
          class="text-shadow-xs font-100 text-xl line-clamp-1 tracking-wide"
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

  const contentType = computed(() => 'political claim')

  function openModal() {
    // Emit event to parent to open modal
    // This will be handled by the parent component
    console.log('Opening modal for claim:', props.slug)
  }

  function shareContent() {
    const url = `${window.location.origin}/${props.slug}`
    const title = props.claim?.claim || 'Political Claim'
    const description = `Check out this political claim from WakeUpNPC - Political Claims, Quotes & Memes`

    // Use Web Share API if available (mobile)
    if (navigator.share) {
      navigator
        .share({
          title: `WakeUpNPC - ${title}`,
          text: description,
          url: url,
        })
        .catch(() => {
          // Fallback to copying URL
          copyToClipboard(url)
        })
    } else {
      // Fallback to copying URL
      copyToClipboard(url)
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }

    // Show toast notification (you could add a toast system)
    console.log('Link copied to clipboard!')
  }
</script>
