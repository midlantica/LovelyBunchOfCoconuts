// Server API endpoint for ads — disabled (advertising removed from Tally Ho!)
export default defineEventHandler(async (_event) => {
  return { data: [], _debug: { source: 'disabled', count: 0 } }
})
