<!-- components/QuotePanel.vue -->
<template>
  <div
    v-if="quote && quote.headings && quote.headings.length > 0 && slug"
    class="group relative shadow-inset-card flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 px-6 py-4 border hover:border hover:border-seagull-400/50 border-transparent rounded-lg text-white cursor-pointer quotePanel"
    @click="openModal"
  >
    <!-- Like button only -->
    <div class="top-1 right-1 z-10 absolute">
      <UiLikeButton
        :id="quote?._path || quote?.path || slug"
        :title="quote?.headings?.[0] || 'quote'"
        :count-inside="true"
        :hide-zero="true"
        :faded-unliked="true"
        @click.stop
      />
    </div>
    <div class="flex flex-col flex-wrap gap-0.5 my-auto">
      <h1
        class="inline-block text-shadow-xs font-[100] text-xl align-baseline tracking-wide"
        v-html="formatQuote(quote.headings[0])"
      ></h1>
      <p
        class="inline-block text-shadow-xs font-[100] text-seagull-200 text-xl align-baseline tracking-wide"
        v-if="quote.attribution"
      >
        — {{ quote.attribution }}
      </p>
    </div>
  </div>
  <div
    v-else
    class="relative shadow-inset-card flex flex-col gap-2 bg-slate-800 px-5 py-4 rounded-lg text-white quotePanel"
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
        class="inline-block font-[100] text-seagull-200 text-xl align-baseline"
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

  function openModal() {
    // Emit event to parent to open modal
    // This will be handled by the parent component
    console.log('Opening modal for quote:', props.slug)
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
    console.log('Link copied to clipboard!')
  }
</script>
