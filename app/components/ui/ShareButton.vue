<template>
  <transition
    enter-active-class="transition-all duration-100 cubic-bezier(0.34, 1.56, 0.64, 1)"
    enter-from-class="transform opacity-0 scale-y-0 scale-x-95 translate-y-[-12px] origin-top"
    enter-to-class="transform opacity-100 scale-y-100 scale-x-100 translate-y-0 origin-top"
    leave-active-class="transition-all duration-50 ease-in"
    leave-from-class="transform opacity-100 scale-y-100 scale-x-100 translate-y-0 origin-top"
    leave-to-class="transform opacity-0 scale-y-0 scale-x-98 translate-y-[-6px] origin-top"
  >
    <div
      v-if="show"
      class="-top-2 absolute bg-slate-900 px-3 sm:px-3.5 pt-4 pb-2 rounded-b-lg w-full"
    >
      <div class="flex items-center gap-4">
        <!-- Share cluster flush left -->
        <div class="flex flex-1 items-center gap-3">
          <UiCopyLinkButton
            ref="copyButton"
            :url="url"
            icon-size="1.7rem"
            :button-style="{ position: 'relative', top: '0.5px' }"
            @toast-show="onToastShow"
          />
        </div>
        <!-- Like button flush right -->
        <UiLikeButton
          v-if="contentType && url"
          :id="likeId || url"
          :title="title"
          :count-inside="true"
          :hide-zero="true"
          icon-size="1.8rem"
          @click.stop
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
    likeId: { type: String, default: null },
  })

  // Button refs for coordination
  const copyButton = ref(null)

  // Handle toast coordination - clear others when one shows
  const onToastShow = (buttonType) => {
    if (buttonType !== 'copy') copyButton.value?.clearToast()
  }
</script>
