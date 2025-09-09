<template>
  <button
    :aria-label="ariaLabel"
    :aria-pressed="liked ? 'true' : 'false'"
    class="group inline-flex relative items-center px-1 py-0.5 rounded-md focus:outline-none cursor-pointer select-none"
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
      class="pr-1 pl-0.5 min-w-[1ch] font-medium tabular-nums text-xs transition-colors"
      :class="
        isSolid
          ? 'text-seagull-700'
          : 'text-seagull-700/70 group-hover:text-seagull-700'
      "
      >{{ abbreviated }}</span
    >
    <span
      class="inline-flex justify-center items-center rounded-full transition-all duration-150"
      :class="[
        'w-8 h-8',
        isSolid
          ? 'text-seagull-700'
          : fadedUnliked
          ? 'text-seagull-700/50 hover:text-seagull-700'
          : 'text-seagull-700/70 hover:text-seagull-700',
        countInside ? 'relative' : isReversed ? 'ml-1' : 'mr-1',
      ]"
      style="text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6)"
    >
      <Icon
        :key="isSolid ? 'heart-solid' : 'heart-outline'"
        :name="isSolid ? 'heroicons:heart-20-solid' : 'heroicons:heart'"
        class="transition-transform duration-200"
        :class="[
          isSolid ? 'scale-105' : 'scale-100',
          isSolid
            ? 'text-seagull-700'
            : fadedUnliked
            ? 'text-seagull-700/50'
            : 'text-seagull-700/80',
        ]"
        :size="iconSize"
      />
      <span
        v-if="countInside && displayCount > 0 && showCount"
        class="top-1/2 left-1/2 absolute drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-300 text-[0.8rem] text-white tracking-tight -translate-x-1/2 -translate-y-1/2 select-none"
        style="font-weight: 300"
        >{{ abbreviated }}</span
      >
    </span>
    <!-- Outside count (normal order) -->
    <span
      v-if="!countInside && !isReversed && showCount && displayCount > 0"
      class="pr-1 pl-0.5 min-w-[1ch] font-medium tabular-nums text-xs transition-colors"
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
  const { isLiked, getCount, toggleLike } = useLikes()

  const liked = computed(() => isLiked(props.id))
  const count = computed(() => getCount(props.id))
  const displayCount = computed(() => {
    if (count.value > 0) return count.value
    if (liked.value) return 1
    return 0
  })
  const showCount = computed(() =>
    props.hideZero ? displayCount.value > 0 : true
  )
  const isSolid = computed(() => liked.value || displayCount.value > 0)

  function formatAbbrev(n) {
    if (n < 1000) return n.toString()
    const units = [
      { v: 1e9, s: 'b' },
      { v: 1e6, s: 'm' },
      { v: 1e3, s: 'k' },
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
  }
</script>

<style scoped>
  @media (hover: hover) {
    button:hover span:first-child {
      transform: scale(1.05);
    }
  }
</style>
