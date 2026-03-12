// server/plugins/content-filter.js
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('content:file:beforeParse', (file) => {
    // Skip processing if file or file.path is undefined
    if (!file || !file.path) {
      return
    }

    // Skip README.md files regardless of case
    if (file.path.toLowerCase().includes('readme.md')) {
      file._id = null // This prevents the file from being processed
      return
    }

    // Skip files with double underscore
    if (file.path.includes('__')) {
      file._id = null
      return
    }
  })
})
