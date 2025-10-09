<template>
  <div class="mx-auto px-2 md:px-0 py-0 pb-3 w-full max-w-screen-md">
    <h1 class="mb-6 font-300 text-2xl">Contact</h1>

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
        <label for="email" class="block mb-2 font-100 text-base"> Email </label>
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
          class="bg-transparent px-3 py-2 border-1 border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full font-100 text-white resize-none to1dpb-2 er-1 placeholder-slate-500"
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
</template>

<script setup>
  useHead({
    title: 'Contact Us - WakeUpNPC',
    meta: [
      {
        name: 'description',
        content:
          'Get in touch with WakeUpNPC. Submit content, ask questions, or inquire about advertising opportunities.',
      },
    ],
    bodyAttrs: {
      class: 'contact',
    },
  })

  const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  })

  const isSubmitting = ref(false)
  const submitStatus = ref(null) // 'success' | 'error' | null

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

<style scoped></style>
