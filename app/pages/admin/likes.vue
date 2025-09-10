<template>
  <div class="mx-auto p-6 max-w-5xl">
    <h1 class="mb-4 font-semibold text-slate-100 text-2xl">Likes Admin</h1>

    <div class="mb-4 text-sm" v-if="!allowed">
      <p class="text-amber-300">
        Admin view is disabled in production. Append <code>?dev=1</code> to the
        URL or run locally.
      </p>
    </div>

    <div v-if="allowed" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <button
          class="bg-seagull-600 hover:bg-seagull-500 px-3 py-1.5 rounded-md text-slate-950"
          @click="refresh"
          :disabled="loading"
        >
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
        <span class="text-slate-300 text-sm">Total IDs: {{ totalKeys }}</span>
        <span class="text-slate-300 text-sm">Sum: {{ sumCounts }}</span>
        <label class="flex items-center gap-2 ml-2 text-slate-300 text-sm">
          <input type="checkbox" v-model="live" class="accent-seagull-500" />
          Live
        </label>
        <div class="flex items-center gap-2 ml-auto">
          <input
            v-model="query"
            placeholder="Filter by id…"
            class="bg-slate-800 px-2 py-1 border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-seagull-500 text-slate-100"
          />
          <label class="text-slate-300 text-xs">Min</label>
          <input
            v-model.number="minCount"
            type="number"
            class="bg-slate-800 px-2 py-1 border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-seagull-500 w-20 text-slate-100"
          />
          <label class="text-slate-300 text-xs">Max</label>
          <input
            v-model.number="maxCount"
            type="number"
            class="bg-slate-800 px-2 py-1 border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-seagull-500 w-20 text-slate-100"
          />
        </div>
      </div>

      <div v-if="error" class="bg-red-900/40 p-3 rounded text-red-200 text-sm">
        {{ error }}
      </div>

      <div
        class="border border-slate-700 rounded overflow-hidden"
        style="max-height: 70vh; overflow: auto"
      >
        <table class="w-full text-sm">
          <thead class="bg-slate-800 text-slate-300">
            <tr>
              <th class="px-3 py-2 text-left">ID (decoded)</th>
              <th
                class="px-3 py-2 w-24 text-right cursor-pointer select-none"
                @click="toggleSortDir()"
              >
                Count
                <span
                  class="inline-block ml-1 text-seagull-400"
                  aria-hidden="true"
                >
                  {{ sortDir === 'desc' ? '▾' : '▴' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.key"
              class="border-slate-800 border-t"
            >
              <td class="px-3 py-2">
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="row.url"
                    target="_blank"
                    class="text-seagull-400 hover:text-seagull-300 underline underline-offset-2"
                  >
                    {{ row.id }}
                  </NuxtLink>
                  <button
                    class="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 border border-slate-700 rounded text-slate-300"
                    @click="copy(row.id)"
                    title="Copy id"
                  >
                    Copy
                  </button>
                </div>
              </td>
              <td class="px-3 py-2 tabular-nums text-right">{{ row.count }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="2" class="px-3 py-6 text-slate-400 text-center">
                No results
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  const route = useRoute()
  const allowed = computed(() => import.meta.dev || route.query.dev === '1')

  const loading = ref(false)
  const error = ref(null)
  const totalKeys = ref(0)
  const items = ref([])
  const pending = reactive({})

  const query = ref('')
  const minCount = ref(null)
  const maxCount = ref(null)
  const sortBy = ref('count')
  const sortDir = ref('desc')
  const live = ref(true)

  const sumCounts = computed(() =>
    items.value.reduce((a, b) => a + (b.count || 0), 0)
  )

  const rows = computed(() => {
    let arr = items.value
    const q = query.value.trim().toLowerCase()
    if (q)
      arr = arr.filter(
        (r) =>
          r.id.toLowerCase().includes(q) || r.key?.toLowerCase?.().includes(q)
      )
    if (minCount.value != null)
      arr = arr.filter((r) => r.count >= minCount.value)
    if (maxCount.value != null)
      arr = arr.filter((r) => r.count <= maxCount.value)
    arr = [...arr].sort((a, b) => {
      const dir = sortDir.value === 'asc' ? 1 : -1
      if (sortBy.value === 'count') return (a.count - b.count) * dir
      return a.id.localeCompare(b.id) * dir
    })
    return arr
  })

  async function filterMissing() {
    try {
      const ids = items.value.map((r) => r.id)
      if (!ids.length) return
      const qs = ids.map(encodeURIComponent).join(',')
      const res = await fetch(`/api/content/exists?ids=${qs}`)
      if (!res.ok) return
  const data = await res.json()
  const existing = data?.existing || []
      const set = new Set(existing)
      const before = items.value.length
      items.value = items.value.filter((r) => set.has(r.id))
      if (before !== items.value.length) {
        totalKeys.value = items.value.length
      }
    } catch {}
  }

  function toggleSortDir() {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
    sortBy.value = 'count'
  }

  async function refresh() {
    if (!allowed.value) return
    loading.value = true
    error.value = null
    try {
      let res = await fetch('/api/likes')
      if (!res.ok) {
        // Fallback to debug route if present
        const isProd = process.env.NODE_ENV === 'production'
        res = await fetch(`/api/likes/debug${isProd ? '?dev=1' : ''}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      const counts = data?.counts || data || {}
      totalKeys.value = Number(data?.totalKeys || Object.keys(counts).length)
      items.value = Object.entries(counts).map(([key, count]) => {
        let decoded = key
        try {
          decoded = decodeURIComponent(key)
        } catch {}
        if (!decoded.startsWith('/')) decoded = `/${decoded}`
        const segs = decoded.split('/').filter(Boolean)
        const type = segs[0] || ''
        const slug = segs[segs.length - 1] || ''
        const singular =
          type === 'claims'
            ? 'claim'
            : type === 'memes'
            ? 'meme'
            : type === 'quotes'
            ? 'quote'
            : type
        const routeUrl = slug ? `/${singular}/${slug}` : `/${singular}`
        return { key, id: decoded, url: routeUrl, count: Number(count) || 0 }
      })
  // After populating, strip any IDs whose content no longer exists
  await filterMissing()
    } catch (e) {
      error.value = e?.message || String(e)
    } finally {
      loading.value = false
    }
  }

  // Removed bump actions per requirements

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // noop
    }
  }

  let _timer
  onMounted(() => {
    refresh()
    _timer = setInterval(() => {
      if (allowed.value && live.value && !loading.value) refresh()
    }, 2000)
  })
  onUnmounted(() => {
    if (_timer) clearInterval(_timer)
  })
</script>

<style scoped>
  /* minimal */
</style>
