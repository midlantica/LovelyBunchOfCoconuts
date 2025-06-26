// server/plugins/content-filter.js
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('content:file:beforeParse', (file) => {
    // Skip processing if file or file.path is undefined
    if (!file || !file.path) {
      console.log('Skipping file processing: file or file.path is undefined');
      return;
    }
    
    // Skip README.md files regardless of case
    if (file.path.toLowerCase().includes('readme.md')) {
      console.log(`Skipping README file: ${file.path}`);
      file._id = null; // This prevents the file from being processed
      return;
    }
    
    // Skip files with double underscore
    if (file.path.includes('__')) {
      console.log(`Skipping file with double underscore: ${file.path}`);
      file._id = null;
      return;
    }
  });
});
