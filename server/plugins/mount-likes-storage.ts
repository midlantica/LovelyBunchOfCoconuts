// Mount persistent storage for like counts.
// On Netlify, use Netlify Blobs (Functions v2). Locally, fallback to filesystem.
import netlifyBlobsDriver from 'unstorage/drivers/netlify-blobs'
import fsDriver from 'unstorage/drivers/fs'

export default defineNitroPlugin(() => {
  const storage = useStorage()
  try {
    if (process.env.NETLIFY === 'true') {
      const driver = netlifyBlobsDriver({ base: 'likes' })
      storage.mount('likes', driver)
      return
    }
  } catch (e) {
    // fall through to FS
  }
  // Dev fallback
  const driver = fsDriver({ base: './server/.data/likes' })
  storage.mount('likes', driver)
})
