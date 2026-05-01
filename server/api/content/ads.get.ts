// Server API endpoint for ads — disabled (advertising removed from Lovely Bunch of Coconuts)
export default defineEventHandler(async (_event) => {
  return { data: [], _debug: { source: 'disabled', count: 0 } }
})
