import { defineEventHandler, getQuery } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs';

const search = defineEventHandler(async (event) => {
  const { query } = getQuery(event);
  return {
    claims: [],
    quotes: [],
    memes: [],
    totalClaims: 0,
    totalQuotes: 0,
    totalMemes: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    message: "This API endpoint is deprecated. Search is now handled directly via Nuxt Content v3."
  };
});

export { search as default };
//# sourceMappingURL=search.mjs.map
