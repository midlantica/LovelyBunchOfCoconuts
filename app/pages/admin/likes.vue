<template>
  <div class="mx-auto px-4 py-2 max-w-5xl font-100">
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
        <div class="flex items-center gap-2 ml-4">
          <button
            class="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-white text-sm"
            @click="showTestingTools = !showTestingTools"
          >
            {{ showTestingTools ? 'Hide' : 'Show' }} Testing Tools
          </button>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <div class="inline-flex items-stretch gap-0">
            <input
              v-model="query"
              placeholder="Search for…"
              class="bg-slate-800 px-2 py-1 border border-slate-700 rounded-r-none rounded-l-md outline-0 text-slate-100"
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

      <!-- Testing Tools Panel -->
      <div
        v-if="showTestingTools"
        class="space-y-4 bg-slate-800/50 p-4 border border-slate-600 rounded-lg"
      >
        <h3 class="mb-3 font-300 text-slate-200 text-lg">
          🧪 Likes Testing Tools
        </h3>

        <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
          <!-- Quick Test Buttons -->
          <div class="space-y-3">
            <h4 class="font-300 text-slate-300 text-sm">Quick Actions</h4>
            <div class="flex flex-wrap gap-2">
              <button
                class="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-white text-sm"
                @click="addRandomLikes(5)"
                :disabled="addingLikes"
              >
                {{ addingLikes ? 'Adding...' : 'Add 5 Random Likes' }}
              </button>
              <button
                class="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-white text-sm"
                @click="simulateMultiUser()"
                :disabled="simulatingUsers"
              >
                {{ simulatingUsers ? 'Simulating...' : 'Simulate Multi-User' }}
              </button>
              <button
                class="bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded text-white text-sm"
                @click="testModalPerformance()"
              >
                Test Modal Speed
              </button>
            </div>
          </div>

          <!-- Performance Info -->
          <div class="space-y-3">
            <h4 class="font-300 text-slate-300 text-sm">Performance Status</h4>
            <div class="space-y-1 text-slate-400 text-xs">
              <div>
                Live Poll:
                <span class="text-red-400">DISABLED</span> (performance)
              </div>
              <div>
                Global Poll:
                <span class="text-red-400">DISABLED</span> (performance)
              </div>
              <div>
                Hydration: <span class="text-green-400">OPTIMIZED</span> (200ms
                delay)
              </div>
              <div>
                Integrity: <span class="text-green-400">OPTIMIZED</span> (5s
                delay)
              </div>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="testResults.length" class="mt-4">
          <h4 class="mb-2 font-300 text-slate-300 text-sm">Test Results</h4>
          <div class="bg-slate-900/50 p-3 rounded max-h-32 overflow-y-auto">
            <div
              v-for="result in testResults"
              :key="result.id"
              class="mb-1 text-slate-300 text-xs"
            >
              <span class="text-slate-500">{{ result.time }}</span> -
              {{ result.message }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="border border-slate-700 rounded overflow-hidden"
        style="max-height: 80vh; overflow: auto"
        data-likes-table-container
      >
        <table class="w-full font-100 text-lg">
          <thead class="top-0 z-10 sticky bg-slate-800 font-100 text-slate-300">
            <tr>
              <th class="px-3 py-2 font-100 text-left uppercase">
                ID (decoded)
              </th>
              <th
                class="px-3 py-2 w-20 font-100 text-right uppercase cursor-pointer select-none"
                @click="toggleSortDir()"
              >
                Count&nbsp;<span
                  class="inline-block ml-1 text-seagull-400"
                  aria-hidden="true"
                >
                  {{ sortDir === 'desc' ? '▾' : '▴' }}
                </span>
              </th>
              <th class="px-3 py-2 w-36 font-100 text-left uppercase">
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

  // Testing tools state
  const showTestingTools = ref(false)
  const addingLikes = ref(false)
  const simulatingUsers = ref(false)
  const testResults = ref([])

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
    if (sortBy.value === 'count') {
      // Toggle direction if already sorting by count
      sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
    } else {
      // Switch to count sorting with desc as default
      sortBy.value = 'count'
      sortDir.value = 'desc'
    }
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
      const bannedIds = ['/grifts/rehabilitation-and-restorative-justice']
      const newRows = (data.items || [])
        .filter((r) => !bannedIds.includes(r.id))
        .map((r) => {
          let id = r.id
          try {
            id = decodeURIComponent(id)
          } catch {}
          // id is normalized like /grifts/foo; build route directly
          const segs = id.split('/').filter(Boolean)
          const type = segs[0] || ''
          const slug = segs.slice(1).join('/') // allow nested if any
          let routeUrl = id // default
          // Adjust to singular front-end route pattern /grift/slug etc
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

  // Testing Tools Functions
  function addTestResult(message) {
    const now = new Date()
    testResults.value.unshift({
      id: Date.now(),
      time: now.toLocaleTimeString(),
      message,
    })
    // Keep only last 10 results
    if (testResults.value.length > 10) {
      testResults.value = testResults.value.slice(0, 10)
    }
  }

  async function addRandomLikes(count = 5) {
    if (addingLikes.value || !items.value.length) return
    addingLikes.value = true

    try {
      const randomItems = [...items.value]
        .sort(() => Math.random() - 0.5)
        .slice(0, count)

      let added = 0
      for (const item of randomItems) {
        const randomLikes = Math.floor(Math.random() * 10) + 1
        const newCount = (item.count || 0) + randomLikes

        try {
          const res = await fetch('/api/likes/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, value: newCount }),
          })

          if (res.ok) {
            item.count = newCount
            customValues[item.id] = newCount
            if (process.client && window.__wakeupnpcSetLike) {
              window.__wakeupnpcSetLike(item.id, newCount)
            }
            added++
          }
        } catch (e) {
          console.warn('Failed to add likes to', item.id, e)
        }
      }

      addTestResult(`Added random likes to ${added}/${count} items`)
    } catch (e) {
      addTestResult(`Error adding random likes: ${e.message}`)
    } finally {
      addingLikes.value = false
    }
  }

  async function simulateMultiUser() {
    if (simulatingUsers.value || !items.value.length) return
    simulatingUsers.value = true

    try {
      // Pick 3 random items and simulate multiple users liking them
      const targets = [...items.value]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      addTestResult('Simulating multi-user activity...')

      for (const target of targets) {
        // Simulate 2-5 users liking this item over time
        const userCount = Math.floor(Math.random() * 4) + 2
        const baseCount = target.count || 0

        for (let i = 0; i < userCount; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 + Math.random() * 300)
          )

          const newCount = baseCount + i + 1
          try {
            await fetch('/api/likes/set', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: target.id, value: newCount }),
            })

            target.count = newCount
            customValues[target.id] = newCount
            if (process.client && window.__wakeupnpcSetLike) {
              window.__wakeupnpcSetLike(target.id, newCount)
            }
          } catch (e) {
            console.warn('Simulation step failed', e)
          }
        }
      }

      addTestResult(
        `Simulated ${targets.length} items with multi-user activity`
      )
    } catch (e) {
      addTestResult(`Multi-user simulation error: ${e.message}`)
    } finally {
      simulatingUsers.value = false
    }
  }

  async function testModalPerformance() {
    if (!items.value.length) {
      addTestResult('No items available for modal test')
      return
    }

    const startTime = performance.now()
    addTestResult('Testing modal performance...')

    try {
      // Find a random item to test with
      const testItem =
        items.value[Math.floor(Math.random() * items.value.length)]

      // Open the item in a new tab to test modal loading
      const url = testItem.url
      window.open(url, '_blank')

      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      addTestResult(
        `Modal test initiated in ${duration}ms - Check new tab for actual load time`
      )
    } catch (e) {
      addTestResult(`Modal test error: ${e.message}`)
    }
  }

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
