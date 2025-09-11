<template>
  <div class="mx-auto px-4 py-2 max-w-5xl font-light">
    <div class="mb-4 text-sm" v-if="!allowed">
      <p class="text-amber-300">
        Admin view is disabled in production. Append <code>?dev=1</code> to the
        URL or run locally.
      </p>
    </div>

    <div v-if="allowed" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <button
          class="inline-flex justify-center items-center opacity-75 hover:opacity-100 disabled:opacity-50 transition-opacity cursor-pointer"
          @click="handleRefresh"
          :disabled="loading"
          aria-label="Refresh"
          title="Refresh"
        >
          <Icon
            name="tdesign:refresh"
            :class="[
              'w-6 h-6',
              refreshing
                ? 'animate-spin drop-shadow-[0_0_10px_rgba(94,234,212,0.7)]'
                : '',
            ]"
            aria-hidden="true"
          />
        </button>
        <span class="text-slate-300 text-base">Total IDs: {{ total }}</span>
        <span class="text-slate-300 text-base">Loaded: {{ items.length }}</span>
        <span class="text-slate-300 text-base"
          >Sum (loaded): {{ sumCounts }}</span
        >
        <label class="flex items-center gap-2 ml-2 text-slate-300 text-base">
          <input type="checkbox" v-model="live" class="accent-seagull-500" />
          Live
        </label>
        <div class="flex items-center gap-2 ml-auto">
          <div class="inline-flex items-stretch gap-0">
            <input
              v-model="query"
              placeholder="Search for…"
              class="bg-slate-800 px-2 py-1 border border-slate-700 rounded-r-none rounded-l-md focus:outline-none focus:ring-1 focus:ring-seagull-500 text-slate-100"
            />
            <button
              class="inline-flex justify-center items-center bg-slate-700 hover:bg-slate-600 -ml-px rounded-r-md rounded-l-none w-8 h-8 text-slate-200"
              @click="refresh(true)"
              type="button"
              aria-label="Search"
              title="Search"
            >
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
            </button>
          </div>
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
        style="max-height: 80vh; overflow: auto"
        data-likes-table-container
      >
        <table class="w-full font-light text-lg">
          <thead
            class="top-0 z-10 sticky bg-slate-800 font-light text-slate-300"
          >
            <tr>
              <th class="px-3 py-2 font-light text-left uppercase">
                ID (decoded)
              </th>
              <th
                class="px-3 py-2 w-20 font-light text-right uppercase cursor-pointer select-none"
                @click="toggleSortDir()"
              >
                Count&nbsp;<span
                  class="inline-block ml-1 text-seagull-400"
                  aria-hidden="true"
                >
                  {{ sortDir === 'desc' ? '▾' : '▴' }}
                </span>
              </th>
              <th class="px-3 py-2 w-36 font-light text-left uppercase">
                Set Count
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
                    class="text-seagull-400 hover:text-seagull-300"
                  >
                    {{ row.id }}
                  </NuxtLink>
                  <button
                    class="inline-flex justify-center items-center opacity-50 hover:opacity-100 rounded text-slate-400 transition-opacity cursor-pointer"
                    @click="copy(row.id)"
                    title="Copy id"
                    aria-label="Copy id"
                  >
                    <Icon
                      name="heroicons:document-duplicate"
                      class="w-5 h-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </td>
              <td
                class="px-3 py-2 tabular-nums text-right align-middle leading-none"
              >
                {{ row.count }}
              </td>
              <td class="px-3 py-2 text-left">
                <div class="inline-flex justify-start items-stretch gap-0">
                  <input
                    v-model.number="customValues[row.id]"
                    type="number"
                    min="0"
                    class="bg-slate-800 px-2 py-0 border border-slate-700 rounded-r-none rounded-l-md focus:outline-none focus:ring-1 focus:ring-seagull-500 w-[4.8rem] text-slate-100 text-base text-right"
                  />
                  <button
                    class="inline-flex justify-center items-center bg-seagull-600 hover:bg-seagull-500 disabled:opacity-40 -ml-px rounded-r-md rounded-l-none w-7 h-7 text-[20px] text-slate-950 disabled:cursor-not-allowed"
                    :disabled="
                      pending[row.id] ||
                      customValues[row.id] == null ||
                      customValues[row.id] < 0
                    "
                    @click="applyCustom(row)"
                    title="Apply set count"
                    aria-label="Apply set count"
                  >
                    <Icon name="material-symbols-light:input" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="3" class="px-3 py-6 text-slate-400 text-center">
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
  const sortBy = ref('count')
  const sortDir = ref('desc')
  const live = ref(true)
  const refreshing = ref(false)

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
    // Min/Max filters removed per request
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

  async function handleRefresh() {
    if (loading.value || refreshing.value) {
      // Prevent stacking
      return
    }
    refreshing.value = true
    try {
      await refresh(true)
      // brief glow/animation persists a moment after completion
      await new Promise((r) => setTimeout(r, 300))
    } finally {
      refreshing.value = false
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
