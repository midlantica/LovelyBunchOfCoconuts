<!-- components/wall/PanelProfile.vue -->
<template>
  <div
    v-if="profile && profileName"
    class="card group shadow-inset-card hover:border-seagull-400/50 relative isolate flex h-full cursor-pointer! flex-col rounded-lg border border-transparent text-white transition-colors hover:border hover:bg-slate-900"
    @click="openModal"
  >
    <!-- Like button -->
    <div class="absolute top-2 right-2 z-20">
      <UiLikeButton
        :id="profile?.path || slug"
        :title="profileName"
        :count-inside="true"
        :hide-zero="true"
        :faded-unliked="true"
        @click.stop
      />
    </div>

    <!-- Main content: image left, text right (stacks on mobile) -->
    <div
      class="flex h-full flex-col gap-3 p-4 text-center sm:flex-row sm:gap-4 sm:text-left"
    >
      <!-- Image section (left) -->
      <div class="flex shrink-0 items-center justify-center sm:justify-start">
        <ProfileImage
          v-if="imagePath"
          :image-path="imagePath"
          :profile-name="profileName"
          :status="profileStatus"
          size="modal"
          badge-size="small"
        />
      </div>

      <!-- Text section (right) -->
      <div class="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <!-- Profile Name -->
        <h2
          class="line-clamp-1 text-[1.3rem] leading-[1.3rem] font-light tracking-[0.1rem] text-white uppercase"
          style="font-family: 'Barlow Condensed'"
        >
          {{ profileName }}
        </h2>

        <!-- Bio text -->
        <div
          v-if="profile?.body"
          class="prose-bio line-clamp-3 sm:line-clamp-4"
        >
          <ContentRenderer :value="profile.body" />
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="card shadow-inset-card relative flex h-full flex-col gap-2 rounded-lg p-4 text-white"
  >
    <p class="text-white/60">Missing profile data</p>
  </div>
</template>

<script setup>
  const props = defineProps({
    profile: Object,
    slug: String,
  })

  // Extract profile name and status from meta
  const profileName = computed(() => props.profile?.meta?.profile || '')
  const profileStatus = computed(() => props.profile?.meta?.status || '')

  // Create bio content object for ContentRenderer (excluding h2 and images)
  const bioContent = computed(() => {
    if (!props.profile?.body?.value) return null

    const bioElements = props.profile.body.value.filter((element) => {
      if (!Array.isArray(element)) return false
      const [tag, attrs, content] = element

      // Skip h2 headings
      if (tag === 'h2') return false

      // Skip image paragraphs
      if (tag === 'p' && Array.isArray(content)) {
        const isImageParagraph =
          content.length > 0 &&
          Array.isArray(content[0]) &&
          content[0][0] === 'img'
        if (isImageParagraph) return false
      }

      return tag === 'p'
    })

    return bioElements.length > 0 ? { type: 'root', value: bioElements } : null
  })

  // Extract image path from body.value array (minimark format)
  const imagePath = computed(() => {
    if (!props.profile?.body?.value) return ''

    // body.value is an array of elements [[tag, attrs, content], ...]
    for (const element of props.profile.body.value) {
      if (Array.isArray(element) && element[0] === 'p') {
        // Check if this paragraph contains an image
        const content = element[2]
        if (Array.isArray(content) && content[0] === 'img') {
          return content[1]?.src || ''
        }
      }
    }

    return ''
  })

  // Extract bio text from body.value array (skip image paragraph, get text from other paragraphs)
  const bioText = computed(() => {
    if (!props.profile?.body?.value) return ''

    // Recursive function to extract HTML from nested content
    const extractHTML = (content) => {
      if (typeof content === 'string') {
        return content
      }
      if (Array.isArray(content)) {
        if (content[0] === 'em') {
          // Italic text
          return `<em>${extractHTML(content[2])}</em>`
        }
        if (content[0] === 'strong') {
          // Bold text
          return `<strong>${extractHTML(content[2])}</strong>`
        }
        // Array of mixed content
        return content.map(extractHTML).join('')
      }
      return ''
    }

    const htmlParts = []
    for (const element of props.profile.body.value) {
      if (!Array.isArray(element)) continue

      const [tag, attrs, content] = element

      // Skip h2 (heading), get paragraph content (but skip image paragraphs)
      if (tag === 'p' && !Array.isArray(content)) {
        htmlParts.push(content)
      } else if (tag === 'p' && Array.isArray(content)) {
        // Check if it's not an image paragraph
        if (!(content[0] === 'img')) {
          htmlParts.push(extractHTML(content))
        }
      }
    }

    return htmlParts.join(' ').trim()
  })

  function openModal() {
    // Modal opening will be handled by parent component
  }
</script>

<style scoped>
  /* Style for bio content with proper markdown rendering */
  .prose-bio :deep(h2) {
    display: none; /* Hide h2 headings */
  }

  .prose-bio :deep(img) {
    display: none; /* Hide images */
  }

  .prose-bio :deep(p) {
    font-size: 1.25rem;
    line-height: 1.4;
    color: white;
    margin: 0; /* Remove default paragraph margins */
  }

  .prose-bio :deep(em) {
    font-style: italic;
  }

  .prose-bio :deep(strong) {
    font-weight: bold;
  }
</style>
