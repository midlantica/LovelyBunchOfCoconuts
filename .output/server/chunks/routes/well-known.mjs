import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'better-sqlite3';

const wellKnown = defineEventHandler((event) => {
  return {};
});

export { wellKnown as default };
//# sourceMappingURL=well-known.mjs.map
