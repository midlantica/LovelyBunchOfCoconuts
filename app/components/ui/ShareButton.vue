<template>
  <transition
    enter-active-class="duration-200 transition-all ease-out"
    enter-from-class="transform opacity-0 scale-y-0 origin-top"
    enter-to-class="transform opacity-100 scale-y-100 origin-top"
    leave-active-class="transition-all duration-100 ease-in"
    leave-from-class="transform opacity-100 scale-y-100 origin-top"
    leave-to-class="transform opacity-0 scale-y-0 origin-top"
  >
    <div
      v-if="show"
      class="-top-2 absolute bg-slate-900 px-2 sm:px-4 pt-5 pb-3 rounded-b-lg w-full"
    >
      <div class="flex justify-center gap-3">
        <UiTwitterShareButton
          ref="twitterButton"
          :title="title"
          :text="text"
          :url="url"
          :content-type="contentType"
          @toast-show="onToastShow"
        />

        <UiFacebookShareButton
          ref="facebookButton"
          :title="title"
          :text="text"
          :url="url"
          :content-type="contentType"
          @toast-show="onToastShow"
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
  const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String, default: null },
    imageFile: { type: File, default: null },
    generatedImageBlob: { type: Blob, default: null },
    contentType: { type: String, default: 'general' },
    show: { type: Boolean, default: true },
  })

  // Button refs for coordination
  const twitterButton = ref(null)
  const facebookButton = ref(null)

  // Handle toast coordination - clear others when one shows
  const onToastShow = (buttonType) => {
    if (buttonType !== 'twitter') twitterButton.value?.clearToast()
    if (buttonType !== 'facebook') facebookButton.value?.clearToast()
  }
</script>
