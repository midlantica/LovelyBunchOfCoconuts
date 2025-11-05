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

    <!-- Main content: image left, text right -->
    <div class="flex h-full gap-4 p-4">
      <!-- Image section (left) -->
      <div class="flex flex-shrink-0 items-center">
        <img
          v-if="imagePath"
          :src="imagePath"
          :alt="profileName"
          class="h-32 w-32 rounded-lg object-cover sm:h-40 sm:w-40"
        />
      </div>

      <!-- Text section (right) -->
      <div class="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <!-- Name with hero/zero icon -->
        <div class="flex items-center gap-2">
          <!-- Hero icon (blue thumbs up) -->
          <div
            v-if="profileStatus === 'hero'"
            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20"
            title="Hero"
          >
            <svg
              class="h-4 w-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"
              />
            </svg>
          </div>
          <!-- Zero icon (red thumbs down) -->
          <div
            v-else-if="profileStatus === 'zero'"
            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20"
            title="Zero"
          >
            <svg
              class="h-4 w-4 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"
              />
            </svg>
          </div>
          <h2
            class="text-seagull-200 line-clamp-1 tracking-wide uppercase"
            style="
              font-family: 'Barlow Condensed';
              font-size: 20.35px;
              font-weight: 400;
              line-height: 23px;
              letter-spacing: 0.407px;
            "
          >
            {{ profileName }}
          </h2>
        </div>

        <!-- Bio text -->
        <p
          class="line-clamp-3 text-white sm:line-clamp-4"
          style="font-size: 1.25rem; line-height: 1.4"
        >
          {{ bioText }}
        </p>
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

    const textParts = []
    for (const element of props.profile.body.value) {
      if (!Array.isArray(element)) continue

      const [tag, attrs, content] = element

      // Skip h2 (heading), get paragraph text
      if (tag === 'p' && typeof content === 'string') {
        textParts.push(content)
      }
    }

    return textParts.join(' ').trim()
  })

  function openModal() {
    // Modal opening will be handled by parent component
  }
</script>
