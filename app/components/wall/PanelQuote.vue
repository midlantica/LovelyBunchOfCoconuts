<!-- components/QuotePanel.vue -->
<template>
  <div
    v-if="quote && quote.headings && quote.headings.length > 0 && slug"
    class="card group hover:border-theme-border-hover quotePanel text-theme-body hover:bg-theme-surface relative isolate flex cursor-pointer! flex-col gap-2 rounded-lg px-6 py-4"
    style="min-height: 80px; contain: layout"
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
        class="font-100 inline-block align-baseline tracking-wide"
        style="font-size: 1.25rem; line-height: 1.4"
        v-html="formatQuote(quote.headings[0])"
      ></h1>
      <p
        class="font-100 text-theme-muted inline-block align-baseline tracking-wide"
        style="font-size: 1.25rem; line-height: 1.4"
        v-if="quote.attribution"
        v-html="'— ' + (quote.attributionHtml || quote.attribution)"
      ></p>
    </div>
  </div>
  <div
    v-else
    class="card shadow-inset-card quotePanel text-theme-body relative flex flex-col gap-2 rounded-lg px-5 py-4"
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
        class="font-100 text-theme-muted inline-block align-baseline text-xl"
        v-if="quote && quote.attribution"
        v-html="'— ' + (quote.attributionHtml || quote.attribution)"
      ></p>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    quote: Object,
    slug: String,
  })

  const contentType = computed(() => 'political quote')

  const quoteFontSize = '1.25rem' // Fixed 20px for consistent wall display

  const attributionFontSize = '1.25rem' // Fixed 20px for consistent wall display

  const quoteLineHeight = '1.4' // Fixed line height for consistent wall display

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
    const description = `Check out this quote from Lovely Bunch of Coconuts - British Humour, Quotes & Comedy`

    // Use Web Share API if available (mobile)
    if (navigator.share) {
      navigator
        .share({
          title: `Lovely Bunch of Coconuts - ${title}`,
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
