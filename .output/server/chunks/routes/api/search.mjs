import { d as defineEventHandler, g as getQuery } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'better-sqlite3';

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
