<!-- components/wall/ClaimPanel.vue -->
<template>
  <div
    v-if="claim && claim.claim && claim.translation && slug"
    class="card group shadow-inset-card hover:border-seagull-400/50 relative isolate flex h-full cursor-pointer! flex-col gap-2 rounded-lg border border-transparent px-4 py-3 text-white transition-colors hover:border hover:bg-slate-900"
    @click="openModal"
  >
    <!-- Like button only -->
    <div class="absolute top-1 right-1 z-20">
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
          class="font-100 line-clamp-1 tracking-wide text-shadow-xs"
          :style="{ fontSize: claimFontSize, lineHeight: '1.4' }"
          v-if="claim.claim"
        >
          {{ claim.claim }}
        </h2>
      </div>
      <UiDividerArrow wrapper-class="my-2" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2
          class="font-100 line-clamp-1 tracking-wide text-shadow-xs"
          :style="{ fontSize: translationFontSize, lineHeight: '1.4' }"
          v-if="claim.translation"
        >
          {{ claim.translation }}
        </h2>
      </div>
    </div>
  </div>
  <div
    v-else
    class="card shadow-inset-card relative flex h-full flex-col gap-2 rounded-lg px-4 py-3 text-white"
  >
    <div class="my-auto">
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2 class="line-clamp-1">
          {{ claim && claim.claim ? claim.claim : 'Missing claim' }}
        </h2>
      </div>
      <hr class="my-2 border-t border-white/10" />
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

  // Calculate font size based on text length
  const claimFontSize = computed(() => {
    const text = props.claim?.claim || ''
    const length = text.length

    if (length > 300) return '0.75rem' // 12px for very long text
    if (length > 200) return '0.875rem' // 14px for long text
    if (length > 100) return '1rem' // 16px for medium text
    return '1.25rem' // 20px for normal text
  })

  const translationFontSize = computed(() => {
    const text = props.claim?.translation || ''
    const length = text.length

    if (length > 300) return '0.75rem'
    if (length > 200) return '0.875rem'
    if (length > 100) return '1rem'
    return '1.25rem'
  })

  function openModal() {
    // Emit event to parent to open modal
    // This will be handled by the parent component
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
  }
</script>
