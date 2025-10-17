<template>
  <div class="mx-auto px-2 md:px-0 py-0 w-full max-w-screen-md">
    <div class="about-flex flex flex-wrap items-start gap-8 mt-4 mb-6 px-3">
      <!-- About WakeUpNPC -->
      <div class="flex-1">
        <h1 class="mb-3 font-300 text-2xl uppercase">About WakeUpNPC</h1>
        <p
          class="mb-3 last:pb-0 font-100 text-[1.3rem] text-seagull-100 leading-relaxed"
        >
          We highlight the Woke Left's insanity sweeping through our
          civilization that took a thousand years to build. We make fun of the
          Left's madness. We decode their guilt grift machine. We expose their
          vapid language, regressive dogma, and the epic gaslighting.
        </p>
      </div>
      <!-- Image wrapper div -->
      <div
        @click="showImageModal = true"
        role="button"
        tabindex="0"
        @keydown.enter="showImageModal = true"
        @keydown.space.prevent="showImageModal = true"
        class="flex-1 cursor-pointer"
      >
        <img
          src="/modern-woke-barbarians.jpg"
          alt="modern woke barbarians"
          class="hover:opacity-90 rounded w-full h-auto transition-opacity"
        />
      </div>

      <!-- Full size image modal -->
      <div
        v-if="showImageModal"
        @click="showImageModal = false"
        @keydown="showImageModal = false"
        class="z-50 fixed inset-0 flex justify-center items-center bg-black/90 cursor-pointer"
        role="dialog"
        aria-modal="true"
      >
        <img
          src="/modern-woke-barbarians.jpg"
          alt="modern woke barbarians full size"
          @click.stop
          class="max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>
    </div>

    <!-- Rest of About WakeUpNPC -->
    <div class="space-y-6 px-3 pb-8">
      <!-- What We Do -->
      <div class="bg-slate-800/60 shadow-xl px-6 py-5 rounded-lg">
        <h2 class="mb-4 !text-seagull-100 text-xl uppercase">What We Do</h2>

        <div class="space-y-4">
          <div class="flex self-end gap-4">
            <h3 class="block mb-1 w-20 text-xl uppercase leading-tight">
              Grift<Icon
                name="i-heroicons:arrow-right-20-solid"
                class="top-0.5 relative mx-0.5 text-xl 100"
              />Decodes
            </h3>
            <p class="block last:pb-0 w-full font-100 text-seagull-100 text-xl">
              Real ideological positions from hard Left-wing Woke sources,
              presented with sane Translations for normal people. These are
              actual beliefs being advocated in mainstream spaces.
            </p>
          </div>

          <div class="flex self-end gap-4">
            <h3 class="block mb-1 w-20 text-xl uppercase leading-tight">
              Quotes
            </h3>
            <p class="block last:pb-0 w-full font-100 text-seagull-100 text-xl">
              Memorable statements from politicians, academics, activists, and
              media figures that reveal the absurdity or contradictions inherent
              in leftist Woke ideology.
            </p>
          </div>

          <div class="flex self-end gap-4">
            <h3 class="block w-20 text-xl uppercase mb20">Memes</h3>
            <p class="block last:pb-0 w-full font-100 text-seagull-100 text-xl">
              The motherload of Memes! Steal them liberally! Quotes, cartoons,
              charts, that reveal the absurdity or contradictions inherent in
              Leftist Woke ideology.
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="bg-slate-800/60 shadow-xl px-6 py-5 rounded-lg">
        <h2 class="mb-6 text-xl uppercase">Contact Us</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- First and Last Name Row -->
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label for="firstName" class="block mb-2 font-100 text-base">
                First name
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="bg-transparent px-3 pt-1 pb-2 border-1 border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full font-100 text-white placeholder-slate-500"
                placeholder="First Name"
              />
            </div>

            <div>
              <label for="lastName" class="block mb-2 font-100 text-base">
                Last name
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="bg-transparent px-3 pt-1 pb-2 border-1 border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full font-100 text-white placeholder-slate-500"
                placeholder="Last Name"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block mb-2 font-100 text-base">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="bg-transparent px-3 pt-1 pb-2 border-1 border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full font-100 text-white placeholder-slate-500"
              placeholder="you@yourcompany.com"
            />
          </div>

          <!-- Message -->
          <div>
            <label for="message" class="block mb-2 font-100 text-base">
              Message
            </label>
            <textarea
              id="message"
              v-model="form.message"
              required
              rows="6"
              class="bg-transparent px-3 py-2 border-1 border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full font-100 text-white resize-none er-1 placeholder-slate-500 to1dpb-2"
              placeholder="Leave a message..."
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <UiButton
              @click="handleSubmit"
              :text="isSubmitting ? 'Sending...' : 'Send Message'"
              variant="secondary"
              size="lg"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Success/Error Messages -->
          <div
            v-if="submitStatus === 'success'"
            class="font-100 text-green-400 text-sm text-center"
          >
            ✓ Message sent successfully! We'll get back to you soon.
          </div>
          <div
            v-if="submitStatus === 'error'"
            class="font-100 text-red-400 text-sm text-center"
          >
            ✗ Something went wrong. Please try again or email us directly.
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
  useHead({
    title: 'About Our Mission - WakeUpNPC',
    meta: [
      {
        name: 'description',
        content:
          "Learn about WakeUpNPC's mission to satirize progressive ideology through humor, claims, quotes, and memes that expose ideological contradictions.",
      },
    ],
    bodyAttrs: {
      class: 'about',
    },
  })

  // Image modal state
  const showImageModal = ref(false)

  const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  })

  const isSubmitting = ref(false)
  const submitStatus = ref(null) // 'success' | 'error' | null

  // Close modal on escape key
  if (import.meta.client) {
    onMounted(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          showImageModal.value = false
        }
      }
      window.addEventListener('keydown', handleEscape)
      onUnmounted(() => window.removeEventListener('keydown', handleEscape))
    })
  }

  async function handleSubmit() {
    isSubmitting.value = true
    submitStatus.value = null

    try {
      // TODO: Implement actual form submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      submitStatus.value = 'success'

      form.value = {
        firstName: '',
        lastName: '',
        email: '',
        message: '',
      }
    } catch (error) {
      submitStatus.value = 'error'
      console.error('Form submission error:', error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<style scoped>
  @media (max-width: 763px) {
    .about-flex {
      flex-direction: column;
    }
  }
</style>
