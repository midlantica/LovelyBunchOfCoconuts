<template>
  <div class="px-4 sm:px-6 rounded-b-lg sm:rounded-b-lg">
    <div class="flex justify-center gap-2">
      <TwitterShareButton
        ref="twitterButton"
        :title="title"
        :text="text"
        :url="url"
        :content-type="contentType"
        @toast-show="onToastShow"
      />

      <FacebookShareButton
        ref="facebookButton"
        :title="title"
        :text="text"
        :url="url"
        :content-type="contentType"
        @toast-show="onToastShow"
      />

      <CopyLinkButton ref="copyButton" :url="url" @toast-show="onToastShow" />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import TwitterShareButton from './TwitterShareButton.vue'
  import FacebookShareButton from './FacebookShareButton.vue'
  import CopyLinkButton from './CopyLinkButton.vue'

  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String, default: null },
    imageFile: { type: File, default: null },
    generatedImageBlob: { type: Blob, default: null },
    contentType: { type: String, default: 'general' }, // 'claim', 'quote', 'meme', 'general'
  })

  // Button refs for coordination
  const twitterButton = ref(null)
  const facebookButton = ref(null)
  const copyButton = ref(null)

  // Handle toast coordination - clear others when one shows
  const onToastShow = (buttonType) => {
    if (buttonType !== 'twitter') twitterButton.value?.clearToast()
    if (buttonType !== 'facebook') facebookButton.value?.clearToast()
    if (buttonType !== 'copy') copyButton.value?.clearToast()
  }
</script>
