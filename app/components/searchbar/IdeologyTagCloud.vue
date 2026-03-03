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
  import { ideologies } from '~/data/ideologies'
  import { curatedTop } from '~/data/topIdeologyTags'
  const props = defineProps({ activeTerm: [String, Array] })
  const emit = defineEmits(['select'])

  const byTerm = Object.fromEntries(ideologies.map((i) => [i.term, i]))
  const totalLimit = Math.max(1, Math.ceil(ideologies.length / 3))

  // Visual theme by group; add new groups here. Keeps template free of hard-coded names.
  const groupStyles = {
    Freedom: {
      base: 'bg-theme-surface text-theme-body hover:bg-theme-overlay',
      active: 'bg-theme-accent text-white',
    },
    Collectivism: {
      base: 'bg-theme-surface text-theme-body hover:bg-theme-overlay',
      active: 'bg-theme-accent text-white',
    },
  }
  const defaultStyles = {
    base: 'bg-theme-surface text-theme-body hover:bg-theme-overlay',
    active: 'bg-theme-accent text-white',
  }
  function classesFor(item) {
    const styles = groupStyles[item.group] || defaultStyles
    return isActive(item.term) ? styles.active : styles.base
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
