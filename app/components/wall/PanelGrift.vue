<!-- components/wall/GriftPanel.vue -->
<template>
  <div
    v-if="grift && grift.grift && grift.decode && slug"
    class="group isolate relative shadow-inset-card flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 px-4 py-3 border hover:border hover:border-seagull-400/50 border-transparent rounded-lg h-full text-white transition-colors cursor-pointer"
    @click="openModal"
  >
    <!-- Like button only -->
    <div class="top-1 right-1 z-[20] absolute">
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
          class="text-shadow-xs font-100 text-xl line-clamp-1 tracking-wide"
          v-if="grift.grift"
        >
          {{ grift.grift }}
        </h2>
      </div>
      <UiDividerArrow wrapper-class="my-2" />
      <div class="flex items-center gap-3">
        <img src="~/assets/icons/player_icon.svg" alt="Player" class="w-8" />
        <h2
          class="text-shadow-xs font-100 text-xl line-clamp-1 tracking-wide"
          v-if="grift.decode"
        >
          {{ grift.decode }}
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
          {{ grift && grift.grift ? grift.grift : 'Missing grift' }}
        </h2>
      </div>
      <hr class="my-2 border-white/10 border-t" />
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

  function openModal() {
    // Emit event to parent to open modal
    // This will be handled by the parent component
    console.log('Opening modal for grift:', props.slug)
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
    console.log('Link copied to clipboard!')
  }
</script>
