<!-- components/MemePanel.vue -->
<template>
  <div>
    <template v-if="meme && meme.image && slug">
      <div
        class="card group shadow-inset-card hover:border-seagull-400/50 relative isolate mx-auto h-full w-full cursor-pointer! overflow-hidden rounded-md border border-transparent p-3 hover:border hover:bg-slate-900"
        @click="openModal"
      >
        <!-- Like button only -->
        <div class="absolute top-1 right-1 z-20">
          <UiLikeButton
            :id="meme?._path || meme?.path || slug"
            :title="imageAlt"
            :count-inside="true"
            :hide-zero="true"
            :faded-unliked="true"
            @click.stop
          />
        </div>
        <UiImageWithSpinner
          :src="meme.image"
          :alt="imageAlt"
          :is-lazy="shouldLazyLoad"
          :loading="shouldLazyLoad ? 'lazy' : 'eager'"
          :fetchpriority="shouldLazyLoad ? undefined : 'high'"
          width="1200"
          height="1200"
          decoding="async"
          image-class="aspect-square h-full max-h-full min-h-0 w-full max-w-full min-w-0 rounded-md bg-black/40 object-contain"
          :spinner-size="32"
          @load="onImageLoad"
        />
      </div>
    </template>
    <template v-else-if="meme && meme.image">
      <div
        class="card shadow-inset-card relative mx-auto h-full w-full overflow-hidden rounded-md p-3"
      >
        <UiImageWithSpinner
          :src="meme.image"
          :alt="imageAlt"
          :is-lazy="shouldLazyLoad"
          :loading="shouldLazyLoad ? 'lazy' : 'eager'"
          :fetchpriority="shouldLazyLoad ? undefined : 'high'"
          width="1200"
          height="1200"
          decoding="async"
          image-class="aspect-square h-full max-h-full min-h-0 w-full max-w-full min-w-0 rounded-md bg-black/40 object-contain"
          :spinner-size="32"
          @load="onImageLoad"
        />
      </div>
    </template>
    <template v-else>
      <div
        class="card shadow-inset-card mx-auto h-full w-full overflow-hidden rounded-md p-3"
      >
        <p class="text-center text-white text-shadow-xs">
          🚨 Meme image not found!
        </p>
        <p class="mt-1 text-center text-xs text-red-400 text-shadow-xs">
          {{ getFileName(meme) }}
        </p>
      </div>
    </template>
    <!-- Modal removed: now handled as singleton in pages/index.vue -->
  </div>
</template>

<script setup>
  const props = defineProps({
    meme: Object,
    slug: String,
    index: { type: Number, default: 0 }, // Add index prop for eager loading
  })

  // Eagerly load first 6 images for better LCP
  const shouldLazyLoad = computed(() => props.index >= 6)

  const contentType = computed(() => 'political meme')

  function openModal() {
    // Emit event to parent to open modal
    // This will be handled by the parent component
  }

  // Handle image load event
  function onImageLoad() {
    // Image loaded successfully - can add any additional logic here if needed
  }

  // Get the image filename for alt text
  const imageAlt = computed(() => {
    if (!props.meme?.image) return 'Meme'

    // Extract filename from image path
    const imagePath = props.meme.image
    const parts = imagePath.split('/')
    const filename = parts[parts.length - 1]

    // Remove file extension and clean up the name
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

    // Convert underscores/hyphens to spaces and capitalize words
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

    return `${cleanName}`
  })

  // Extract the slug from the path, handling nested paths
  const getSlug = (path) => {
    if (!path || typeof path !== 'string') {
      console.warn('⚠️ Invalid path in getSlug:', path)
      return ''
    }
    // Remove leading slash and memes prefix
    let cleanPath = path.replace(/^\/+/, '').replace(/^memes\/+/, '')
    return cleanPath
  }

  // Get the filename for error display
  const getFileName = (meme) => {
    if (!meme) {
      console.error('🚨 Broken meme: unknown-file')
      return 'unknown-file'
    }

    // Try different path properties
    const path = meme._path || meme.path || props.slug || 'unknown'

    // Extract just the filename from the path
    const parts = path.split('/')
    const filename = parts[parts.length - 1]

    // Add .md extension if not present
    const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`

    console.error('🚨 Broken meme:', finalFilename)
    return finalFilename
  }

  function shareContent() {
    const url = `${window.location.origin}/${props.slug}`
    const title =
      props.meme?.title || props.meme?.description || 'Political Meme'
    const description = `Check out this political meme from WakeUpNPC - Political Claims, Quotes & Memes`

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
