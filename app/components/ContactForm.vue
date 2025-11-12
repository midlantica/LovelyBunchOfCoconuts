<template>
  <div class="card mb-12 px-6 py-5">
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
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label
            for="firstName"
            class="font-300 text-base tracking-wider uppercase"
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
            class="border-seagull-600/30 focus:border-seagull-600/50 font-300 w-full rounded-md border bg-slate-950/30 px-3 pt-1 pb-2 tracking-wider text-white placeholder-slate-400/50 focus:outline-none"
            style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
            placeholder="First Name"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="lastName"
            class="font-300 text-base tracking-wider uppercase"
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
            class="border-seagull-600/30 focus:border-seagull-600/50 font-300 w-full rounded-md border bg-slate-950/30 px-3 pt-1 pb-2 tracking-wider text-white placeholder-slate-400/50 focus:outline-none"
            style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
            placeholder="Last Name"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-2">
        <label for="email" class="font-300 text-base tracking-wider uppercase">
          Email
        </label>
        <input
          id="email"
          name="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="border-seagull-600/30 focus:border-seagull-600/50 font-300 w-full rounded-md border bg-slate-950/30 px-3 pt-1 pb-2 tracking-wider text-white placeholder-slate-400/50 focus:outline-none"
          style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
          placeholder="Email"
        />
      </div>

      <!-- Message -->
      <div class="flex flex-col gap-2">
        <label
          for="message"
          class="font-300 text-base tracking-wider uppercase"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          v-model="form.message"
          required
          rows="6"
          class="border-seagull-600/30 focus:border-seagull-600/50 font-300 w-full resize-none rounded-md border bg-slate-950/30 px-3 py-2 tracking-wider text-white placeholder-slate-400/50 focus:outline-none"
          style="box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)"
          placeholder="Leave a message..."
        ></textarea>
      </div>

      <!-- Submit Button and Messages -->
      <div class="flex items-center justify-between gap-4">
        <!-- Success/Error Messages -->
        <div class="flex-1">
          <div
            v-if="submitStatus === 'success'"
            class="font-300 text-sm tracking-wider text-green-400"
          >
            ✓ Message sent successfully! We'll get back to you soon.
          </div>
          <div
            v-if="submitStatus === 'error'"
            class="font-300 text-sm tracking-wider text-red-400"
          >
            ✗ Something went wrong. Please try again or email us directly.
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-seagull-600 hover:bg-seagull-500 cursor-pointer rounded-md px-6 py-3 text-[1.3rem] font-normal tracking-[0.1rem] text-slate-950 uppercase transition-colors [text-shadow:1px_1px_4px_#00000054] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </button>
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
    event.preventDefault()
    isSubmitting.value = true
    submitStatus.value = null

    try {
      // event.target is the form element when using @submit
      const formData = new FormData(event.target)

      // LOCAL DEVELOPMENT: Mock the submission
      if (import.meta.dev) {
        console.log('🧪 LOCAL DEV: Form submission (not sent to Netlify)')

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
