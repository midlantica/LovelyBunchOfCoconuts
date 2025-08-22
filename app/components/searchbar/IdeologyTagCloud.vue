<template>
  <div class="w-full">
    <div class="flex flex-wrap gap-[0.4rem]">
      <button
        v-for="i in visibleTags"
        :key="i.term"
        type="button"
        class="px-2 pt-[3px] pb-[4px] rounded-sm focus:outline-none text-sm leading-tight tracking-[0.025rem] whitespace-nowrap transition"
        :class="
          activeTerm && i.term.toLowerCase().includes(activeTerm.toLowerCase())
            ? i.group === 'Freedom'
              ? 'bg-seagull-500 text-slate-950'
              : 'bg-slate-300 text-slate-900'
            : i.group === 'Freedom'
            ? 'bg-seagull-600/20 text-slate-200 hover:bg-seagull-600/30'
            : 'bg-slate-500/20 text-slate-200 hover:bg-slate-500/30'
        "
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
  defineProps({ activeTerm: String })
  const emit = defineEmits(['select'])

  const byTerm = Object.fromEntries(ideologies.map((i) => [i.term, i]))
  const totalLimit = Math.max(1, Math.ceil(ideologies.length / 3))

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
</script>

<style scoped></style>
