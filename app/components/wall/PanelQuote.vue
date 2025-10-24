<!-- components/QuotePanel.vue -->
<template>
  <div
    v-if="quote && quote.headings && quote.headings.length > 0 && slug"
    class="card group shadow-inset-card hover:border-seagull-400/50 quotePanel relative isolate flex cursor-pointer flex-col gap-2 rounded-lg border border-transparent px-6 py-4 text-white hover:border hover:bg-slate-900"
    @click="openModal"
  >
    <!-- Like button only -->
    <div class="absolute top-1 right-1 z-20">
      <UiLikeButton
        :id="quote?._path || quote?.path || slug"
        :title="quote?.headings?.[0] || 'quote'"
        :count-inside="true"
        :hide-zero="true"
        :faded-unliked="true"
        @click.stop
      />
    </div>
    <div class="my-auto flex flex-col flex-wrap gap-0.5">
      <h1
        class="font-100 inline-block align-baseline tracking-wide text-shadow-xs"
        :style="{ fontSize: quoteFontSize, lineHeight: quoteLineHeight }"
        v-html="formatQuote(quote.headings[0])"
      ></h1>
      <p
        class="font-100 text-seagull-200 inline-block align-baseline tracking-wide text-shadow-xs"
        :style="{ fontSize: attributionFontSize, lineHeight: '1.4' }"
        v-if="quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
  </div>
  <div
    v-else
    class="card shadow-inset-card quotePanel relative flex flex-col gap-2 rounded-lg px-5 py-4 text-white"
  >
    <div class="my-auto">
      <h2 class="inline-block align-baseline">
        {{
          quote && quote.headings && quote.headings.length > 0
            ? `&ldquo;${quote.headings[0]}&rdquo;`
            : '🚨 No quote found!'
        }}
      </h2>
      <p
        class="font-100 text-seagull-200 inline-block align-baseline text-xl"
        v-if="quote && quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    quote: Object,
    slug: String,
  })

  const contentType = computed(() => 'political quote')

  // Calculate font size based on text length - MUCH smaller for long quotes
  const quoteFontSize = computed(() => {
    const text = props.quote?.headings?.[0] || ''
    const length = text.length

    if (length > 600) return '0.5rem' // 8px - VERY SMALL for very long quotes
    if (length > 500) return '0.5625rem' // 9px
    if (length > 400) return '0.625rem' // 10px
    if (length > 300) return '0.6875rem' // 11px
    if (length > 200) return '0.75rem' // 12px
    if (length > 150) return '0.875rem' // 14px
    if (length > 100) return '1rem' // 16px
    return '1.25rem' // 20px
  })

  const attributionFontSize = computed(() => {
    const text = props.quote?.attribution || ''
    const length = text.length

    if (length > 150) return '0.75rem'
    if (length > 100) return '0.875rem'
    if (length > 50) return '1rem'
    return '1.25rem'
  })

  const quoteLineHeight = computed(() => {
    const text = props.quote?.headings?.[0] || ''
    const length = text.length

    if (length > 400) return '1.15'
    if (length > 200) return '1.25'
    return '1.4'
  })

  function openModal() {
    // Emit event to parent to open modal
    // This will be handled by the parent component
  }

  function formatQuote(text) {
    return text
      ? text.replace(/<wbr>/g, '<wbr>').replace(/<wbr>/g, '<wbr>')
      : ''
  }

  function shareContent() {
    const url = `${window.location.origin}/${props.slug}`
    const title = props.quote?.headings?.[0] || 'Political Quote'
    const description = `Check out this political quote from WakeUpNPC - Political Claims, Quotes & Memes`

    // Use Web Share API if available (mobile)
    if (navigator.share) {
      navigator
        .share({
          title: `WakeUpNPC - ${title}`,
          text: description,
          url: url,
        })
        .catch(() => {
          // Fallback to copying URL
          copyToClipboard(url)
        })
    } else {
      // Fallback to copying URL
      copyToClipboard(url)
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }

    // Show toast notification (you could add a toast system)
  }
</script>
