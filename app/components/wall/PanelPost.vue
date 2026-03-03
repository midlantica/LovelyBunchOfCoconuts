<!-- components/wall/PanelPost.vue -->
<template>
  <div
    v-if="post && post.title && slug"
    class="card group hover:border-theme-border-hover postPanel text-theme-body hover:bg-theme-surface relative isolate flex h-full cursor-pointer! flex-col gap-2 rounded-lg px-6 py-4"
  >
    <!-- Like button only -->
    <div class="absolute top-1 right-1 z-20">
      <UiLikeButton
        :id="post?._path || post?.path || slug"
        :title="post?.title || 'post'"
        :count-inside="true"
        :hide-zero="true"
        :faded-unliked="true"
        @click.stop
      />
    </div>

    <div class="flex h-full flex-col gap-2 overflow-hidden">
      <!-- Header from first H2 -->
      <h2
        class="font-300 text-theme-muted line-clamp-2 inline-block align-baseline tracking-wide"
        style="font-size: 1.25rem; line-height: 1.4"
      >
        {{ postHeader }}
      </h2>

      <!-- Body preview with markdown rendering (images filtered out) -->
      <div class="post-preview-content flex-1 overflow-hidden">
        <ContentRenderer
          :value="{ ...post, body: postBodyWithoutImages }"
          class="prose-invert prose-sm"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="card shadow-inset-card postPanel text-theme-body relative flex flex-col gap-2 rounded-lg px-5 py-4"
  >
    <div class="my-auto">
      <h2 class="inline-block align-baseline">
        {{ post?.title || '🚨 No post found!' }}
      </h2>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    post: Object,
    slug: String,
  })

  const contentType = computed(() => 'post')

  // Filter out image nodes from post body for preview (prevents image downloads)
  const postBodyWithoutImages = computed(() => {
    if (!props.post?.body?.value) return props.post?.body

    const filterImages = (elements) => {
      return elements
        .map((element) => {
          // Keep non-array elements (strings, etc.)
          if (!Array.isArray(element)) return element

          const [tag, attrs, ...children] = element

          // Remove standalone images
          if (tag === 'img') return null

          // For paragraphs, filter out any image children
          if (tag === 'p' && children.length > 0) {
            const filteredChildren = children.filter((child) => {
              if (!Array.isArray(child)) return true
              return child[0] !== 'img'
            })

            // If paragraph becomes empty after filtering, remove it
            if (filteredChildren.length === 0) return null

            // Return paragraph with filtered children
            return [tag, attrs, ...filteredChildren]
          }

          return element
        })
        .filter((element) => element !== null)
    }

    return {
      ...props.post.body,
      value: filterImages(props.post.body.value),
    }
  })

  // Extract the first H2 heading from the post body
  const postHeader = computed(() => {
    if (!props.post?.body?.value) return props.post?.title || ''

    // Look for first H2 heading in the body AST
    for (const element of props.post.body.value) {
      if (Array.isArray(element) && element[0] === 'h2') {
        // element[2] contains the text content
        return element[2] || ''
      }
    }

    return props.post.title || ''
  })

  // Extract body text preview (everything after first H2)
  const postBodyPreview = computed(() => {
    if (!props.post?.body?.value) return ''

    let foundH2 = false
    let preview = ''

    // Extract text from body AST elements after first H2
    for (const element of props.post.body.value) {
      if (!Array.isArray(element)) continue

      const [tag, , content] = element

      // Skip until we find the first H2
      if (tag === 'h2') {
        foundH2 = true
        continue
      }

      // After H2, collect text content
      if (foundH2 && typeof content === 'string') {
        preview += content + ' '

        // Stop if we have enough text
        if (preview.length > 300) break
      }
    }

    return preview.trim().substring(0, 300)
  })

  // No need for local openModal - TheWall.vue handles clicks on the wrapper div
</script>

<style scoped>
  .postPanel {
    aspect-ratio: 1 / 1;
    min-height: auto;
  }

  /* Maintain 1:1 aspect ratio on all screen sizes (same as meme panels) */
  @media (min-width: 768px) {
    .postPanel {
      aspect-ratio: 1 / 1;
    }
  }

  /* Ensure text truncation with ellipsis */
  .line-clamp-2 {
    display: -webkit-box;
    -line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Post preview content styling */
  .post-preview-content {
    font-size: 1.099688rem; /* 15% larger than 0.95625rem */
    line-height: 1.4;
    position: relative;
  }

  /* Hide H2 in preview since we show it separately */
  .post-preview-content :deep(h2) {
    display: none;
  }

  /* Style paragraphs in preview */
  .post-preview-content :deep(p) {
    margin: 0;
    padding: 0;
    line-height: 1.4;
    font-size: 1.099688rem; /* 15% larger than 0.95625rem */
    color: var(--color-text-body);
  }

  /* Add small gap between paragraphs */
  .post-preview-content :deep(p + p) {
    margin-top: 0.25rem;
  }

  /* Show bullets in preview as regular list */
  .post-preview-content :deep(ul) {
    list-style-type: disc;
    padding-left: 0;
    margin-left: 0;
    margin-bottom: 0;
    margin-top: 0;
  }

  .post-preview-content :deep(ul li) {
    margin-left: 1.25rem;
    margin-bottom: 0;
    margin-top: 0;
    padding-left: 0;
    line-height: 1.4;
    font-size: 1.099688rem; /* 15% larger than 0.95625rem */
    color: var(--color-text-body);
  }

  .post-preview-content :deep(ul li::marker) {
    color: var(--color-accent-light);
  }

  /* Ordered lists with same spacing as paragraphs */
  .post-preview-content :deep(ol) {
    list-style-type: decimal;
    padding-left: 0;
    margin-left: 0;
    margin-bottom: 0;
    margin-top: 0;
  }

  .post-preview-content :deep(ol li) {
    margin-left: 1.25rem;
    margin-bottom: 0;
    margin-top: 0;
    padding-left: 0;
    line-height: 1.4;
    font-size: 1.099688rem; /* 15% larger than 0.95625rem */
    color: var(--color-text-body);
  }

  .post-preview-content :deep(ol li::marker) {
    color: var(--color-accent-light);
  }
</style>
