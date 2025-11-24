<!-- components/wall/PanelPost.vue -->
<template>
  <div
    v-if="post && post.title && slug"
    class="card group shadow-inset-card hover:border-seagull-400/50 postPanel relative isolate flex h-full cursor-pointer! flex-col gap-2 rounded-lg border border-transparent px-6 py-4 text-white hover:border hover:bg-slate-900"
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
        class="font-300 text-seagull-200 line-clamp-2 inline-block align-baseline tracking-wide text-shadow-xs"
        style="font-size: 1.25rem; line-height: 1.4"
      >
        {{ postHeader }}
      </h2>

      <!-- Body preview with markdown rendering -->
      <div class="post-preview-content flex-1 overflow-hidden">
        <ContentRenderer :value="post" class="prose-invert prose-sm" />
      </div>
    </div>
  </div>
  <div
    v-else
    class="card shadow-inset-card postPanel relative flex flex-col gap-2 rounded-lg px-5 py-4 text-white"
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

  /* Create ellipsis effect with pseudo-element */
  .post-preview-content::after {
    content: '...';
    position: absolute;
    bottom: 0;
    right: 0;
    padding-left: 0.5rem;
    background: linear-gradient(to right, transparent, #0f172a 50%);
    font-size: 2.199376rem; /* Twice as big as 1.099688rem */
    line-height: 1;
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
    color: white;
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
    color: white;
  }

  .post-preview-content :deep(ul li::marker) {
    color: #a5f3fc; /* seagull-200 */
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
    color: white;
  }

  .post-preview-content :deep(ol li::marker) {
    color: #a5f3fc; /* seagull-200 */
  }
</style>
