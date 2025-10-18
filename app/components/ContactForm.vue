<template>
  <div class="bg-slate-800/60 shadow-xl px-6 py-5 rounded-md">
    <h2 class="mb-6 text-3xl">Contact Us</h2>

    <form
      @submit.prevent="handleSubmit"
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      class="space-y-4"
    >
      <!-- Netlify Forms requirements -->
      <input type="hidden" name="form-name" value="contact" />

      <!-- Honeypot field for spam protection -->
      <div style="display: none">
        <label>
          Don't fill this out if you're human:
          <input name="bot-field" />
        </label>
      </div>

      <!-- First and Last Name Row -->
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label
            for="firstName"
            class="font-300 text-base uppercase tracking-wider"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            v-model="form.firstName"
            type="text"
            autocomplete="given-name"
            required
            class="bg-slate-900 px-3 pt-1 pb-2 border-[0.5px] border-seagull-100 rounded-md focus:outline-none focus:ring-1 focus:ring-seagull-100 w-full font-300 text-white tracking-wider placeholder-slate-400/50"
            style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
            placeholder="First Name"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="lastName"
            class="font-300 text-base uppercase tracking-wider"
          >
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            v-model="form.lastName"
            type="text"
            autocomplete="family-name"
            required
            class="bg-slate-900 px-3 pt-1 pb-2 border-[0.5px] border-seagull-100 rounded-md focus:outline-none focus:ring-1 focus:ring-seagull-100 w-full font-300 text-white tracking-wider placeholder-slate-400/50"
            style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
            placeholder="Last Name"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-2">
        <label for="email" class="font-300 text-base uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          name="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="bg-slate-900 px-3 pt-1 pb-2 border-[0.5px] border-seagull-100 rounded-md focus:outline-none focus:ring-1 focus:ring-seagull-100 w-full font-300 text-white tracking-wider placeholder-slate-400/50"
          style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
          placeholder="you@yourcompany.com"
        />
      </div>

      <!-- Message -->
      <div class="flex flex-col gap-2">
        <label
          for="message"
          class="font-300 text-base uppercase tracking-wider"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          v-model="form.message"
          required
          rows="6"
          class="bg-slate-950/30 px-3 py-2 border-[0.5px] border-seagull-100 rounded-md focus:outline-none focus:ring-1 focus:ring-seagull-100 w-full font-300 text-white tracking-wider resize-none placeholder-slate-400/50"
          style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
          placeholder="Leave a message..."
        ></textarea>
      </div>

      <!-- Submit Button and Messages -->
      <div class="flex justify-between items-center gap-4">
        <!-- Success/Error Messages -->
        <div class="flex-1">
          <div
            v-if="submitStatus === 'success'"
            class="font-300 text-green-400 text-sm tracking-wider"
          >
            ✓ Message sent successfully! We'll get back to you soon.
          </div>
          <div
            v-if="submitStatus === 'error'"
            class="font-300 text-red-400 text-sm tracking-wider"
          >
            ✗ Something went wrong. Please try again or email us directly.
          </div>
        </div>

        <!-- Submit Button -->
        <UiButton
          @click="handleSubmit"
          :text="isSubmitting ? 'Sending...' : 'Send Message'"
          variant="primary"
          size="lg"
          :disabled="isSubmitting"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
  const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  })

  const isSubmitting = ref(false)
  const submitStatus = ref(null) // 'success' | 'error' | null

  async function handleSubmit(event) {
    isSubmitting.value = true
    submitStatus.value = null

    try {
      // Create FormData from the form
      const formData = new FormData(event.target)

      // LOCAL DEVELOPMENT: Mock the submission
      if (import.meta.dev) {
        console.log('🧪 LOCAL DEV: Form submission (not sent to Netlify)')
        console.log('Form data:', {
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          email: form.value.email,
          message: form.value.message,
        })

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        submitStatus.value = 'success'

        // Clear form on success
        form.value = {
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        }

        return
      }

      // PRODUCTION: Submit to Netlify
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      })

      if (response.ok) {
        submitStatus.value = 'success'

        // Clear form on success
        form.value = {
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        }
      } else {
        throw new Error('Form submission failed')
      }
    } catch (error) {
      submitStatus.value = 'error'
      console.error('Form submission error:', error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>
