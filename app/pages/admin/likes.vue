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
        <span class="text-slate-300 text-sm">Total IDs: {{ total }}</span>
        <span class="text-slate-300 text-sm">Loaded: {{ items.length }}</span>
        <span class="text-slate-300 text-sm"
          >Sum (loaded): {{ sumCounts }}</span
        >
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

      <div
        v-if="orphanIds.length"
        class="flex items-center gap-3 bg-amber-900/30 p-2 border border-amber-700/40 rounded text-xs"
      >
        <span class="text-amber-300"
          >{{ orphanIds.length }} orphan
          {{ orphanIds.length === 1 ? 'ID' : 'IDs' }} detected</span
        >
        <button
          class="bg-amber-500/90 hover:bg-amber-400 disabled:opacity-40 px-2 py-1 rounded text-slate-900 disabled:cursor-not-allowed"
          :disabled="cleaningOrphans"
          @click="cleanupOrphans"
        >
          {{ cleaningOrphans ? 'Cleaning…' : 'Cleanup Orphans' }}
        </button>
      </div>

      <div v-if="error" class="bg-red-900/40 p-3 rounded text-red-200 text-sm">
        {{ error }}
      </div>

      <div
        class="border border-slate-700 rounded overflow-hidden"
        style="max-height: 70vh; overflow: auto"
        data-likes-table-container
      >
        <table class="w-full text-sm">
          <thead class="bg-slate-800 text-slate-300">
            <tr>
              <th class="px-3 py-2 text-left">ID (decoded)</th>
              <th
                class="px-3 py-2 w-20 text-right cursor-pointer select-none"
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
              <th class="px-3 py-2 w-28 text-right">Custom Count</th>
              <th class="px-3 py-2 w-16 text-right">Apply</th>
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
              <td class="px-3 py-2 tabular-nums text-right align-top">
                {{ row.count }}
              </td>
              <td class="px-3 py-2 text-right">
                <input
                  v-model.number="customValues[row.id]"
                  type="number"
                  min="0"
                  class="bg-slate-800 px-2 py-1 border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-seagull-500 w-20 text-slate-100 text-xs text-right"
                />
              </td>
              <td class="px-3 py-2 text-right">
                <button
                  class="bg-seagull-600 hover:bg-seagull-500 disabled:opacity-40 px-2 py-1 rounded text-slate-950 text-xs disabled:cursor-not-allowed"
                  :disabled="
                    pending[row.id] ||
                    customValues[row.id] == null ||
                    customValues[row.id] < 0
                  "
                  @click="applyCustom(row)"
                >
                  Set
                </button>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="2" class="px-3 py-6 text-slate-400 text-center">
                No results
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="p-3 text-slate-400 text-xs text-center">
          Loading…
        </div>
        <div v-if="!loading && items.length < total" class="p-3 text-center">
          <button
            class="bg-seagull-600 hover:bg-seagull-500 px-3 py-1.5 rounded text-slate-950 text-sm"
            @click="refresh(false)"
          >
            Load More ({{ items.length }}/{{ total }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const route = useRoute()
  const allowed = computed(() => import.meta.dev || route.query.dev === '1')

  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const items = ref([])
  const pageSize = 200
  const offset = ref(0)
  const reachedEnd = ref(false)
  const pending = reactive({})
  const customValues = reactive({})
  const orphanIds = ref([])
  const cleaningOrphans = ref(false)

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

  function toggleSortDir() {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
    sortBy.value = 'count'
  }

  async function refresh(reset = true) {
    if (!allowed.value) return
    loading.value = true
    error.value = null
    try {
      if (reset) {
        offset.value = 0
        reachedEnd.value = false
        items.value = []
      }
      if (reachedEnd.value) return
      const params = new URLSearchParams()
      params.set('offset', String(offset.value))
      params.set('limit', String(pageSize))
      if (query.value.trim()) params.set('search', query.value.trim())
      const isProd = process.env.NODE_ENV === 'production'
      if (isProd) params.set('dev', '1')
      const res = await fetch(`/api/likes/list?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      total.value = data.total || 0
      const bannedIds = ['/claims/rehabilitation-and-restorative-justice']
      const newRows = (data.items || [])
        .filter((r) => !bannedIds.includes(r.id))
        .map((r) => {
          let id = r.id
          try {
            id = decodeURIComponent(id)
          } catch {}
          // id is normalized like /claims/foo; build route directly
          const segs = id.split('/').filter(Boolean)
          const type = segs[0] || ''
          const slug = segs.slice(1).join('/') // allow nested if any
          let routeUrl = id // default
          // Adjust to singular front-end route pattern /claim/slug etc
          const singular =
            type === 'claims'
              ? 'claim'
              : type === 'memes'
              ? 'meme'
              : type === 'quotes'
              ? 'quote'
              : type
          if (slug) routeUrl = `/${singular}/${slug}`
          return { key: id, id, url: routeUrl, count: r.count }
        })
      if (!newRows.length) {
        reachedEnd.value = true
      } else {
        offset.value += newRows.length
        for (const it of newRows) {
          if (customValues[it.id] == null) customValues[it.id] = it.count
        }
        items.value = [...items.value, ...newRows]
      }
    } catch (e) {
      error.value = e?.message || String(e)
    } finally {
      loading.value = false
    }
  }

  // Removed bump actions per requirements

  async function cleanupOrphans() {
    if (!orphanIds.value.length || cleaningOrphans.value) return
    if (!confirm(`Remove ${orphanIds.value.length} orphan like key(s)?`)) return
    cleaningOrphans.value = true
    try {
      await fetch('/api/likes/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: orphanIds.value }),
      })
      orphanIds.value = []
      refresh()
    } catch (e) {
      if (import.meta.dev) console.warn('[admin/likes] cleanup failed', e)
    } finally {
      cleaningOrphans.value = false
    }
  }

  async function applyCustom(row) {
    const id = row.id
    const val = customValues[id]
    if (val == null || val < 0) return
    pending[id] = true
    try {
      const res = await fetch('/api/likes/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value: Math.floor(val) }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (typeof data?.count === 'number') {
          row.count = data.count
        } else {
          row.count = Math.floor(val)
        }
        // Immediately sync any open client session displaying this id
        if (process.client && window.__wakeupnpcSetLike) {
          window.__wakeupnpcSetLike(row.id, row.count)
        }
      } else {
        row.count = Math.floor(val)
      }
    } catch {
      row.count = Math.floor(val)
    } finally {
      pending[id] = false
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // noop
    }
  }

  function handleScroll(e) {
    if (loading.value || reachedEnd.value) return
    const el = e.target
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      refresh(false)
    }
  }
  let containerEl
  onMounted(() => {
    refresh(true)
    containerEl = document.querySelector('[data-likes-table-container]')
    if (containerEl) containerEl.addEventListener('scroll', handleScroll)
  })
  onUnmounted(() => {
    if (containerEl) containerEl.removeEventListener('scroll', handleScroll)
  })

  watch(
    () => query.value,
    () => {
      // Debounce search slightly
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => refresh(true), 250)
    }
  )
  let searchTimer
</script>

<style scoped>
  /* minimal */
</style>
