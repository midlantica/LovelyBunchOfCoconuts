<template>
  <button
    :aria-label="ariaLabel"
    :aria-pressed="liked ? 'true' : 'false'"
    class="group relative inline-flex cursor-pointer! items-center rounded-md px-0 py-0 select-none focus:outline-none"
    :class="outerClass"
    type="button"
    data-like-button="true"
    :data-like-id="id"
    @click.stop.prevent.capture="onToggle"
    @keydown.enter.prevent.stop="onToggle"
    @keydown.space.prevent.stop="onToggle"
  >
    <!-- Outside count (reversed order) -->
    <span
      v-if="!countInside && isReversed && showCount && displayCount > 0"
      class="font-300 min-w-[1ch] pr-1 pl-0.5 text-xs tabular-nums transition-colors"
      :class="
        isSolid
          ? 'text-seagull-700'
          : 'text-seagull-700/70 group-hover:text-seagull-700'
      "
      >{{ abbreviated }}</span
    >
    <span
      class="inline-flex items-center justify-center rounded-full transition-all duration-150 [text-shadow:0_1px_1px_rgba(0,0,0,0.6)]"
      :class="[
        'h-8',
        isSolid
          ? 'text-seagull-700'
          : fadedUnliked
            ? 'text-seagull-700/50 hover:text-seagull-700'
            : 'text-seagull-700/70 hover:text-seagull-700',
        countInside ? 'relative' : isReversed ? 'ml-1' : 'mr-1',
      ]"
    >
      <Icon
        :key="isSolid ? 'heart-solid' : 'heart-outline'"
        :name="isSolid ? 'heroicons:heart-20-solid' : 'heroicons:heart'"
        class="transition-all duration-200 group-hover:brightness-125 group-hover:drop-shadow-[0_0_12px_#33c3fd]"
        :class="[
          isSolid ? 'heart-gradient scale-105' : 'scale-100',
          !isSolid && fadedUnliked
            ? 'text-[#b3b3b3]/50'
            : !isSolid
              ? 'text-[#b3b3b3]'
              : '',
        ]"
        :size="iconSize"
      />
      <span
        v-if="countInside && displayCount > 0 && showCount"
        class="font-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[0.8rem] tracking-tight text-white select-none [text-shadow:0px_1px_1px_#000000]"
        >{{ abbreviated }}</span
      >
    </span>
    <!-- Outside count (normal order) -->
    <span
      v-if="!countInside && !isReversed && showCount && displayCount > 0"
      class="font-300 min-w-[1ch] pr-1 pl-0.5 text-xs tabular-nums transition-colors"
      :class="
        isSolid
          ? 'text-seagull-700'
          : 'text-seagull-700/70 group-hover:text-seagull-700'
      "
      >{{ abbreviated }}</span
    >
  </button>
</template>

<script setup>
  const props = defineProps({
    id: { type: String, required: true },
    title: { type: String, default: '' },
    countInside: { type: Boolean, default: true },
    hideZero: { type: Boolean, default: true },
    outerClass: { type: [String, Array, Object], default: () => [] },
    reverse: { type: Boolean, default: false },
    iconSize: { type: String, default: '1.6rem' },
    fadedUnliked: { type: Boolean, default: false },
  })

  const isReversed = computed(() => {
    if (props.reverse) return true
    const cls = props.outerClass
    if (typeof cls === 'string') return cls.includes('flex-row-reverse')
    if (Array.isArray(cls))
      return cls.some(
        (c) => typeof c === 'string' && c.includes('flex-row-reverse')
      )
    if (cls && typeof cls === 'object') {
      return Object.entries(cls).some(
        ([k, v]) => v && k.includes('flex-row-reverse')
      )
    }
    return false
  })

  const emit = defineEmits(['toggle'])
  const { isLiked, getCount, toggleLike, hydrateServer } = useLikes()

  const liked = computed(() => isLiked(props.id))
  const count = computed(() => getCount(props.id))
  // Display rules:
  // 1. If count > 0 -> show that count (solid heart)
  // 2. If user has liked but count still 0 (optimistic race) -> show 1 (solid heart)
  // 3. Else -> show 0 (outline heart, no number)
  const displayCount = computed(() => {
    if (count.value > 0) return count.value
    if (liked.value) return 1
    return 0
  })
  const showCount = computed(() =>
    props.hideZero ? displayCount.value > 0 : true
  )
  // Heart is solid ONLY when a number will be displayed; prevents solid-without-number state.
  const isSolid = computed(() => displayCount.value > 0)

  function formatAbbrev(n) {
    if (n < 1000) return n.toString()
    const units = [
      { v: 1e9, s: 'B' },
      { v: 1e6, s: 'M' },
      { v: 1e3, s: 'K' },
    ]
    for (const u of units) {
      if (n >= u.v) {
        const val = n / u.v
        if (val >= 100) return Math.round(val) + u.s
        const rounded = Math.round(val * 10) / 10
        return (
          (rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)) + u.s
        )
      }
    }
    return n.toString()
  }
  const abbreviated = computed(() => formatAbbrev(displayCount.value))
  const ariaLabel = computed(() =>
    `${liked.value ? 'Unlike' : 'Like'} ${props.title || ''}`.trim()
  )

  function onToggle(e) {
    if (e) {
      if (typeof e.stopPropagation === 'function') e.stopPropagation()
      if (typeof e.preventDefault === 'function') e.preventDefault()
      if (typeof e.stopImmediatePropagation === 'function')
        e.stopImmediatePropagation()
    }
    toggleLike(props.id)
    emit('toggle', { id: props.id, liked: liked.value, count: count.value })
    // Schedule a server reconciliation so any stale optimistic local count is corrected quickly
    setTimeout(() => hydrateServer([props.id]), 150)
  }

  // PERFORMANCE: Completely disable individual hydration to avoid blocking modals
  // The hydration plugin will handle all hydration after user interaction
  onMounted(() => {
    // Individual button hydration is now handled by the hydration plugin
    // This prevents any blocking API calls when modals open
  })
</script>

<style scoped>
  @media (hover: hover) {
    button:hover span:first-child {
      transform: scale(1.05);
    }
  }

  .heart-gradient {
    background: radial-gradient(circle, #00a5ff, #00649b, #000000) !important;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
