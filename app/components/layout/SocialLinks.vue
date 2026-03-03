<template>
  <div
    :class="[
      'mt-0 border-t pt-0',
      isDark ? 'border-slate-700' : 'border-slate-200',
    ]"
  >
    <div class="px-3 py-3">
      <div
        class="flex cursor-pointer! justify-end gap-3 text-xs text-slate-100 *:text-[1.5rem]"
      >
        <a
          href="https://x.com/WakeUpNPC911"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit WakeUpNPC on X"
          :class="[
            'inline-flex',
            isDark ? 'social-icon-link--dark' : 'social-icon-link--light',
          ]"
        >
          <IconsXTwitter :size="24" />
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61582910375411"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit WakeUpNPC on Facebook"
          :class="[
            'inline-flex',
            isDark ? 'social-icon-link--dark' : 'social-icon-link--light',
          ]"
        >
          <IconsFacebook :size="24" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
  const { isDark } = useTheme()
</script>

<style scoped>
  /* Dark mode */
  .social-icon-link--dark {
    color: #f8fafc; /* slate-50 */
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .social-icon-link--dark:hover {
    color: #6dd3ff; /* seagull-300 */
  }

  /* Light mode */
  .social-icon-link--light {
    color: #1a1a1a; /* charcoal */
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .social-icon-link--light:hover {
    color: #0089cc; /* seagull-600 */
  }
</style>
