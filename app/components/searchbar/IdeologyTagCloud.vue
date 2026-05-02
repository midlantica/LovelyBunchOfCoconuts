<template>
  <div class="w-full">
    <div class="flex flex-wrap gap-[0.4rem]">
      <button
        v-for="i in visibleTags"
        :key="i.term"
        type="button"
        class="font-300 cursor-pointer! rounded-sm px-2 pt-[3px] pb-1 text-[.85rem] leading-tight tracking-wider whitespace-nowrap transition focus:outline-none"
        :class="classesFor(i)"
        @click="emit('select', i.term)"
      >
        {{ i.term }}
      </button>
    </div>
  </div>
</template>

<script setup>
  import { acts } from '~/data/acts'
  import { curatedTop } from '~/data/topActTags'
  const props = defineProps({ activeTerm: [String, Array] })
  const emit = defineEmits(['select'])
  const { isDark } = useTheme()

  const byTerm = Object.fromEntries(acts.map((a) => [a.term, a]))
  const totalLimit = acts.length

  const baseClasses = 'bg-union-blue-900 text-white hover:bg-union-blue-700'
  const activeClasses = computed(() =>
    isDark.value
      ? 'bg-union-blue-900 text-white ring-1 ring-white/80'
      : 'bg-union-blue-900 text-white ring-1 ring-union-blue-950'
  )

  function classesFor(item) {
    return isActive(item.term) ? activeClasses.value : baseClasses
  }

  function loadPopularity() {
    try {
      return JSON.parse(localStorage.getItem('wunu_popular_terms') || '{}')
    } catch {
      return {}
    }
  }

  const visibleTags = computed(() => {
    const pop = loadPopularity()
    const popularTerms = Object.entries(pop)
      .filter(([, count]) => count >= 3)
      .map(([term]) => term)

    const seen = new Set()
    const out = []
    function add(term) {
      const item = byTerm[term]
      if (item && !seen.has(item.term)) {
        seen.add(item.term)
        out.push(item)
      }
    }

    curatedTop.forEach(add)
    popularTerms.forEach(add)
    return out.slice(0, totalLimit)
  })

  function isActive(term) {
    const active = props.activeTerm
    if (!active) return false
    if (Array.isArray(active)) {
      const lc = term.toLowerCase()
      return active.some((t) => String(t).toLowerCase() === lc)
    }
    // Fallback for legacy string prop: substring match
    return term.toLowerCase().includes(String(active).toLowerCase())
  }
</script>

<style scoped></style>
