<!-- components/wall/GriftPanel.vue -->
<template>
  <div
    v-if="grift && grift.grift && grift.decode && slug"
    class="card group shadow-inset-card hover:border-seagull-400/50 relative isolate flex h-full cursor-pointer! flex-col gap-2 rounded-lg border border-transparent px-4 py-3 text-white transition-colors hover:border hover:bg-slate-900"
    @click="openModal"
  >
    <!-- Like button only -->
    <div class="absolute top-1 right-1 z-20">
      <UiLikeButton
        :id="grift?._path || grift?.path || slug"
        :title="grift?.grift || 'grift'"
        :count-inside="true"
        :hide-zero="true"
        :faded-unliked="true"
        @click.stop
      />
    </div>
    <div class="my-auto">
      <!-- Original paired structure: grift + decode -->
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/npc_icon.svg" alt="NPC" class="w-8" />
        <h2
          class="font-100 line-clamp-1 tracking-wide text-shadow-xs"
          :style="{ fontSize: griftFontSize, lineHeight: '1.4' }"
          v-if="grift.grift"
        >
          {{ `&lsquo;${grift.grift}&rsquo;` }}
        </h2>
      </div>
      <UiDividerArrow wrapper-class="my-2" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2
          class="font-100 line-clamp-1 tracking-wide text-shadow-xs"
          :style="{ fontSize: decodeFontSize, lineHeight: '1.4' }"
          v-if="grift.decode"
        >
          {{ grift.decode }}
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
          {{ grift && grift.grift ? `'${grift.grift}'` : 'Missing grift' }}
        </h2>
      </div>
      <hr class="my-2 border-t border-white/10" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2 class="line-clamp-1" v-if="grift && grift.decode">
          {{ grift.decode }}
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    grift: Object,
    slug: String,
  })

  const contentType = computed(() => 'political grift')

  // Calculate font size based on text length
  const griftFontSize = computed(() => {
    const text = props.grift?.grift || ''
    const length = text.length

    if (length > 300) return '0.75rem' // 12px for very long text
    if (length > 200) return '0.875rem' // 14px for long text
    if (length > 100) return '1rem' // 16px for medium text
    return '1.25rem' // 20px for normal text
  })

  const decodeFontSize = computed(() => {
    const text = props.grift?.decode || ''
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
    const title = props.grift?.grift || 'Political Grift'
    const description = `Check out this political grift from WakeUpNPC - Political Grifts, Quotes & Memes`

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
