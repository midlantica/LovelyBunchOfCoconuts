<template>
  <transition
    enter-active-class="duration-300 transition-all ease-out"
    enter-from-class="transform opacity-0 scale-y-0 origin-top"
    enter-to-class="transform opacity-100 scale-y-100 origin-top"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="transform opacity-100 scale-y-100 origin-top"
    leave-to-class="transform opacity-0 scale-y-0 origin-top"
  >
    <div
      v-if="show"
      class="bg-slate-900 shadow-lg px-4 sm:px-6 rounded-none sm:rounded-b-lg"
      style="
        position: absolute;
        left: 0.667px;
        top: calc(100% - 0.7rem);
        z-index: 0;
        padding: 1rem 0px 0.5rem;
        width: calc(100% - 1.334px);
      "
    >
      <div class="flex justify-center gap-2">
        <div class="z-30 relative">
          <UiTwitterShareButton
            ref="twitterButton"
            :title="title"
            :text="text"
            :url="url"
            :content-type="contentType"
            @toast-show="onToastShow"
          />
        </div>

        <div class="z-30 relative">
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
