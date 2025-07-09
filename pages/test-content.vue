<!-- Test page to verify Nuxt Content v3 is working -->
<template>
  <div class="p-8">
    <h1 class="mb-4 font-bold text-2xl">Content Test Page</h1>

    <div v-if="pending" class="text-blue-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
    <div v-else>
      <h2 class="mb-2 font-semibold text-xl">
        Claims ({{ claims?.length || 0 }})
      </h2>
      <ul class="mb-4">
        <li v-for="claim in claims" :key="claim._path" class="mb-1">
          {{ claim._path }} - {{ claim.title || 'No title' }}
        </li>
      </ul>

      <h2 class="mb-2 font-semibold text-xl">
        Quotes ({{ quotes?.length || 0 }})
      </h2>
      <ul class="mb-4">
        <li v-for="quote in quotes" :key="quote._path" class="mb-1">
          {{ quote._path }} - {{ quote.title || 'No title' }}
        </li>
      </ul>

      <h2 class="mb-2 font-semibold text-xl">
        Memes ({{ memes?.length || 0 }})
      </h2>
      <ul class="mb-4">
        <li v-for="meme in memes" :key="meme._path" class="mb-1">
          {{ meme._path }} - {{ meme.title || 'No title' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  const {
    data: claims,
    pending: claimsPending,
    error: claimsError,
  } = await useAsyncData('claims', () => queryCollection('claims').all())
  const {
    data: quotes,
    pending: quotesPending,
    error: quotesError,
  } = await useAsyncData('quotes', () => queryCollection('quotes').all())
  const {
    data: memes,
    pending: memesPending,
    error: memesError,
  } = await useAsyncData('memes', () => queryCollection('memes').all())

  const pending = computed(
    () => claimsPending.value || quotesPending.value || memesPending.value
  )
  const error = computed(
    () => claimsError.value || quotesError.value || memesError.value
  )

  console.log('Content loaded:', {
    claims: claims.value?.length || 0,
    quotes: quotes.value?.length || 0,
    memes: memes.value?.length || 0,
  })
</script>
