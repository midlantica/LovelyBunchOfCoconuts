import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync, mkdirSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=g(e._destroy,t._destroy);}};function _(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$1.prototype),c}function g(...n){return function(...e){for(const t of n)t(...e);}}const m=_();class A extends m{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function S(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const C=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(C.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function O(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:S(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const xForwardedHost = event.node.req.headers["x-forwarded-host"];
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
createFetch({ fetch, Headers: Headers$1, AbortController });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "ce94bca9-a4ce-413a-8013-1f4369f224dc",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/__nuxt_content/**": {
        "robots": false
      },
      "/__nuxt_content/claims/sql_dump": {
        "prerender": true
      },
      "/__nuxt_content/quotes/sql_dump": {
        "prerender": true
      },
      "/__nuxt_content/memes/sql_dump": {
        "prerender": true
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "content": {
      "wsUrl": ""
    },
    "mdc": {
      "components": {
        "prose": true,
        "map": {}
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      }
    }
  },
  "content": {
    "databaseVersion": "v3.5.0",
    "version": "3.5.1",
    "database": {
      "type": "sqlite",
      "filename": "./contents.sqlite"
    },
    "localDatabase": {
      "type": "sqlite",
      "filename": "/Users/drew/Documents/_work/WakeUpNPC2/.data/content/contents.sqlite"
    },
    "integrityCheck": true
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await import('../_/error-500.mjs');
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

function defineNitroPlugin(def) {
  return def;
}

const _kZIIM0Ct6P5TClNhxiZaICGHO7hHQWuU8SwC7dYiOdw = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("content:file:beforeParse", (file) => {
    if (!file || !file.path) {
      console.log("Skipping file processing: file or file.path is undefined");
      return;
    }
    if (file.path.toLowerCase().includes("readme.md")) {
      console.log(`Skipping README file: ${file.path}`);
      file._id = null;
      return;
    }
    if (file.path.includes("__")) {
      console.log(`Skipping file with double underscore: ${file.path}`);
      file._id = null;
      return;
    }
  });
});

const plugins = [
  _kZIIM0Ct6P5TClNhxiZaICGHO7hHQWuU8SwC7dYiOdw
];

const assets = {
  "/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"3804-HqpsG9tRU5f8Y3pGwm3aXBQDLho\"",
    "mtime": "2025-06-24T17:23:22.274Z",
    "size": 14340,
    "path": "../public/.DS_Store"
  },
  "/apple-touch-icon.png": {
    "type": "image/png",
    "etag": "\"3351-BbwKT7ZwuNme44Pxgt5/wcdl+KY\"",
    "mtime": "2025-06-24T17:23:22.273Z",
    "size": 13137,
    "path": "../public/apple-touch-icon.png"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"15b6-q4UusjSMIKbfI4K4TDrSR3lBdrc\"",
    "mtime": "2025-06-24T17:23:22.273Z",
    "size": 5558,
    "path": "../public/favicon.ico"
  },
  "/grainy-background-aqua.afphoto": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"28e5f5-eIGCz6TjueqMi6V6qClPLMdRpXQ\"",
    "mtime": "2025-06-24T17:23:22.280Z",
    "size": 2680309,
    "path": "../public/grainy-background-aqua.afphoto"
  },
  "/grainy-background-aqua.jpg": {
    "type": "image/jpeg",
    "etag": "\"810ec-nenZ4pd+szn1A1zNiyfErUn1rLI\"",
    "mtime": "2025-06-24T17:23:22.276Z",
    "size": 528620,
    "path": "../public/grainy-background-aqua.jpg"
  },
  "/grainy-background.afphoto": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"3a480b-Y6THzpDVD180Ip0ggQXsO8o5lRQ\"",
    "mtime": "2025-06-24T17:23:22.281Z",
    "size": 3819531,
    "path": "../public/grainy-background.afphoto"
  },
  "/grainy-background.jpg": {
    "type": "image/jpeg",
    "etag": "\"41eda-6RPt9FPngRTZpIIKtBgVZJQ30Z0\"",
    "mtime": "2025-06-24T17:23:22.277Z",
    "size": 270042,
    "path": "../public/grainy-background.jpg"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
    "mtime": "2025-06-24T17:23:22.274Z",
    "size": 1,
    "path": "../public/robots.txt"
  },
  "/favicon/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-ebUEhEpT3vH/zS28ukgdkg/s1Hs\"",
    "mtime": "2025-06-24T17:23:21.514Z",
    "size": 6148,
    "path": "../public/favicon/.DS_Store"
  },
  "/favicon/favicon-120x120.png": {
    "type": "image/png",
    "etag": "\"1cc4-ZxJddprgOHr4xuGiG3CLTXoftbY\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 7364,
    "path": "../public/favicon/favicon-120x120.png"
  },
  "/favicon/favicon-144x144.png": {
    "type": "image/png",
    "etag": "\"24cf-78tfa/iqqYwE4vlqQ/6mT7IrZY4\"",
    "mtime": "2025-06-24T17:23:21.521Z",
    "size": 9423,
    "path": "../public/favicon/favicon-144x144.png"
  },
  "/favicon/favicon-16x16.png": {
    "type": "image/png",
    "etag": "\"15b6-q4UusjSMIKbfI4K4TDrSR3lBdrc\"",
    "mtime": "2025-06-24T17:23:21.523Z",
    "size": 5558,
    "path": "../public/favicon/favicon-16x16.png"
  },
  "/favicon/favicon-192x192.png": {
    "type": "image/png",
    "etag": "\"3858-oS3ylkkCRLRsmGZCv2Rbb+i1pWg\"",
    "mtime": "2025-06-24T17:23:21.521Z",
    "size": 14424,
    "path": "../public/favicon/favicon-192x192.png"
  },
  "/favicon/favicon-32x32.png": {
    "type": "image/png",
    "etag": "\"640-KNXy0weQzRFYBuMbiJnJ5ge1Oec\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 1600,
    "path": "../public/favicon/favicon-32x32.png"
  },
  "/favicon/favicon-36x36.png": {
    "type": "image/png",
    "etag": "\"6d9-gDBpYSJN5jYejoQ00/xntojkqgM\"",
    "mtime": "2025-06-24T17:23:21.521Z",
    "size": 1753,
    "path": "../public/favicon/favicon-36x36.png"
  },
  "/favicon/favicon-48x48.png": {
    "type": "image/png",
    "etag": "\"953-gdQhU0sXDBR/kGLVV60Q+cYZfl4\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 2387,
    "path": "../public/favicon/favicon-48x48.png"
  },
  "/favicon/favicon-512x512.png": {
    "type": "image/png",
    "etag": "\"125b3-AoqZFQVvWQA1jlyU6+AWbtxo/X4\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 75187,
    "path": "../public/favicon/favicon-512x512.png"
  },
  "/favicon/favicon-57x57.png": {
    "type": "image/png",
    "etag": "\"b98-TPHIY2Bp2lW5laMpyBEL9zJIHQI\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 2968,
    "path": "../public/favicon/favicon-57x57.png"
  },
  "/favicon/favicon-60x60.png": {
    "type": "image/png",
    "etag": "\"c19-WU+qtXGysE1qN9s+d8ZuEsIcflk\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 3097,
    "path": "../public/favicon/favicon-60x60.png"
  },
  "/favicon/favicon-72x72.png": {
    "type": "image/png",
    "etag": "\"e63-mnptv9SoRgL5gp59K3WxSNmH2+g\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 3683,
    "path": "../public/favicon/favicon-72x72.png"
  },
  "/favicon/favicon-96x96.png": {
    "type": "image/png",
    "etag": "\"14ad-BqfFc8G7US3mSb9m0/t+yh5JUS8\"",
    "mtime": "2025-06-24T17:23:21.522Z",
    "size": 5293,
    "path": "../public/favicon/favicon-96x96.png"
  },
  "/favicon/site.webmanifest": {
    "type": "application/manifest+json",
    "etag": "\"6a9-qcJePSdkPjcNALCjRgxPJwDMyZY\"",
    "mtime": "2025-06-24T17:23:21.523Z",
    "size": 1705,
    "path": "../public/favicon/site.webmanifest"
  },
  "/_nuxt/4TxibJK0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4b40-FoE1HUmdZbOlbKk1bFJ+cVVSR0k\"",
    "mtime": "2025-06-24T17:23:21.466Z",
    "size": 19264,
    "path": "../public/_nuxt/4TxibJK0.js"
  },
  "/_nuxt/B-BlGZgS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2-Y2DgX+LshKdGkO/j1s8cvYIa8Y0\"",
    "mtime": "2025-06-24T17:23:21.466Z",
    "size": 210,
    "path": "../public/_nuxt/B-BlGZgS.js"
  },
  "/_nuxt/B2baDu1c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-E5KPAlRJTjkblQLi8+McUfY1Z64\"",
    "mtime": "2025-06-24T17:23:21.466Z",
    "size": 207,
    "path": "../public/_nuxt/B2baDu1c.js"
  },
  "/_nuxt/B7_0rgcz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bc9-M7EsVdEdazV2+SYir2Dfn+O+Xh0\"",
    "mtime": "2025-06-24T17:23:21.466Z",
    "size": 3017,
    "path": "../public/_nuxt/B7_0rgcz.js"
  },
  "/_nuxt/BPTJBfYp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"199-oLvrD5H/+q4heNAKF/SFjBNn7mY\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 409,
    "path": "../public/_nuxt/BPTJBfYp.js"
  },
  "/_nuxt/BROHMhgv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15cd-JpaLQQ55nHozWURU2ra0Y7ZTZ8Y\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 5581,
    "path": "../public/_nuxt/BROHMhgv.js"
  },
  "/_nuxt/BaUARQXD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"269-kGBdAMjVwEoznyDvmer9kJFiitM\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 617,
    "path": "../public/_nuxt/BaUARQXD.js"
  },
  "/_nuxt/BwDhNnI0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-pUMwLDIR3rLGejja1yyMI8XLMIY\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 207,
    "path": "../public/_nuxt/BwDhNnI0.js"
  },
  "/_nuxt/C-b68yCC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cb-7d15IGonoem2/mold429BZiSRq0\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 715,
    "path": "../public/_nuxt/C-b68yCC.js"
  },
  "/_nuxt/C38XuK44.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-Q1P8rnEReJx96lSLh5y6Eb5DXc0\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 207,
    "path": "../public/_nuxt/C38XuK44.js"
  },
  "/_nuxt/C8QJIIc3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-u77rgX8PtcFbMXnpVRjj4zD5XlU\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 207,
    "path": "../public/_nuxt/C8QJIIc3.js"
  },
  "/_nuxt/C9_fo7gj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d7-+s2jhkCtDPlSSPyX48wAeKde+Rc\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 215,
    "path": "../public/_nuxt/C9_fo7gj.js"
  },
  "/_nuxt/C9tRyYzR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2119-jKU3NAjqaK2a3Di90gWdur6q8dA\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 8473,
    "path": "../public/_nuxt/C9tRyYzR.js"
  },
  "/_nuxt/CEZIuhus.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-DDezI2cPtEzQsNL5eZIcGO21+4A\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 207,
    "path": "../public/_nuxt/CEZIuhus.js"
  },
  "/_nuxt/CYEia8Os.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"244-wvvL+ZIrqD3RDS45hYR3dfD8M1I\"",
    "mtime": "2025-06-24T17:23:21.467Z",
    "size": 580,
    "path": "../public/_nuxt/CYEia8Os.js"
  },
  "/_nuxt/Cmxf2Eta.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bcc-JmdouPUbOytVt8U32SxWUpA14O0\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 3020,
    "path": "../public/_nuxt/Cmxf2Eta.js"
  },
  "/_nuxt/CzayonYK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15c6-9EsUfHIvaqpL5sH+0jJQYTsYFpc\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 5574,
    "path": "../public/_nuxt/CzayonYK.js"
  },
  "/_nuxt/D1BJWO3s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f-GecSNFps7GoLRdLHM3oUxInReHQ\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 591,
    "path": "../public/_nuxt/D1BJWO3s.js"
  },
  "/_nuxt/D1NMTosE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b24-3INemMa77rrQ/5U26AOgBEUF2bs\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 2852,
    "path": "../public/_nuxt/D1NMTosE.js"
  },
  "/_nuxt/D39kHikk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c9a-TKNYpKFznGeUry8gLnZ7PUnBsyQ\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 3226,
    "path": "../public/_nuxt/D39kHikk.js"
  },
  "/_nuxt/DDaKK5bo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d3-75IM56r8+tX+t73kEGo6eKVHciQ\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 211,
    "path": "../public/_nuxt/DDaKK5bo.js"
  },
  "/_nuxt/DKSk2hwS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f-k05XpqwltaL5QGL9ryXJEFwGARc\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 591,
    "path": "../public/_nuxt/DKSk2hwS.js"
  },
  "/_nuxt/DLa_W-HH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"52de-k1DUWcxmfMKlmH+7TSJd3GUlCW4\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 21214,
    "path": "../public/_nuxt/DLa_W-HH.js"
  },
  "/_nuxt/DTdGg2Zx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1985e-4CLGJwFCmGSbYb0AM3DBzBM1nQ8\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 104542,
    "path": "../public/_nuxt/DTdGg2Zx.js"
  },
  "/_nuxt/DVyywvu7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d1-cxJpWEAKBotv6ocCnS+yzIcbnWQ\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 209,
    "path": "../public/_nuxt/DVyywvu7.js"
  },
  "/_nuxt/DZMszD3q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bcb-KZe9UyjEN5zxnPbGaVY5183Cfng\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 3019,
    "path": "../public/_nuxt/DZMszD3q.js"
  },
  "/_nuxt/DZR8T9-r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f-VoFaEoj+LE9DjT0U9DmqusD/dx8\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 591,
    "path": "../public/_nuxt/DZR8T9-r.js"
  },
  "/_nuxt/Dcv1yAv2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"132-I6pf65RJ4c+nDA5jzBinjnW/xKs\"",
    "mtime": "2025-06-24T17:23:21.468Z",
    "size": 306,
    "path": "../public/_nuxt/Dcv1yAv2.js"
  },
  "/_nuxt/DfhGtcxV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"43a-4aQSATo+Fx9QpliilvoxiROJw/Y\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 1082,
    "path": "../public/_nuxt/DfhGtcxV.js"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/Dy74UTSv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-9nlnSLfK3uuryS4A06qWsyIl2BA\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 207,
    "path": "../public/_nuxt/Dy74UTSv.js"
  },
  "/_nuxt/FjVHhawu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ce-KFxf/bUPMM2Eb2A3FgY+Q7zoJB4\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 206,
    "path": "../public/_nuxt/FjVHhawu.js"
  },
  "/_nuxt/Icon.SPH2noX5.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"43-6cLOdVoYTf4bgZQe2fs4Lut/BbU\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 67,
    "path": "../public/_nuxt/Icon.SPH2noX5.css"
  },
  "/_nuxt/IconCSS.OBKc-302.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"102-kwgjOmDUV00fbCCETi4ER0B40e8\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 258,
    "path": "../public/_nuxt/IconCSS.OBKc-302.css"
  },
  "/_nuxt/P94DfexP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bb9d-5U4pzH/mILsZjzXAARuPxE/WPkA\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 179101,
    "path": "../public/_nuxt/P94DfexP.js"
  },
  "/_nuxt/ProsePre.D5orA6B_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e-jczvRAVUXbzGL6yotozKFbyMO4s\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 30,
    "path": "../public/_nuxt/ProsePre.D5orA6B_.css"
  },
  "/_nuxt/ScS2WLEy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f-iITXblaOwqZFzk7kUKL028Jlhgw\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 591,
    "path": "../public/_nuxt/ScS2WLEy.js"
  },
  "/_nuxt/VgbdPiEc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cc-vOIgisOpc7Y4v4++HWsxAP4OQWw\"",
    "mtime": "2025-06-24T17:23:21.469Z",
    "size": 460,
    "path": "../public/_nuxt/VgbdPiEc.js"
  },
  "/_nuxt/WakeUpNPC.cxikUEtC.svg": {
    "type": "image/svg+xml",
    "etag": "\"13fe-mCCYyEDoY4FmtGp4uVozuO1AP/o\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 5118,
    "path": "../public/_nuxt/WakeUpNPC.cxikUEtC.svg"
  },
  "/_nuxt/_...B-dNEtXS.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"129-Tm5xpZbq7JEsNwpvgUKc7hv8mto\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 297,
    "path": "../public/_nuxt/_...B-dNEtXS.css"
  },
  "/_nuxt/_...B34Y31rT.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"105-vjGA4c8NfArHqLmuh7YJBuacs0U\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 261,
    "path": "../public/_nuxt/_...B34Y31rT.css"
  },
  "/_nuxt/content-detail.pywetWIK.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"59-L7wiXP9bq1WX7o2fOPl/QizQAlQ\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 89,
    "path": "../public/_nuxt/content-detail.pywetWIK.css"
  },
  "/_nuxt/default.9Qa0p9ZD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ce-MfSCp3WN8vM3DHh//9L8tjwoGfo\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 206,
    "path": "../public/_nuxt/default.9Qa0p9ZD.css"
  },
  "/_nuxt/entry.BBeCtgc4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c50d-Lh83fWc+JwQJFwILTVb8pPPEax8\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 50445,
    "path": "../public/_nuxt/entry.BBeCtgc4.css"
  },
  "/_nuxt/gBPlaM_d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1182-YyTAvQBSvIRmfUO7JJ9WQFOymaM\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 4482,
    "path": "../public/_nuxt/gBPlaM_d.js"
  },
  "/_nuxt/h3OCBXpR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-gjHwxr07I9kFTqHpDpmklk68kiE\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 207,
    "path": "../public/_nuxt/h3OCBXpR.js"
  },
  "/_nuxt/home.DdMWlvMV.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c1b-zqE6ieKhhib6LGRDzTAapOe7jH8\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 3099,
    "path": "../public/_nuxt/home.DdMWlvMV.css"
  },
  "/_nuxt/iVrq4uvB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2-qQZUDDuolDAfGUnQFYphB7YMsD4\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 210,
    "path": "../public/_nuxt/iVrq4uvB.js"
  },
  "/_nuxt/index.BX2qW4Yn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"52a-ToceEoEzD9FTPKQMFMyCndUtaIc\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 1322,
    "path": "../public/_nuxt/index.BX2qW4Yn.css"
  },
  "/_nuxt/o7hx4kTI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a6-G7cu5rjP6ppb3RVdi3nXvneG8Og\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 166,
    "path": "../public/_nuxt/o7hx4kTI.js"
  },
  "/_nuxt/s2ddXXur.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"218-Ce1ctg4RsT5KsJO5uxA66iWPO94\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 536,
    "path": "../public/_nuxt/s2ddXXur.js"
  },
  "/_nuxt/taQxJhpz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f-2TkZZNxM4qY6m6P1KoVUkV0MnIM\"",
    "mtime": "2025-06-24T17:23:21.470Z",
    "size": 591,
    "path": "../public/_nuxt/taQxJhpz.js"
  },
  "/_nuxt/xFfz45kB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2-P91dP0bxVvGASwfrG/Nr/Efpf4A\"",
    "mtime": "2025-06-24T17:23:21.471Z",
    "size": 210,
    "path": "../public/_nuxt/xFfz45kB.js"
  },
  "/memes/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"4804-cnpP0n8HY2gDSBL6PaUatbc/8Io\"",
    "mtime": "2025-06-24T17:23:21.514Z",
    "size": 18436,
    "path": "../public/memes/.DS_Store"
  },
  "/memes/__ReadMe.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"3a1-qTvFWdPhFA7q/hCusb1H0b5QeSs\"",
    "mtime": "2025-06-24T17:23:21.524Z",
    "size": 929,
    "path": "../public/memes/__ReadMe.md"
  },
  "/__nuxt_content/claims/sql_dump": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"13634-nuLyo7SxN7KkXhgQHDmfvWXDb6I\"",
    "mtime": "2025-06-24T17:23:21.440Z",
    "size": 79412,
    "path": "../public/__nuxt_content/claims/sql_dump"
  },
  "/__nuxt_content/memes/sql_dump": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"5b4-V8P7a5/TkUY9uop+zaQnAf+tyL0\"",
    "mtime": "2025-06-24T17:23:21.440Z",
    "size": 1460,
    "path": "../public/__nuxt_content/memes/sql_dump"
  },
  "/__nuxt_content/quotes/sql_dump": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"dbb8-wz6+KSDRBvYtiQkD0gJHounxjRc\"",
    "mtime": "2025-06-24T17:23:21.440Z",
    "size": 56248,
    "path": "../public/__nuxt_content/quotes/sql_dump"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-e+7wn0G7rGKn0DBL+fF04t9SNtU\"",
    "mtime": "2025-06-24T17:23:21.459Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/memes/cartoons/dei-blm-crt-esg-end-woke-insanity.png": {
    "type": "image/png",
    "etag": "\"96fba-GEOO4q3BfvBNKwCJJLyMaSiJHcM\"",
    "mtime": "2025-06-24T17:23:21.531Z",
    "size": 618426,
    "path": "../public/memes/cartoons/dei-blm-crt-esg-end-woke-insanity.png"
  },
  "/memes/cartoons/modern-barbarians20.png": {
    "type": "image/png",
    "etag": "\"20c7e3-CzAF9DvSJa9AusBE8lEh5R6fPhs\"",
    "mtime": "2025-06-24T17:23:21.519Z",
    "size": 2148323,
    "path": "../public/memes/cartoons/modern-barbarians20.png"
  },
  "/memes/cartoons/toxic-leftist-media-mass-formation-psychosis-04.png": {
    "type": "image/png",
    "etag": "\"16869a-jmNiKy3sSffb1X9g3/QAzZh7K+I\"",
    "mtime": "2025-06-24T17:23:21.531Z",
    "size": 1476250,
    "path": "../public/memes/cartoons/toxic-leftist-media-mass-formation-psychosis-04.png"
  },
  "/memes/cartoons/were-way-past-swamp-britain.png": {
    "type": "image/png",
    "etag": "\"15765a-uPRwo5Dei/q1uiXd2Cq8tA6wW5A\"",
    "mtime": "2025-06-24T17:23:21.533Z",
    "size": 1406554,
    "path": "../public/memes/cartoons/were-way-past-swamp-britain.png"
  },
  "/memes/cartoons/were-way-past-swamp.png": {
    "type": "image/png",
    "etag": "\"13c003-EBidXTJWAGXnbJksK3aC7vP3eVw\"",
    "mtime": "2025-06-24T17:23:21.539Z",
    "size": 1294339,
    "path": "../public/memes/cartoons/were-way-past-swamp.png"
  },
  "/memes/cartoons/what-have-the-left-ever-done-for-us.png": {
    "type": "image/png",
    "etag": "\"f0c9a-nCDfmLOiuRNZvcHMfw+VDTPJuFk\"",
    "mtime": "2025-06-24T17:23:21.531Z",
    "size": 986266,
    "path": "../public/memes/cartoons/what-have-the-left-ever-done-for-us.png"
  },
  "/memes/cartoons/wokezilla-hollywood.png": {
    "type": "image/png",
    "etag": "\"10971e-34TThibVNSW77cCNkh771+yPYxE\"",
    "mtime": "2025-06-24T17:23:21.538Z",
    "size": 1087262,
    "path": "../public/memes/cartoons/wokezilla-hollywood.png"
  },
  "/memes/capitalism/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-3y++sUAKzaCQmjLBz2v0kvESHgc\"",
    "mtime": "2025-06-24T17:23:21.515Z",
    "size": 6148,
    "path": "../public/memes/capitalism/.DS_Store"
  },
  "/memes/capitalism/a-free-market-economy-is-a-giant-computer.png": {
    "type": "image/png",
    "etag": "\"1ab685-gitrcGyNaZBu8A6BvO+FWbbyIoE\"",
    "mtime": "2025-06-24T17:23:21.552Z",
    "size": 1750661,
    "path": "../public/memes/capitalism/a-free-market-economy-is-a-giant-computer.png"
  },
  "/memes/capitalism/a-free-market-free-exchange-economy-is-a.png": {
    "type": "image/png",
    "etag": "\"2aaba-Uz/9egzfr7wZEF1m/qPOvWmq9Xg\"",
    "mtime": "2025-06-24T17:23:21.551Z",
    "size": 174778,
    "path": "../public/memes/capitalism/a-free-market-free-exchange-economy-is-a.png"
  },
  "/memes/capitalism/at-least-im-not-a-capitalist-capitalism.png": {
    "type": "image/png",
    "etag": "\"10254a-363Z3NNKGwKoD0edFO+7RzAZDtU\"",
    "mtime": "2025-06-24T17:23:21.547Z",
    "size": 1058122,
    "path": "../public/memes/capitalism/at-least-im-not-a-capitalist-capitalism.png"
  },
  "/memes/capitalism/biz-vs-govt.png": {
    "type": "image/png",
    "etag": "\"eac6d-Vh+5R9zbO1UAsAuMJlVMU8xgdNo\"",
    "mtime": "2025-06-24T17:23:21.549Z",
    "size": 961645,
    "path": "../public/memes/capitalism/biz-vs-govt.png"
  },
  "/memes/capitalism/but-that-wasnt-redi-communism.png": {
    "type": "image/png",
    "etag": "\"8f68b-yxTvyeTWX3jt9NvVPw8q9+wZmRA\"",
    "mtime": "2025-06-24T17:23:21.565Z",
    "size": 587403,
    "path": "../public/memes/capitalism/but-that-wasnt-redi-communism.png"
  },
  "/memes/capitalism/capitalism-fishing.png": {
    "type": "image/png",
    "etag": "\"f92ed-6rNR8V4bVA6ZbK/hvaxWG57JPNA\"",
    "mtime": "2025-06-24T17:23:21.553Z",
    "size": 1020653,
    "path": "../public/memes/capitalism/capitalism-fishing.png"
  },
  "/memes/capitalism/capitalism-im-relatively-tame.png": {
    "type": "image/png",
    "etag": "\"73216-yNXb8JNG62zvVUC/httKaG0lpjo\"",
    "mtime": "2025-06-24T17:23:21.552Z",
    "size": 471574,
    "path": "../public/memes/capitalism/capitalism-im-relatively-tame.png"
  },
  "/memes/capitalism/capitalism-vs-socialism-for-dummies.png": {
    "type": "image/png",
    "etag": "\"54ea1-wQNi29/CcUPur5X9/nORNFy9O2k\"",
    "mtime": "2025-06-24T17:23:21.553Z",
    "size": 347809,
    "path": "../public/memes/capitalism/capitalism-vs-socialism-for-dummies.png"
  },
  "/memes/capitalism/capitalists-will-always-pay-their-worker.png": {
    "type": "image/png",
    "etag": "\"47fee-jM3rWBidRjKglZFa0V7QnlEW1Cw\"",
    "mtime": "2025-06-24T17:23:21.559Z",
    "size": 294894,
    "path": "../public/memes/capitalism/capitalists-will-always-pay-their-worker.png"
  },
  "/memes/capitalism/characters-whose-plans-always-fail-miser.png": {
    "type": "image/png",
    "etag": "\"b0815-Q8K2nyPkcyoYnY0HCqwII5kDpcU\"",
    "mtime": "2025-06-24T17:23:21.557Z",
    "size": 722965,
    "path": "../public/memes/capitalism/characters-whose-plans-always-fail-miser.png"
  },
  "/memes/capitalism/collectivism-100-million-people-murdered.png": {
    "type": "image/png",
    "etag": "\"cde62-lRy9eLTSoddYCqU0Gn5aybQ4bHo\"",
    "mtime": "2025-06-24T17:23:21.560Z",
    "size": 843362,
    "path": "../public/memes/capitalism/collectivism-100-million-people-murdered.png"
  },
  "/memes/capitalism/commiepoly-1.png": {
    "type": "image/png",
    "etag": "\"13f0b4-fXuu9DPCuoVyBAu4jhGXvpg2OUk\"",
    "mtime": "2025-06-24T17:23:21.559Z",
    "size": 1306804,
    "path": "../public/memes/capitalism/commiepoly-1.png"
  },
  "/memes/capitalism/corporatism-is-not-capitalism.png": {
    "type": "image/png",
    "etag": "\"174b6e-loTmgeVPrEGIp5930HFwe9Z81VA\"",
    "mtime": "2025-06-24T17:23:21.562Z",
    "size": 1526638,
    "path": "../public/memes/capitalism/corporatism-is-not-capitalism.png"
  },
  "/memes/capitalism/could-the-problem-be-marxism.png": {
    "type": "image/png",
    "etag": "\"cbbea-x0/DfDhVg2baZVUW3aasFRzBqyQ\"",
    "mtime": "2025-06-24T17:23:21.566Z",
    "size": 834538,
    "path": "../public/memes/capitalism/could-the-problem-be-marxism.png"
  },
  "/memes/capitalism/damn-capitalism.png": {
    "type": "image/png",
    "etag": "\"90efe-CA9b5Hgce7mpC3eTHra9DZ6l7/w\"",
    "mtime": "2025-06-24T17:23:21.565Z",
    "size": 593662,
    "path": "../public/memes/capitalism/damn-capitalism.png"
  },
  "/memes/capitalism/fictional-country-socialists.png": {
    "type": "image/png",
    "etag": "\"90211-0p9Y52HzzBGuS21zBmYOrWav4C8\"",
    "mtime": "2025-06-24T17:23:21.565Z",
    "size": 590353,
    "path": "../public/memes/capitalism/fictional-country-socialists.png"
  },
  "/memes/capitalism/gdp-per-person-1990-international-dollar.png": {
    "type": "image/png",
    "etag": "\"450f9-ZOrrirbuTICOx0i1FWbC/y6xi7M\"",
    "mtime": "2025-06-24T17:23:21.569Z",
    "size": 282873,
    "path": "../public/memes/capitalism/gdp-per-person-1990-international-dollar.png"
  },
  "/memes/capitalism/how-to-do-communism.png": {
    "type": "image/png",
    "etag": "\"635e0-NHIrK1dHqiuGYp2LPoX0p8Xy3/Y\"",
    "mtime": "2025-06-24T17:23:21.570Z",
    "size": 407008,
    "path": "../public/memes/capitalism/how-to-do-communism.png"
  },
  "/memes/capitalism/imaginary-socialism-socialists-living-in.png": {
    "type": "image/png",
    "etag": "\"90483-ZhOBETJ7z9K312IB255no9kRbH0\"",
    "mtime": "2025-06-24T17:23:21.572Z",
    "size": 590979,
    "path": "../public/memes/capitalism/imaginary-socialism-socialists-living-in.png"
  },
  "/memes/capitalism/imaginary-socialism-vs-reality.png": {
    "type": "image/png",
    "etag": "\"9146e-JbGNAnSBZm4haE+k7bIyi6bddHA\"",
    "mtime": "2025-06-24T17:23:21.570Z",
    "size": 595054,
    "path": "../public/memes/capitalism/imaginary-socialism-vs-reality.png"
  },
  "/memes/capitalism/individualism-versus-collectivism.png": {
    "type": "image/png",
    "etag": "\"ecf36-vDL3E6Ume2lIsaCjB7PmS8X5dC8\"",
    "mtime": "2025-06-24T17:23:21.571Z",
    "size": 970550,
    "path": "../public/memes/capitalism/individualism-versus-collectivism.png"
  },
  "/memes/capitalism/keynesian-economics.png": {
    "type": "image/png",
    "etag": "\"c58e3-nQqQNJvuGfDWjGyHg1Tvq6QkSaU\"",
    "mtime": "2025-06-24T17:23:21.572Z",
    "size": 809187,
    "path": "../public/memes/capitalism/keynesian-economics.png"
  },
  "/memes/capitalism/less-marx-more-milei.png": {
    "type": "image/png",
    "etag": "\"12397e-1euZckLFVYg+hBTl8UZgDBZBAWs\"",
    "mtime": "2025-06-24T17:23:21.572Z",
    "size": 1194366,
    "path": "../public/memes/capitalism/less-marx-more-milei.png"
  },
  "/memes/capitalism/lets-divide-a-country-into-half-capitali.png": {
    "type": "image/png",
    "etag": "\"ec71b-YD03ePVBgMrGiwcPNwD77Smmhqw\"",
    "mtime": "2025-06-24T17:23:21.578Z",
    "size": 968475,
    "path": "../public/memes/capitalism/lets-divide-a-country-into-half-capitali.png"
  },
  "/memes/capitalism/lets-see-if-ive-got-this-correct.png": {
    "type": "image/png",
    "etag": "\"a161d-zqpmERPRXbTDQUlUkZT8zJvH8BU\"",
    "mtime": "2025-06-24T17:23:21.577Z",
    "size": 661021,
    "path": "../public/memes/capitalism/lets-see-if-ive-got-this-correct.png"
  },
  "/memes/capitalism/margaret-thatcher-rich-poorer-if-poor-po.png": {
    "type": "image/png",
    "etag": "\"6e4ed-obZqtXvliKs+SCRQQOtQqFpqI9g\"",
    "mtime": "2025-06-24T17:23:21.575Z",
    "size": 451821,
    "path": "../public/memes/capitalism/margaret-thatcher-rich-poorer-if-poor-po.png"
  },
  "/memes/capitalism/marxism-is-an-anti-human-cult.png": {
    "type": "image/png",
    "etag": "\"11f3e9-cKX6p7xqPd2I6sE6mgBC2Hw5iHA\"",
    "mtime": "2025-06-24T17:23:21.579Z",
    "size": 1176553,
    "path": "../public/memes/capitalism/marxism-is-an-anti-human-cult.png"
  },
  "/memes/capitalism/minimum-wage-jobs.png": {
    "type": "image/png",
    "etag": "\"feadd-sTohIZS0zSiIZfsI4QHT1YQ8FkQ\"",
    "mtime": "2025-06-24T17:23:21.578Z",
    "size": 1043165,
    "path": "../public/memes/capitalism/minimum-wage-jobs.png"
  },
  "/memes/capitalism/modern-feudalism-socialism.png": {
    "type": "image/png",
    "etag": "\"36943-Py1+F1gAfMhUL1+bWjqv1GFnLqk\"",
    "mtime": "2025-06-24T17:23:21.579Z",
    "size": 223555,
    "path": "../public/memes/capitalism/modern-feudalism-socialism.png"
  },
  "/memes/capitalism/my-dog-when-hes-eating.png": {
    "type": "image/png",
    "etag": "\"bef63-xG9881k8fSWOY+K27rYhbkW5wr4\"",
    "mtime": "2025-06-24T17:23:21.578Z",
    "size": 782179,
    "path": "../public/memes/capitalism/my-dog-when-hes-eating.png"
  },
  "/memes/capitalism/my-labor-is-exploited-by-capitalists.png": {
    "type": "image/png",
    "etag": "\"82e8f-1YCPpRRdRzrDzZvbnYnI2IEnJ98\"",
    "mtime": "2025-06-24T17:23:21.584Z",
    "size": 536207,
    "path": "../public/memes/capitalism/my-labor-is-exploited-by-capitalists.png"
  },
  "/memes/capitalism/nazi-democrat.png": {
    "type": "image/png",
    "etag": "\"8d3da-jD8Ez0CSt2T1r2nneOAgFcYLlg4\"",
    "mtime": "2025-06-24T17:23:21.585Z",
    "size": 578522,
    "path": "../public/memes/capitalism/nazi-democrat.png"
  },
  "/memes/capitalism/nazis-and-communists-and-antifa-the-same.png": {
    "type": "image/png",
    "etag": "\"7404a-dOde1n+4hfcFJ8eqKs+G1gFn/8k\"",
    "mtime": "2025-06-24T17:23:21.588Z",
    "size": 475210,
    "path": "../public/memes/capitalism/nazis-and-communists-and-antifa-the-same.png"
  },
  "/memes/capitalism/planned-economy-or-planned-destruction-1.png": {
    "type": "image/png",
    "etag": "\"a6a82-tLIe3XRd1zD2bQx430zMVK7DoKA\"",
    "mtime": "2025-06-24T17:23:21.588Z",
    "size": 682626,
    "path": "../public/memes/capitalism/planned-economy-or-planned-destruction-1.png"
  },
  "/memes/capitalism/prior-to-capitalism-the-way-people-amass.png": {
    "type": "image/png",
    "etag": "\"8507a-RjR/ps1E6WMj3pPabf9TeB7VjTg\"",
    "mtime": "2025-06-24T17:23:21.588Z",
    "size": 544890,
    "path": "../public/memes/capitalism/prior-to-capitalism-the-way-people-amass.png"
  },
  "/memes/capitalism/real-socialism-has-never-been-tried-in-t.png": {
    "type": "image/png",
    "etag": "\"92304-rLrahR8fvuLFQuB08hoXIoRn6eA\"",
    "mtime": "2025-06-24T17:23:21.588Z",
    "size": 598788,
    "path": "../public/memes/capitalism/real-socialism-has-never-been-tried-in-t.png"
  },
  "/memes/capitalism/real-socialism-hasnt-been-done-yet.png": {
    "type": "image/png",
    "etag": "\"8075a-N0rrvjkOBsYzxT94uUuHjTbg1Qo\"",
    "mtime": "2025-06-24T17:23:21.590Z",
    "size": 526170,
    "path": "../public/memes/capitalism/real-socialism-hasnt-been-done-yet.png"
  },
  "/memes/capitalism/regimes-endorsed-by-noam-chomsky.png": {
    "type": "image/png",
    "etag": "\"c32ad-PW9CyVD74RNMRvZcVOwb0SqkIm0\"",
    "mtime": "2025-06-24T17:23:21.590Z",
    "size": 799405,
    "path": "../public/memes/capitalism/regimes-endorsed-by-noam-chomsky.png"
  },
  "/memes/capitalism/robin-hood-corrected.png": {
    "type": "image/png",
    "etag": "\"dbdd0-E/z9DOqhRyrLMoAltprx7empXJE\"",
    "mtime": "2025-06-24T17:23:21.590Z",
    "size": 900560,
    "path": "../public/memes/capitalism/robin-hood-corrected.png"
  },
  "/memes/capitalism/robin-hood-didnt-rob-from-the-rich.png": {
    "type": "image/png",
    "etag": "\"f6ab1-1y+H7M+XP/NyRnP1IjnhqQi8Aik\"",
    "mtime": "2025-06-24T17:23:21.591Z",
    "size": 1010353,
    "path": "../public/memes/capitalism/robin-hood-didnt-rob-from-the-rich.png"
  },
  "/memes/capitalism/six-charts-showing-capitalism-last-200-y.png": {
    "type": "image/png",
    "etag": "\"3f985-wS2nZ0Na9UfVimWkF4DqfRoPPwM\"",
    "mtime": "2025-06-24T17:23:21.591Z",
    "size": 260485,
    "path": "../public/memes/capitalism/six-charts-showing-capitalism-last-200-y.png"
  },
  "/memes/capitalism/small-business-vs-unions.png": {
    "type": "image/png",
    "etag": "\"b12de-zVprNRV/SlNmZ+Cs8T+d1llEzHk\"",
    "mtime": "2025-06-24T17:23:21.596Z",
    "size": 725726,
    "path": "../public/memes/capitalism/small-business-vs-unions.png"
  },
  "/memes/capitalism/socialism-free-prison-soap.png": {
    "type": "image/png",
    "etag": "\"7fc72-J/jcMD3T1d8M/lNfJqPb4/yB6gA\"",
    "mtime": "2025-06-24T17:23:21.595Z",
    "size": 523378,
    "path": "../public/memes/capitalism/socialism-free-prison-soap.png"
  },
  "/memes/capitalism/socialism-in-theory-vs-practice.png": {
    "type": "image/png",
    "etag": "\"7ce71-SG0VtFt2HnQ4qjY5RUvlIYgGbfM\"",
    "mtime": "2025-06-24T17:23:21.595Z",
    "size": 511601,
    "path": "../public/memes/capitalism/socialism-in-theory-vs-practice.png"
  },
  "/memes/capitalism/socialism-is-better-than-capitalism.png": {
    "type": "image/png",
    "etag": "\"11b81b-2A4nuc+FPCL41sBwhhRNy8jayQ0\"",
    "mtime": "2025-06-24T17:23:21.596Z",
    "size": 1161243,
    "path": "../public/memes/capitalism/socialism-is-better-than-capitalism.png"
  },
  "/memes/capitalism/socialism-making-everyone-equally-poor-s.png": {
    "type": "image/png",
    "etag": "\"a1cd8-ww3XlYB+L49JpGcWahuYF7fG9aU\"",
    "mtime": "2025-06-24T17:23:21.602Z",
    "size": 662744,
    "path": "../public/memes/capitalism/socialism-making-everyone-equally-poor-s.png"
  },
  "/memes/capitalism/socialism-not-even-germans-could-make-it.png": {
    "type": "image/png",
    "etag": "\"5ef43-aVnE+ET5vSUnfu36USX83+rkUsg\"",
    "mtime": "2025-06-24T17:23:21.602Z",
    "size": 388931,
    "path": "../public/memes/capitalism/socialism-not-even-germans-could-make-it.png"
  },
  "/memes/capitalism/socialism-people-wait-for-bread.png": {
    "type": "image/png",
    "etag": "\"131b75-dtsnXhy2erMqIqboeTi8BKTVs64\"",
    "mtime": "2025-06-24T17:23:21.602Z",
    "size": 1252213,
    "path": "../public/memes/capitalism/socialism-people-wait-for-bread.png"
  },
  "/memes/capitalism/socialism-revolutions.png": {
    "type": "image/png",
    "etag": "\"51734-6Gq5LqxkSYn2OISWogmQ04Bxq3Y\"",
    "mtime": "2025-06-24T17:23:21.602Z",
    "size": 333620,
    "path": "../public/memes/capitalism/socialism-revolutions.png"
  },
  "/memes/capitalism/socialism-stick-a-fork-in-it.png": {
    "type": "image/png",
    "etag": "\"c8e8b-A1k+TIBehuZPNcD7asDD3dKuTPA\"",
    "mtime": "2025-06-24T17:23:21.607Z",
    "size": 822923,
    "path": "../public/memes/capitalism/socialism-stick-a-fork-in-it.png"
  },
  "/memes/capitalism/socialism-vs-capitalism-buildings.png": {
    "type": "image/png",
    "etag": "\"1a54ae-PNNbK2xO7LFrj9AMKdFJPbsgMUI\"",
    "mtime": "2025-06-24T17:23:21.607Z",
    "size": 1725614,
    "path": "../public/memes/capitalism/socialism-vs-capitalism-buildings.png"
  },
  "/memes/capitalism/socialism-vs-capitalism-diving-board.png": {
    "type": "image/png",
    "etag": "\"e11e6-VgbXYrv8GbE6m/Av730/66huLwo\"",
    "mtime": "2025-06-24T17:23:21.605Z",
    "size": 922086,
    "path": "../public/memes/capitalism/socialism-vs-capitalism-diving-board.png"
  },
  "/memes/capitalism/socialists-living-in-capitalism.png": {
    "type": "image/png",
    "etag": "\"113829-8O732TZnBHidpGHDo8b+20+ujCk\"",
    "mtime": "2025-06-24T17:23:21.608Z",
    "size": 1128489,
    "path": "../public/memes/capitalism/socialists-living-in-capitalism.png"
  },
  "/memes/capitalism/socialists-you-guys-always-act-like-your.png": {
    "type": "image/png",
    "etag": "\"d4b4a-fFMD2h3VCMUIyLu43dYkha6ZrFI\"",
    "mtime": "2025-06-24T17:23:21.619Z",
    "size": 871242,
    "path": "../public/memes/capitalism/socialists-you-guys-always-act-like-your.png"
  },
  "/memes/capitalism/south-korea-capitalism-vs-north-korea-so.png": {
    "type": "image/png",
    "etag": "\"c1e7b-eCSczXIrrqwGIe3Hqd56DaMhETo\"",
    "mtime": "2025-06-24T17:23:21.614Z",
    "size": 794235,
    "path": "../public/memes/capitalism/south-korea-capitalism-vs-north-korea-so.png"
  },
  "/memes/capitalism/the-american-dream-is-more-apt-to-be-rea.png": {
    "type": "image/png",
    "etag": "\"11b70a-XfW1l02hIJKi0r8ZNLSxiIUWvfg\"",
    "mtime": "2025-06-24T17:23:21.623Z",
    "size": 1160970,
    "path": "../public/memes/capitalism/the-american-dream-is-more-apt-to-be-rea.png"
  },
  "/memes/capitalism/the-birth-of-free-market-economics.png": {
    "type": "image/png",
    "etag": "\"b44d7-dDsRLx/Xs+qD/EZ38bnV2auyMdY\"",
    "mtime": "2025-06-24T17:23:21.614Z",
    "size": 738519,
    "path": "../public/memes/capitalism/the-birth-of-free-market-economics.png"
  },
  "/memes/capitalism/the-free-market-has-failed.png": {
    "type": "image/png",
    "etag": "\"b44d1-qgDJdU0DeGTPiCjkwAvA/7fOD3w\"",
    "mtime": "2025-06-24T17:23:21.618Z",
    "size": 738513,
    "path": "../public/memes/capitalism/the-free-market-has-failed.png"
  },
  "/memes/capitalism/the-left-would-rather-the-poor-were-poor.png": {
    "type": "image/png",
    "etag": "\"81bba-dcT/gzd6f+WlayC41+aZI+NNUr4\"",
    "mtime": "2025-06-24T17:23:21.619Z",
    "size": 531386,
    "path": "../public/memes/capitalism/the-left-would-rather-the-poor-were-poor.png"
  },
  "/memes/capitalism/the-problem-with-socialism-is.png": {
    "type": "image/png",
    "etag": "\"81f25-RzJ9EJ5wx5FyvR+ijDi/RIK3yZk\"",
    "mtime": "2025-06-24T17:23:21.618Z",
    "size": 532261,
    "path": "../public/memes/capitalism/the-problem-with-socialism-is.png"
  },
  "/memes/capitalism/the-problems-the-left-assigns-to-capital.png": {
    "type": "image/png",
    "etag": "\"639c1-7B7hIMh1gNMvtqOpAagIME9TGrM\"",
    "mtime": "2025-06-24T17:23:21.620Z",
    "size": 408001,
    "path": "../public/memes/capitalism/the-problems-the-left-assigns-to-capital.png"
  },
  "/memes/capitalism/the-socialist-dream-vs-reality.png": {
    "type": "image/png",
    "etag": "\"14be29-0C/0mxDAdvWbaK/jobzYlE3d3o8\"",
    "mtime": "2025-06-24T17:23:21.623Z",
    "size": 1359401,
    "path": "../public/memes/capitalism/the-socialist-dream-vs-reality.png"
  },
  "/memes/capitalism/the-state-more-laws-and-regulations-fire.png": {
    "type": "image/png",
    "etag": "\"e6bf2-fu0vk9O8H1sfngq6HaUr5Xgjrlo\"",
    "mtime": "2025-06-24T17:23:21.624Z",
    "size": 945138,
    "path": "../public/memes/capitalism/the-state-more-laws-and-regulations-fire.png"
  },
  "/memes/capitalism/trust-in-government-knowledge-of-history.png": {
    "type": "image/png",
    "etag": "\"1a439-YdMT+wsHiDnlhA6PfDqVy83FPgA\"",
    "mtime": "2025-06-24T17:23:21.620Z",
    "size": 107577,
    "path": "../public/memes/capitalism/trust-in-government-knowledge-of-history.png"
  },
  "/memes/capitalism/useful-idiots-hugo-chavez-socialism.png": {
    "type": "image/png",
    "etag": "\"1407be-tRJ2tIai8cdaawQZS+nAaWY2dRI\"",
    "mtime": "2025-06-24T17:23:21.625Z",
    "size": 1312702,
    "path": "../public/memes/capitalism/useful-idiots-hugo-chavez-socialism.png"
  },
  "/memes/capitalism/venezuela-before-after-socialism.png": {
    "type": "image/png",
    "etag": "\"11c1e4-+BrbCuInPb0E8WOQKPLd7ICLcbk\"",
    "mtime": "2025-06-24T17:23:21.632Z",
    "size": 1163748,
    "path": "../public/memes/capitalism/venezuela-before-after-socialism.png"
  },
  "/memes/capitalism/when-a-trades-with-b.png": {
    "type": "image/png",
    "etag": "\"47226-bwfXrzMqeT+D1BofjbE7raO6c48\"",
    "mtime": "2025-06-24T17:23:21.628Z",
    "size": 291366,
    "path": "../public/memes/capitalism/when-a-trades-with-b.png"
  },
  "/memes/capitalism/when-government-attempts-to-regulate-the.png": {
    "type": "image/png",
    "etag": "\"bb1fb-GskkbSUYkiHyBDqUg4sl7UK1yOs\"",
    "mtime": "2025-06-24T17:23:21.630Z",
    "size": 766459,
    "path": "../public/memes/capitalism/when-government-attempts-to-regulate-the.png"
  },
  "/memes/capitalism/without-ownership-there-is-no-exchange-m.png": {
    "type": "image/png",
    "etag": "\"17e88-nbXolv2hqstazJl6j12CsG/zQ+I\"",
    "mtime": "2025-06-24T17:23:21.632Z",
    "size": 97928,
    "path": "../public/memes/capitalism/without-ownership-there-is-no-exchange-m.png"
  },
  "/memes/capitalism/you-vs-government.png": {
    "type": "image/png",
    "etag": "\"63ab1-KaE69LgHYo3qrMGxrMqJtF+L4Ig\"",
    "mtime": "2025-06-24T17:23:21.630Z",
    "size": 408241,
    "path": "../public/memes/capitalism/you-vs-government.png"
  },
  "/memes/capitalism/your-government-at-work.png": {
    "type": "image/png",
    "etag": "\"118e45-ULgmPHF2nP8ny8syvDz8Yjq+tXQ\"",
    "mtime": "2025-06-24T17:23:21.633Z",
    "size": 1150533,
    "path": "../public/memes/capitalism/your-government-at-work.png"
  },
  "/memes/immigration/\"We simply cannot allow people to pour into the United States.png": {
    "type": "image/png",
    "etag": "\"69547-3BUAP+X+HJy2AHC1OCJSKvilEkc\"",
    "mtime": "2025-06-24T17:23:21.516Z",
    "size": 431431,
    "path": "../public/memes/immigration/\"We simply cannot allow people to pour into the United States.png"
  },
  "/memes/immigration/BUILD A BARRIER TO TRY TO PREVENT ILLEGAL IMMIGRANTS FROM COMING IN Hillary.png": {
    "type": "image/png",
    "etag": "\"775f9-R98yXXY3hQ3bZYrEBuvUgNeuB9c\"",
    "mtime": "2025-06-24T17:23:21.536Z",
    "size": 488953,
    "path": "../public/memes/immigration/BUILD A BARRIER TO TRY TO PREVENT ILLEGAL IMMIGRANTS FROM COMING IN Hillary.png"
  },
  "/memes/immigration/Clinton Americans... are rightly disturbed by the number of illegal aliens.png": {
    "type": "image/png",
    "etag": "\"e5deb-HCgJVMPMg0lJ3Xiu32qjwAYGZCc\"",
    "mtime": "2025-06-24T17:23:21.543Z",
    "size": 941547,
    "path": "../public/memes/immigration/Clinton Americans... are rightly disturbed by the number of illegal aliens.png"
  },
  "/memes/immigration/DEMOCRATIC PARTY VOTER REGISTRATION for illegals.png": {
    "type": "image/png",
    "etag": "\"51613-5reQFnWOCBPKHbXJnVUfHkG2Ioo\"",
    "mtime": "2025-06-24T17:23:21.536Z",
    "size": 333331,
    "path": "../public/memes/immigration/DEMOCRATIC PARTY VOTER REGISTRATION for illegals.png"
  },
  "/memes/immigration/Democratic Party looks illegal aliens American citizens upset.png": {
    "type": "image/png",
    "etag": "\"80827-TSl3KcFuDL5Es+cF3/EYBkzylgc\"",
    "mtime": "2025-06-24T17:23:21.541Z",
    "size": 526375,
    "path": "../public/memes/immigration/Democratic Party looks illegal aliens American citizens upset.png"
  },
  "/memes/immigration/Democrats immigration policy welcoming illegals.png": {
    "type": "image/png",
    "etag": "\"57a87-7Yn8J+cXyVvRaM9giiSQ5oTQlDY\"",
    "mtime": "2025-06-24T17:23:21.542Z",
    "size": 359047,
    "path": "../public/memes/immigration/Democrats immigration policy welcoming illegals.png"
  },
  "/memes/immigration/Democrats weren't always against building a wall and securing the border....png": {
    "type": "image/png",
    "etag": "\"686f5-EZ4IsxOnEYVOf40QhscC1VLtwPM\"",
    "mtime": "2025-06-24T17:23:21.541Z",
    "size": 427765,
    "path": "../public/memes/immigration/Democrats weren't always against building a wall and securing the border....png"
  },
  "/memes/immigration/Harry Reid Our borders have overflowed with illegal immigrants.png": {
    "type": "image/png",
    "etag": "\"41f5b-ZRsM6KR4o1I+rP6IYzwaZeOpG/w\"",
    "mtime": "2025-06-24T17:23:21.546Z",
    "size": 270171,
    "path": "../public/memes/immigration/Harry Reid Our borders have overflowed with illegal immigrants.png"
  },
  "/memes/immigration/I am, you know, adamantly against illegal immigration. Hillary.png": {
    "type": "image/png",
    "etag": "\"15be1-RXR9INpt4+I1Nf6oLioAQPRvN2c\"",
    "mtime": "2025-06-24T17:23:21.541Z",
    "size": 89057,
    "path": "../public/memes/immigration/I am, you know, adamantly against illegal immigration. Hillary.png"
  },
  "/memes/immigration/Schmucky imperative to enforce and strengthen existing immigration laws to prevent illegal immigrants.png": {
    "type": "image/png",
    "etag": "\"b2b5b-Oqu6uPl6S9v2ZttW9cRXqvZSH7w\"",
    "mtime": "2025-06-24T17:23:21.547Z",
    "size": 731995,
    "path": "../public/memes/immigration/Schmucky imperative to enforce and strengthen existing immigration laws to prevent illegal immigrants.png"
  },
  "/memes/immigration/We must say no to illegal immigration Clinton.png": {
    "type": "image/png",
    "etag": "\"1751c-4dlN9f4zh4WBfSag1jveCD57aos\"",
    "mtime": "2025-06-24T17:23:21.545Z",
    "size": 95516,
    "path": "../public/memes/immigration/We must say no to illegal immigration Clinton.png"
  },
  "/memes/margaret-thatcher/a-mans-right-to-work-as-he-will.png": {
    "type": "image/png",
    "etag": "\"98e32-AlK/4BOMtsrAmTqsg2IkrrgMQ7o\"",
    "mtime": "2025-06-24T17:23:21.519Z",
    "size": 626226,
    "path": "../public/memes/margaret-thatcher/a-mans-right-to-work-as-he-will.png"
  },
  "/memes/margaret-thatcher/being-powerful-is-like-being-a-lady-if-y.png": {
    "type": "image/png",
    "etag": "\"c9072-UbhDE25l6STC1f9oUHPot9GCtSE\"",
    "mtime": "2025-06-24T17:23:21.634Z",
    "size": 823410,
    "path": "../public/memes/margaret-thatcher/being-powerful-is-like-being-a-lady-if-y.png"
  },
  "/memes/margaret-thatcher/disciplining-yourself-to-do-what-you-kno.png": {
    "type": "image/png",
    "etag": "\"88a27-/O2qJB54ax96Z6uD1TgkYiRgQyc\"",
    "mtime": "2025-06-24T17:23:21.645Z",
    "size": 559655,
    "path": "../public/memes/margaret-thatcher/disciplining-yourself-to-do-what-you-kno.png"
  },
  "/memes/margaret-thatcher/europe-will-never-be-like-america-europe.png": {
    "type": "image/png",
    "etag": "\"55e03-ZvsvgYEE5ysLZ8tijdvWbupbRzc\"",
    "mtime": "2025-06-24T17:23:21.633Z",
    "size": 351747,
    "path": "../public/memes/margaret-thatcher/europe-will-never-be-like-america-europe.png"
  },
  "/memes/margaret-thatcher/free-enterprise-has-enabled-the-creative.png": {
    "type": "image/png",
    "etag": "\"9a7e2-1Y9gWrJ9fwNIpWgVDO+h1k3XNKo\"",
    "mtime": "2025-06-24T17:23:21.648Z",
    "size": 632802,
    "path": "../public/memes/margaret-thatcher/free-enterprise-has-enabled-the-creative.png"
  },
  "/memes/margaret-thatcher/global-warming-provides-a-marvelous-excu-1.png": {
    "type": "image/png",
    "etag": "\"3d3c7-0RqKO+YD/x1ePYz9pLVLRFmsgSs\"",
    "mtime": "2025-06-24T17:23:21.633Z",
    "size": 250823,
    "path": "../public/memes/margaret-thatcher/global-warming-provides-a-marvelous-excu-1.png"
  },
  "/memes/margaret-thatcher/global-warming-provides-a-marvelous-excu.png": {
    "type": "image/png",
    "etag": "\"15816c-M7cQtShZaRZhwgFvkTe+03YwhTg\"",
    "mtime": "2025-06-24T17:23:21.639Z",
    "size": 1409388,
    "path": "../public/memes/margaret-thatcher/global-warming-provides-a-marvelous-excu.png"
  },
  "/memes/margaret-thatcher/i-always-cheer-up-and-mentally-if-an-att.png": {
    "type": "image/png",
    "etag": "\"f8919-VWiwS9HMP0IN9tBe9OPxjIoprgQ\"",
    "mtime": "2025-06-24T17:23:21.639Z",
    "size": 1018137,
    "path": "../public/memes/margaret-thatcher/i-always-cheer-up-and-mentally-if-an-att.png"
  },
  "/memes/margaret-thatcher/if-they-attack-you-personally-it-means-t-1.png": {
    "type": "image/png",
    "etag": "\"b4ed7-qgdj3qtfYhpRnlwDv4ELFphtQoY\"",
    "mtime": "2025-06-24T17:23:21.638Z",
    "size": 741079,
    "path": "../public/memes/margaret-thatcher/if-they-attack-you-personally-it-means-t-1.png"
  },
  "/memes/margaret-thatcher/if-they-attack-you-personally-it-means-t.png": {
    "type": "image/png",
    "etag": "\"11472a-qrXTXS/xK3tRY3hjoDHgeSTAIck\"",
    "mtime": "2025-06-24T17:23:21.648Z",
    "size": 1132330,
    "path": "../public/memes/margaret-thatcher/if-they-attack-you-personally-it-means-t.png"
  },
  "/memes/margaret-thatcher/let-us-never-forget-this-fundamental-tru.png": {
    "type": "image/png",
    "etag": "\"b8522-PDgzXsJm1mxuLaZeGwALgwK0+zM\"",
    "mtime": "2025-06-24T17:23:21.638Z",
    "size": 754978,
    "path": "../public/memes/margaret-thatcher/let-us-never-forget-this-fundamental-tru.png"
  },
  "/memes/margaret-thatcher/margaret-thatcher-rich-poorer-if-poor-po.png": {
    "type": "image/png",
    "etag": "\"6e50b-pjRxV9SwUAMjpQnK9ndp9SXaQaY\"",
    "mtime": "2025-06-24T17:23:21.645Z",
    "size": 451851,
    "path": "../public/memes/margaret-thatcher/margaret-thatcher-rich-poorer-if-poor-po.png"
  },
  "/memes/margaret-thatcher/margaret-thatcher-stunning-and-brave.png": {
    "type": "image/png",
    "etag": "\"efe14-3nd9Ii384tO4NJTD6MKIobr+O/A\"",
    "mtime": "2025-06-24T17:23:21.645Z",
    "size": 982548,
    "path": "../public/memes/margaret-thatcher/margaret-thatcher-stunning-and-brave.png"
  },
  "/memes/margaret-thatcher/one-way-to-destroy-capitalism.png": {
    "type": "image/png",
    "etag": "\"bdf71-DCCrdyK55/2BfcLlhXfz3TNsB2I\"",
    "mtime": "2025-06-24T17:23:21.648Z",
    "size": 778097,
    "path": "../public/memes/margaret-thatcher/one-way-to-destroy-capitalism.png"
  },
  "/memes/margaret-thatcher/standing-in-the-middle-of-the-road-is-ve.png": {
    "type": "image/png",
    "etag": "\"5db34-MnFuQ0moVz55zAbY1j42yHjhFqA\"",
    "mtime": "2025-06-24T17:23:21.648Z",
    "size": 383796,
    "path": "../public/memes/margaret-thatcher/standing-in-the-middle-of-the-road-is-ve.png"
  },
  "/memes/margaret-thatcher/the-problem-with-socialism-is.png": {
    "type": "image/png",
    "etag": "\"81f43-CqcEVxab2fIU3z0pSyFwC2etJKQ\"",
    "mtime": "2025-06-24T17:23:21.657Z",
    "size": 532291,
    "path": "../public/memes/margaret-thatcher/the-problem-with-socialism-is.png"
  },
  "/memes/margaret-thatcher/the-problem-with-socialism.png": {
    "type": "image/png",
    "etag": "\"ada97-Z+oMHD4IceJDOP77SwQ04hFqo38\"",
    "mtime": "2025-06-24T17:23:21.651Z",
    "size": 711319,
    "path": "../public/memes/margaret-thatcher/the-problem-with-socialism.png"
  },
  "/memes/margaret-thatcher/the-socialist-myth-is-that-governments-c.png": {
    "type": "image/png",
    "etag": "\"87e9f-vBJgK9BAEtAcatdeF4wCviA8sbo\"",
    "mtime": "2025-06-24T17:23:21.655Z",
    "size": 556703,
    "path": "../public/memes/margaret-thatcher/the-socialist-myth-is-that-governments-c.png"
  },
  "/memes/margaret-thatcher/the-two-totalitarian-systems-which-we-in.png": {
    "type": "image/png",
    "etag": "\"b5a67-O2dsUJduNKhvci6m+noL189YBiU\"",
    "mtime": "2025-06-24T17:23:21.651Z",
    "size": 744039,
    "path": "../public/memes/margaret-thatcher/the-two-totalitarian-systems-which-we-in.png"
  },
  "/memes/margaret-thatcher/you-cant-make-people-good.png": {
    "type": "image/png",
    "etag": "\"1472c3-qq1dRwtRIKacdOjLsCeeFROFGU8\"",
    "mtime": "2025-06-24T17:23:21.653Z",
    "size": 1340099,
    "path": "../public/memes/margaret-thatcher/you-cant-make-people-good.png"
  },
  "/memes/media/cnn-npc-woke-dystopia.png": {
    "type": "image/png",
    "etag": "\"16609f-xKw0sgEsrUunNwPShDqMW/l0sMY\"",
    "mtime": "2025-06-24T17:23:21.517Z",
    "size": 1466527,
    "path": "../public/memes/media/cnn-npc-woke-dystopia.png"
  },
  "/memes/media/you-think-thats-news-youre-reading.png": {
    "type": "image/png",
    "etag": "\"f4b5d-qMe4QIphxJmIshDajQx7Z59NRTM\"",
    "mtime": "2025-06-24T17:23:21.547Z",
    "size": 1002333,
    "path": "../public/memes/media/you-think-thats-news-youre-reading.png"
  },
  "/memes/data/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"6804-Uu3iMmTwEuS3eAx9DcLUpZvBSQ0\"",
    "mtime": "2025-06-24T17:23:21.517Z",
    "size": 26628,
    "path": "../public/memes/data/.DS_Store"
  },
  "/memes/data/2018-corruption-perceptions-index.png": {
    "type": "image/png",
    "etag": "\"5b236-fUA6q5g71flOiG0B4P9tuVOXIuA\"",
    "mtime": "2025-06-24T17:23:21.655Z",
    "size": 373302,
    "path": "../public/memes/data/2018-corruption-perceptions-index.png"
  },
  "/memes/data/56-of-liberal-women-aged-18-29-have-been-diagnosed-with-a-mental-health-condition.png": {
    "type": "image/png",
    "etag": "\"91e16-GYJgvwJ6425CPtmEAZdsFReuHt4\"",
    "mtime": "2025-06-24T17:23:21.659Z",
    "size": 597526,
    "path": "../public/memes/data/56-of-liberal-women-aged-18-29-have-been-diagnosed-with-a-mental-health-condition.png"
  },
  "/memes/data/95-of-americans-who-mainstream-media-call-far-right.png": {
    "type": "image/png",
    "etag": "\"c848b-zttaCouhfL9DLkLtt6zRbm36lgI\"",
    "mtime": "2025-06-24T17:23:21.660Z",
    "size": 820363,
    "path": "../public/memes/data/95-of-americans-who-mainstream-media-call-far-right.png"
  },
  "/memes/data/actual-individual-consumption-per-head-in-2017-for-the-25-countries-with-populations-of-over-one-million.png": {
    "type": "image/png",
    "etag": "\"362bc-bVdakf9TkSHtKd6LoL84oaeUPDE\"",
    "mtime": "2025-06-24T17:23:21.660Z",
    "size": 221884,
    "path": "../public/memes/data/actual-individual-consumption-per-head-in-2017-for-the-25-countries-with-populations-of-over-one-million.png"
  },
  "/memes/data/americas-richest-poorest-states-vs-g7-countries.png": {
    "type": "image/png",
    "etag": "\"1563c8-YJAEQt/oUkkuT8Ht0iGk/8Ejdgs\"",
    "mtime": "2025-06-24T17:23:21.663Z",
    "size": 1401800,
    "path": "../public/memes/data/americas-richest-poorest-states-vs-g7-countries.png"
  },
  "/memes/data/average-annual-wage-usd-2025.png": {
    "type": "image/png",
    "etag": "\"5f43a-zrcxHLCaPasdVLMDANfmVU0Ic5U\"",
    "mtime": "2025-06-24T17:23:21.661Z",
    "size": 390202,
    "path": "../public/memes/data/average-annual-wage-usd-2025.png"
  },
  "/memes/data/average-consumption-per-person-in-oecd-nations-2010.png": {
    "type": "image/png",
    "etag": "\"71fee-YmVVpaOdujj6Ps3dHKkBEed2Wqs\"",
    "mtime": "2025-06-24T17:23:21.661Z",
    "size": 466926,
    "path": "../public/memes/data/average-consumption-per-person-in-oecd-nations-2010.png"
  },
  "/memes/data/better-life-index-2013.png": {
    "type": "image/png",
    "etag": "\"2e25d-ZbROXwR0S+m1MTZDWiQtrJc7yHM\"",
    "mtime": "2025-06-24T17:23:21.665Z",
    "size": 189021,
    "path": "../public/memes/data/better-life-index-2013.png"
  },
  "/memes/data/birth-of-liberalism-and-capitalism-period-end-of-human-slavery.png": {
    "type": "image/png",
    "etag": "\"2c3bb-f+hMVBMcWyCbBneORYmjSz8VkWk\"",
    "mtime": "2025-06-24T17:23:21.661Z",
    "size": 181179,
    "path": "../public/memes/data/birth-of-liberalism-and-capitalism-period-end-of-human-slavery.png"
  },
  "/memes/data/blacks-are-more-likely-than-other-groups-to-see-their-race-or-ethnicity-as-central-to-their-identity.png": {
    "type": "image/png",
    "etag": "\"12909-wJeDnCMdVdK1EtKmx3RE6v55Lcw\"",
    "mtime": "2025-06-24T17:23:21.665Z",
    "size": 76041,
    "path": "../public/memes/data/blacks-are-more-likely-than-other-groups-to-see-their-race-or-ethnicity-as-central-to-their-identity.png"
  },
  "/memes/data/capitalism-has-failed.png": {
    "type": "image/png",
    "etag": "\"44519-oOJ2wbr4v2PG4ex+kNxEYwTL36Y\"",
    "mtime": "2025-06-24T17:23:21.665Z",
    "size": 279833,
    "path": "../public/memes/data/capitalism-has-failed.png"
  },
  "/memes/data/chance-of-surviving-covid-19-by-age-and-sex-2020.png": {
    "type": "image/png",
    "etag": "\"4c85a-GcdkraE5/O6Ym02UFGuXd9fiGhk\"",
    "mtime": "2025-06-24T17:23:21.666Z",
    "size": 313434,
    "path": "../public/memes/data/chance-of-surviving-covid-19-by-age-and-sex-2020.png"
  },
  "/memes/data/christianity-in-the-us-by-county-distribution-of-catholicism-protestantism-and-mornonism-in-the-us.png": {
    "type": "image/png",
    "etag": "\"104058-zhUKp4GankezJZ30h2Iu4Yv7K7Q\"",
    "mtime": "2025-06-24T17:23:21.668Z",
    "size": 1065048,
    "path": "../public/memes/data/christianity-in-the-us-by-county-distribution-of-catholicism-protestantism-and-mornonism-in-the-us.png"
  },
  "/memes/data/claim-nazi-was-right-wing.png": {
    "type": "image/png",
    "etag": "\"7207b-gypjfKntnbZOsA5gNau8gvJl618\"",
    "mtime": "2025-06-24T17:23:21.665Z",
    "size": 467067,
    "path": "../public/memes/data/claim-nazi-was-right-wing.png"
  },
  "/memes/data/corporate-america-pledged-to-hire-more-people-of-color-it-actually-did.png": {
    "type": "image/png",
    "etag": "\"c5e7e-wddLN3OiKtECt2hxS9X0otYFM1w\"",
    "mtime": "2025-06-24T17:23:21.672Z",
    "size": 810622,
    "path": "../public/memes/data/corporate-america-pledged-to-hire-more-people-of-color-it-actually-did.png"
  },
  "/memes/data/countries-vs-us-metros-nearest-gdp-equivalent.png": {
    "type": "image/png",
    "etag": "\"80a3f-9h4HI1PNdZBd81VLIMtcHD+OX+Y\"",
    "mtime": "2025-06-24T17:23:21.669Z",
    "size": 526911,
    "path": "../public/memes/data/countries-vs-us-metros-nearest-gdp-equivalent.png"
  },
  "/memes/data/cps-population-and-per-capita-money-income-all-races-1967-2014.png": {
    "type": "image/png",
    "etag": "\"109745-SG3cfI6fK8qdA8aRrYnbr0dZZJ4\"",
    "mtime": "2025-06-24T17:23:21.674Z",
    "size": 1087301,
    "path": "../public/memes/data/cps-population-and-per-capita-money-income-all-races-1967-2014.png"
  },
  "/memes/data/death-rate-from-famines-by-decade-world.png": {
    "type": "image/png",
    "etag": "\"313fd-SUP+jbyjHNzNQ62+NG4dXjSEEJ8\"",
    "mtime": "2025-06-24T17:23:21.668Z",
    "size": 201725,
    "path": "../public/memes/data/death-rate-from-famines-by-decade-world.png"
  },
  "/memes/data/democratic-socialist-countries.png": {
    "type": "image/png",
    "etag": "\"493a5-txYUergoISW8+mX0/iLESe+i0gA\"",
    "mtime": "2025-06-24T17:23:21.673Z",
    "size": 299941,
    "path": "../public/memes/data/democratic-socialist-countries.png"
  },
  "/memes/data/democrats-have-shifted-sharply-leftwards-on-cultural-issues.png": {
    "type": "image/png",
    "etag": "\"608b6-pTlrUVUYfva8NJp43yneYoMZFXQ\"",
    "mtime": "2025-06-24T17:23:21.677Z",
    "size": 395446,
    "path": "../public/memes/data/democrats-have-shifted-sharply-leftwards-on-cultural-issues.png"
  },
  "/memes/data/distribution-of-us-national-income-pretax.png": {
    "type": "image/png",
    "etag": "\"24489-K2j2cz/Hgq2a5iBM4DMkbz5TvH0\"",
    "mtime": "2025-06-24T17:23:21.673Z",
    "size": 148617,
    "path": "../public/memes/data/distribution-of-us-national-income-pretax.png"
  },
  "/memes/data/doctoral-degrees-by-field-and-gender-2022.png": {
    "type": "image/png",
    "etag": "\"78692-EGDXmlIn0ZHkxheIZJS+msDL0BQ\"",
    "mtime": "2025-06-24T17:23:21.674Z",
    "size": 493202,
    "path": "../public/memes/data/doctoral-degrees-by-field-and-gender-2022.png"
  },
  "/memes/data/equality-vs-equity-vs-capitalism.png": {
    "type": "image/png",
    "etag": "\"d6500-XKMR/xgvK9pMJEtiSiu8f6y9um4\"",
    "mtime": "2025-06-24T17:23:21.676Z",
    "size": 877824,
    "path": "../public/memes/data/equality-vs-equity-vs-capitalism.png"
  },
  "/memes/data/european-per-capita-gdp-2015.png": {
    "type": "image/png",
    "etag": "\"db220-asHXWm5RgWnVyzwq16WiTefzBWg\"",
    "mtime": "2025-06-24T17:23:21.677Z",
    "size": 897568,
    "path": "../public/memes/data/european-per-capita-gdp-2015.png"
  },
  "/memes/data/europes-fertility-crisis-2022.png": {
    "type": "image/png",
    "etag": "\"ab475-wFAkQVbLnICK+BXZqd7n1sT0+qg\"",
    "mtime": "2025-06-24T17:23:21.681Z",
    "size": 701557,
    "path": "../public/memes/data/europes-fertility-crisis-2022.png"
  },
  "/memes/data/far-right-1.png": {
    "type": "image/png",
    "etag": "\"45830-ud7soiFSETX8ftkzybUr+Oe1mdI\"",
    "mtime": "2025-06-24T17:23:21.676Z",
    "size": 284720,
    "path": "../public/memes/data/far-right-1.png"
  },
  "/memes/data/far-right-vs-good-person-2.png": {
    "type": "image/png",
    "etag": "\"c57e0-islIgIAk5VNWY/khJLk2u3eCdsM\"",
    "mtime": "2025-06-24T17:23:21.681Z",
    "size": 808928,
    "path": "../public/memes/data/far-right-vs-good-person-2.png"
  },
  "/memes/data/far-right-vs-good-person.png": {
    "type": "image/png",
    "etag": "\"c5ab8-tO1x36DQfGz1a9urjpzpF0UBLEc\"",
    "mtime": "2025-06-24T17:23:21.682Z",
    "size": 809656,
    "path": "../public/memes/data/far-right-vs-good-person.png"
  },
  "/memes/data/far-right.png": {
    "type": "image/png",
    "etag": "\"799c2-Yw42Ct1oq9P7Sa1z/UvIo34p+R4\"",
    "mtime": "2025-06-24T17:23:21.682Z",
    "size": 498114,
    "path": "../public/memes/data/far-right.png"
  },
  "/memes/data/federal-spending-revenue-and-net-deficit-in-.png": {
    "type": "image/png",
    "etag": "\"2c92a-0KCOHws5g7pcz7OF55bvYdp9Q44\"",
    "mtime": "2025-06-24T17:23:21.682Z",
    "size": 182570,
    "path": "../public/memes/data/federal-spending-revenue-and-net-deficit-in-.png"
  },
  "/memes/data/fertility-rate-2024.png": {
    "type": "image/png",
    "etag": "\"5c153-GzpdBnLVQFlXFUXtBrEr46+hc4U\"",
    "mtime": "2025-06-24T17:23:21.685Z",
    "size": 377171,
    "path": "../public/memes/data/fertility-rate-2024.png"
  },
  "/memes/data/fertility-rate-collpase-2024.png": {
    "type": "image/png",
    "etag": "\"a823f-gwLl2HqYn7QKeBPa2+OtCubrMIw\"",
    "mtime": "2025-06-24T17:23:21.683Z",
    "size": 688703,
    "path": "../public/memes/data/fertility-rate-collpase-2024.png"
  },
  "/memes/data/fertility-rates-are-declining-everywhere-2023.png": {
    "type": "image/png",
    "etag": "\"a0531-B3XVyPHQy1y8QiUQcWh0NrLRJPk\"",
    "mtime": "2025-06-24T17:23:21.684Z",
    "size": 656689,
    "path": "../public/memes/data/fertility-rates-are-declining-everywhere-2023.png"
  },
  "/memes/data/frequency-of-words-denoting-prejudice-in-the-nyt-and-the-wapo.png": {
    "type": "image/png",
    "etag": "\"d3fb1-7uoDrMyNIptq6va0ay0jt4tVEB4\"",
    "mtime": "2025-06-24T17:23:21.690Z",
    "size": 868273,
    "path": "../public/memes/data/frequency-of-words-denoting-prejudice-in-the-nyt-and-the-wapo.png"
  },
  "/memes/data/gdp-per-capita-by-ancestry-2014.png": {
    "type": "image/png",
    "etag": "\"5f75f-GIP0XwKq7zALthHfOH1uCqUWckI\"",
    "mtime": "2025-06-24T17:23:21.689Z",
    "size": 391007,
    "path": "../public/memes/data/gdp-per-capita-by-ancestry-2014.png"
  },
  "/memes/data/gdp-per-capita-ppp-2017.png": {
    "type": "image/png",
    "etag": "\"70fa-Fq5jJg5lR+PG8yTODhWRiJ4kgA4\"",
    "mtime": "2025-06-24T17:23:21.685Z",
    "size": 28922,
    "path": "../public/memes/data/gdp-per-capita-ppp-2017.png"
  },
  "/memes/data/gdp-per-capita-since-1ad-2018.png": {
    "type": "image/png",
    "etag": "\"4a61a-C8+BhHJKEkVoMAVTGzC2LPJqxC8\"",
    "mtime": "2025-06-24T17:23:21.689Z",
    "size": 304666,
    "path": "../public/memes/data/gdp-per-capita-since-1ad-2018.png"
  },
  "/memes/data/gdp-per-person-1990-international-dollars.png": {
    "type": "image/png",
    "etag": "\"16d07-QumEKYgnuulglCuaMpVoPbYeILI\"",
    "mtime": "2025-06-24T17:23:21.690Z",
    "size": 93447,
    "path": "../public/memes/data/gdp-per-person-1990-international-dollars.png"
  },
  "/memes/data/gdp-ppp-international-dollars-2018-billions.png": {
    "type": "image/png",
    "etag": "\"bd217-hPMhRpwg4566lvWPoHRc52OO0n0\"",
    "mtime": "2025-06-24T17:23:21.692Z",
    "size": 774679,
    "path": "../public/memes/data/gdp-ppp-international-dollars-2018-billions.png"
  },
  "/memes/data/german-ancestory.png": {
    "type": "image/png",
    "etag": "\"dc2ac-YyNONqX2X0dV5dn1G3k4MlHWKio\"",
    "mtime": "2025-06-24T17:23:21.727Z",
    "size": 901804,
    "path": "../public/memes/data/german-ancestory.png"
  },
  "/memes/data/global-deaths-in-conflicts-since-the-year-1400---by-max-roser.png": {
    "type": "image/png",
    "etag": "\"6b6f6-VA2ayXYTgsFlHPOfAbeY7poQutw\"",
    "mtime": "2025-06-24T17:23:21.706Z",
    "size": 440054,
    "path": "../public/memes/data/global-deaths-in-conflicts-since-the-year-1400---by-max-roser.png"
  },
  "/memes/data/global-fertility-2021.png": {
    "type": "image/png",
    "etag": "\"70716-8h7Inhous6AIxLKbPfBt7DZNYHs\"",
    "mtime": "2025-06-24T17:23:21.702Z",
    "size": 460566,
    "path": "../public/memes/data/global-fertility-2021.png"
  },
  "/memes/data/global-impact-of-terrorism.png": {
    "type": "image/png",
    "etag": "\"640b6-pZCXwTLcc7sBUhIpvNlUx4h7bN8\"",
    "mtime": "2025-06-24T17:23:21.704Z",
    "size": 409782,
    "path": "../public/memes/data/global-impact-of-terrorism.png"
  },
  "/memes/data/global-poverty-rate.png": {
    "type": "image/png",
    "etag": "\"b278-XZgVIGx4DgrHtCrnUUXZ6/bgZDQ\"",
    "mtime": "2025-06-24T17:23:21.726Z",
    "size": 45688,
    "path": "../public/memes/data/global-poverty-rate.png"
  },
  "/memes/data/growth-in-administrative-staff-principals-teachers-and-students-in-public-schools.png": {
    "type": "image/png",
    "etag": "\"3c311-PX2wiWa2shM+0AphFXPa5i5ZvnM\"",
    "mtime": "2025-06-24T17:23:21.728Z",
    "size": 246545,
    "path": "../public/memes/data/growth-in-administrative-staff-principals-teachers-and-students-in-public-schools.png"
  },
  "/memes/data/growth-of-physicians-and-administrators-1970-2009.png": {
    "type": "image/png",
    "etag": "\"3a5bc-JOlZW1cVjCIbX1IsU9wvXTGRrbA\"",
    "mtime": "2025-06-24T17:23:21.726Z",
    "size": 239036,
    "path": "../public/memes/data/growth-of-physicians-and-administrators-1970-2009.png"
  },
  "/memes/data/growth-of-the-upper-middle-class.png": {
    "type": "image/png",
    "etag": "\"3ee77-D88sq9YfV3Rtkk1VkPiIPRrTCL0\"",
    "mtime": "2025-06-24T17:23:21.733Z",
    "size": 257655,
    "path": "../public/memes/data/growth-of-the-upper-middle-class.png"
  },
  "/memes/data/homicide-rate-per-100000-people-in-us-state-and-canadian-provinces.png": {
    "type": "image/png",
    "etag": "\"9cd5f-djkWCisOtOyGd540IajESqv0908\"",
    "mtime": "2025-06-24T17:23:21.732Z",
    "size": 642399,
    "path": "../public/memes/data/homicide-rate-per-100000-people-in-us-state-and-canadian-provinces.png"
  },
  "/memes/data/household-appliances-1973-2009-hours-of-work.png": {
    "type": "image/png",
    "etag": "\"3abfb-W4ak/UyxH3HwIYbHL5Qt/khbybc\"",
    "mtime": "2025-06-24T17:23:21.733Z",
    "size": 240635,
    "path": "../public/memes/data/household-appliances-1973-2009-hours-of-work.png"
  },
  "/memes/data/household-income-immigrant-by-country-per-capita-2016.png": {
    "type": "image/png",
    "etag": "\"635c1-l0XsQGqzYQAuw1nzMhsJSMk67qw\"",
    "mtime": "2025-06-24T17:23:21.737Z",
    "size": 406977,
    "path": "../public/memes/data/household-income-immigrant-by-country-per-capita-2016.png"
  },
  "/memes/data/how-socialists-think-socialism-works.png": {
    "type": "image/png",
    "etag": "\"34b0e-ohavuIUSCTkYXzBmSQHcGhleQn4\"",
    "mtime": "2025-06-24T17:23:21.740Z",
    "size": 215822,
    "path": "../public/memes/data/how-socialists-think-socialism-works.png"
  },
  "/memes/data/income-inequality-and-equality.png": {
    "type": "image/png",
    "etag": "\"49a68-mgemrqxN1w9phsFi4wTLh1T/0AA\"",
    "mtime": "2025-06-24T17:23:21.739Z",
    "size": 301672,
    "path": "../public/memes/data/income-inequality-and-equality.png"
  },
  "/memes/data/income-inequality-in-4-charts.png": {
    "type": "image/png",
    "etag": "\"38eec-R7dWLP/ypZ2dz5POYQCf45x9OkM\"",
    "mtime": "2025-06-24T17:23:21.738Z",
    "size": 233196,
    "path": "../public/memes/data/income-inequality-in-4-charts.png"
  },
  "/memes/data/individual-consumption-per-cap-ppp-2020-07-29.png": {
    "type": "image/png",
    "etag": "\"bb03f-41yoDAp5++n9aMd9DV5WQFLGkJc\"",
    "mtime": "2025-06-24T17:23:21.740Z",
    "size": 766015,
    "path": "../public/memes/data/individual-consumption-per-cap-ppp-2020-07-29.png"
  },
  "/memes/data/inflation-adjusted-consumption-per-person.png": {
    "type": "image/png",
    "etag": "\"53bc0-nXkt4YZMLXbdc2H2ChMQ8y7hL6s\"",
    "mtime": "2025-06-24T17:23:21.751Z",
    "size": 342976,
    "path": "../public/memes/data/inflation-adjusted-consumption-per-person.png"
  },
  "/memes/data/inflation-adjusted-cost-of-a-k-12-public-education.png": {
    "type": "image/png",
    "etag": "\"2c6d9-bPHwYGx+40DhQwBnfOrDhzl4cdg\"",
    "mtime": "2025-06-24T17:23:21.738Z",
    "size": 181977,
    "path": "../public/memes/data/inflation-adjusted-cost-of-a-k-12-public-education.png"
  },
  "/memes/data/interracial-violent-crime-incidents-2018-media.png": {
    "type": "image/png",
    "etag": "\"7dbf3-DhfGFM1LA51Ew+68oi0vx/hCMto\"",
    "mtime": "2025-06-24T17:23:21.749Z",
    "size": 515059,
    "path": "../public/memes/data/interracial-violent-crime-incidents-2018-media.png"
  },
  "/memes/data/invasion-of-the-drug-cartels.png": {
    "type": "image/png",
    "etag": "\"230462-5DUpVgLD94Gh7ykx9olWvAA2bzE\"",
    "mtime": "2025-06-24T17:23:21.757Z",
    "size": 2294882,
    "path": "../public/memes/data/invasion-of-the-drug-cartels.png"
  },
  "/memes/data/italy-by-municipality-annual-gdp-per-capita.png": {
    "type": "image/png",
    "etag": "\"dc45c-39N6eRDZ+AxyDIS2qL2pQ+JCvXw\"",
    "mtime": "2025-06-24T17:23:21.756Z",
    "size": 902236,
    "path": "../public/memes/data/italy-by-municipality-annual-gdp-per-capita.png"
  },
  "/memes/data/keynesian-economics.png": {
    "type": "image/png",
    "etag": "\"5b658-v7dwqlCEn3BugLEy6jlmCZGF3qA\"",
    "mtime": "2025-06-24T17:23:21.753Z",
    "size": 374360,
    "path": "../public/memes/data/keynesian-economics.png"
  },
  "/memes/data/median-earnings-for-full-time-year-round-female-workers.png": {
    "type": "image/png",
    "etag": "\"619c6-bnLhEKSs+lBRKs+vR+1afKNegRQ\"",
    "mtime": "2025-06-24T17:23:21.755Z",
    "size": 399814,
    "path": "../public/memes/data/median-earnings-for-full-time-year-round-female-workers.png"
  },
  "/memes/data/median-us-household-income-by-selected-ethnic-groups-2018.png": {
    "type": "image/png",
    "etag": "\"83b9a-NiJApOLaFDO4+jK/g9Xa6wlRd0w\"",
    "mtime": "2025-06-24T17:23:21.756Z",
    "size": 539546,
    "path": "../public/memes/data/median-us-household-income-by-selected-ethnic-groups-2018.png"
  },
  "/memes/data/mens-work-percentages.png": {
    "type": "image/png",
    "etag": "\"7b265-6L3WMMB2xRFGml1p2FQSW86wIcU\"",
    "mtime": "2025-06-24T17:23:21.757Z",
    "size": 504421,
    "path": "../public/memes/data/mens-work-percentages.png"
  },
  "/memes/data/most-common-self-identified-ancestry-of-the-united-states.png": {
    "type": "image/png",
    "etag": "\"95ff1-d8eTM7pcvMNDUTJA7ThxS3GhtEc\"",
    "mtime": "2025-06-24T17:23:21.762Z",
    "size": 614385,
    "path": "../public/memes/data/most-common-self-identified-ancestry-of-the-united-states.png"
  },
  "/memes/data/msm-news-word-frequency.png": {
    "type": "image/png",
    "etag": "\"bee96-rhQlXZLX2l4c0IQ7n7EZmrhWHCg\"",
    "mtime": "2025-06-24T17:23:21.769Z",
    "size": 781974,
    "path": "../public/memes/data/msm-news-word-frequency.png"
  },
  "/memes/data/muslim-conquest-battles-vs-crusades.png": {
    "type": "image/png",
    "etag": "\"109f1b-3G8VWF4q05GwJubfLOnAIxo6h/A\"",
    "mtime": "2025-06-24T17:23:21.765Z",
    "size": 1089307,
    "path": "../public/memes/data/muslim-conquest-battles-vs-crusades.png"
  },
  "/memes/data/muslims-in-the-eu-norway-and-switzerland-in-2050.png": {
    "type": "image/png",
    "etag": "\"f0e26-abb7FtyhuJLYGwQb+9gFJTy87PE\"",
    "mtime": "2025-06-24T17:23:21.775Z",
    "size": 986662,
    "path": "../public/memes/data/muslims-in-the-eu-norway-and-switzerland-in-2050.png"
  },
  "/memes/data/new-york-times-word-usage-frequency-1970-2018.png": {
    "type": "image/png",
    "etag": "\"ed2eb-nebDrflKBqL2LPomf3V6nP58RMo\"",
    "mtime": "2025-06-24T17:23:21.770Z",
    "size": 971499,
    "path": "../public/memes/data/new-york-times-word-usage-frequency-1970-2018.png"
  },
  "/memes/data/no-wage-gap-between-men-and-women.png": {
    "type": "image/png",
    "etag": "\"6a1cb-EtZrbZaWNODFHfwCN2FgWM2M/pY\"",
    "mtime": "2025-06-24T17:23:21.773Z",
    "size": 434635,
    "path": "../public/memes/data/no-wage-gap-between-men-and-women.png"
  },
  "/memes/data/north-america-agrilculture.png": {
    "type": "image/png",
    "etag": "\"18b67c-y54/jv0KRcQFpWrgC72Sb2lCXBs\"",
    "mtime": "2025-06-24T17:23:21.779Z",
    "size": 1619580,
    "path": "../public/memes/data/north-america-agrilculture.png"
  },
  "/memes/data/number-of-regulatory-restrictions.png": {
    "type": "image/png",
    "etag": "\"8abf-h6EZINjWWlUym1IMdMEB4dTC4CE\"",
    "mtime": "2025-06-24T17:23:21.771Z",
    "size": 35519,
    "path": "../public/memes/data/number-of-regulatory-restrictions.png"
  },
  "/memes/data/obama-economy-6-charts.png": {
    "type": "image/png",
    "etag": "\"9c7a0-mKjz/Z3kFvzP5lJwXZHjJb36nKs\"",
    "mtime": "2025-06-24T17:23:21.776Z",
    "size": 640928,
    "path": "../public/memes/data/obama-economy-6-charts.png"
  },
  "/memes/data/ourworldindatawars-long-run-military-civilian-fatalities-from-brecke10.png": {
    "type": "image/png",
    "etag": "\"79886-GgladT8vfB0/rvxx7dSaIo06+ng\"",
    "mtime": "2025-06-24T17:23:21.784Z",
    "size": 497798,
    "path": "../public/memes/data/ourworldindatawars-long-run-military-civilian-fatalities-from-brecke10.png"
  },
  "/memes/data/outlays-in-trillions-of-2015-dollars.png": {
    "type": "image/png",
    "etag": "\"26975-1gBQh+l8JXed1OQaz/Da5QYJ11M\"",
    "mtime": "2025-06-24T17:23:21.775Z",
    "size": 158069,
    "path": "../public/memes/data/outlays-in-trillions-of-2015-dollars.png"
  },
  "/memes/data/per-capita-average-individual-consumption.png": {
    "type": "image/png",
    "etag": "\"47a9b-C8ah0TKEYAxORzAjBRPzbl05vRg\"",
    "mtime": "2025-06-24T17:23:21.777Z",
    "size": 293531,
    "path": "../public/memes/data/per-capita-average-individual-consumption.png"
  },
  "/memes/data/percent-of-american-adults-who-reached-various-income.png": {
    "type": "image/png",
    "etag": "\"42dc2-T3q1OX9aS0pHFUyu9TNH848ye34\"",
    "mtime": "2025-06-24T17:23:21.782Z",
    "size": 273858,
    "path": "../public/memes/data/percent-of-american-adults-who-reached-various-income.png"
  },
  "/memes/data/percent-of-spending-including-discretionary-and-mandatory.png": {
    "type": "image/png",
    "etag": "\"46172-O72Xuqc1gcUDdB1cGi+R6yjmUtI\"",
    "mtime": "2025-06-24T17:23:21.783Z",
    "size": 287090,
    "path": "../public/memes/data/percent-of-spending-including-discretionary-and-mandatory.png"
  },
  "/memes/data/percent-shares-of-us-households-by-total-money-income-levels.png": {
    "type": "image/png",
    "etag": "\"54a27-Y35S9I5zpzmzYgMV6kax/ZV2W2c\"",
    "mtime": "2025-06-24T17:23:21.783Z",
    "size": 346663,
    "path": "../public/memes/data/percent-shares-of-us-households-by-total-money-income-levels.png"
  },
  "/memes/data/percentage-of-white-british-in-britain.png": {
    "type": "image/png",
    "etag": "\"cd2b5-cd/d6zW6LGrGUeoi1NclSaPqxs8\"",
    "mtime": "2025-06-24T17:23:21.787Z",
    "size": 840373,
    "path": "../public/memes/data/percentage-of-white-british-in-britain.png"
  },
  "/memes/data/percentage-of-years-americans-reach-top-10.png": {
    "type": "image/png",
    "etag": "\"69a6d-eg1isSzVquSXvKENlGG042OfkIk\"",
    "mtime": "2025-06-24T17:23:21.787Z",
    "size": 432749,
    "path": "../public/memes/data/percentage-of-years-americans-reach-top-10.png"
  },
  "/memes/data/presidential-vote-by-district-2024.png": {
    "type": "image/png",
    "etag": "\"d9b28-sidIEN9Zt2ITdCRtyJa7yjYuvMY\"",
    "mtime": "2025-06-24T17:23:21.790Z",
    "size": 891688,
    "path": "../public/memes/data/presidential-vote-by-district-2024.png"
  },
  "/memes/data/pure-alcohol-consumption-among-2010.png": {
    "type": "image/png",
    "etag": "\"51749-W96OHhgYlMvAgXGqg0d/cCfRkvI\"",
    "mtime": "2025-06-24T17:23:21.787Z",
    "size": 333641,
    "path": "../public/memes/data/pure-alcohol-consumption-among-2010.png"
  },
  "/memes/data/reagan-obama-recoveries.png": {
    "type": "image/png",
    "etag": "\"246f8-Sl23o/R2Ytgj8pz6DaGAU8Y39sQ\"",
    "mtime": "2025-06-24T17:23:21.792Z",
    "size": 149240,
    "path": "../public/memes/data/reagan-obama-recoveries.png"
  },
  "/memes/data/screenshot8921.png": {
    "type": "image/png",
    "etag": "\"20ce1-7AHqKCJO6UQWSmHMUGh1a/HlQTg\"",
    "mtime": "2025-06-24T17:23:21.792Z",
    "size": 134369,
    "path": "../public/memes/data/screenshot8921.png"
  },
  "/memes/data/share-of-federal-income-taxes-paid--top-1-vs-bottom-95-of-us-taxpayers-1980-2021.png": {
    "type": "image/png",
    "etag": "\"7b289-2PON5QSAfG9qeinHL+CxAY1rtEc\"",
    "mtime": "2025-06-24T17:23:21.794Z",
    "size": 504457,
    "path": "../public/memes/data/share-of-federal-income-taxes-paid--top-1-vs-bottom-95-of-us-taxpayers-1980-2021.png"
  },
  "/memes/data/share-of-world-population-living-in-extreme-poverty-1820-2015.png": {
    "type": "image/png",
    "etag": "\"359ba-QHQh8nl0lDmFVIrjO+2smDI7XWw\"",
    "mtime": "2025-06-24T17:23:21.792Z",
    "size": 219578,
    "path": "../public/memes/data/share-of-world-population-living-in-extreme-poverty-1820-2015.png"
  },
  "/memes/data/socialism-crony-capitalism-free-markets.png": {
    "type": "image/png",
    "etag": "\"585a7-mKCLbpfZ9E/K6aZEAGoGnlGoOR4\"",
    "mtime": "2025-06-24T17:23:21.799Z",
    "size": 361895,
    "path": "../public/memes/data/socialism-crony-capitalism-free-markets.png"
  },
  "/memes/data/spread-of-christianity.png": {
    "type": "image/png",
    "etag": "\"4ad9b-EG/JgMtuqHxny66YszY48P/izuk\"",
    "mtime": "2025-06-24T17:23:21.796Z",
    "size": 306587,
    "path": "../public/memes/data/spread-of-christianity.png"
  },
  "/memes/data/swimming-records--boys-15-18-world-junior-vs-womens-world.png": {
    "type": "image/png",
    "etag": "\"c3808-apzZfMwk1S1zUvpnboB3zVGwbs4\"",
    "mtime": "2025-06-24T17:23:21.800Z",
    "size": 800776,
    "path": "../public/memes/data/swimming-records--boys-15-18-world-junior-vs-womens-world.png"
  },
  "/memes/data/the-left-would-rather-the-poor-were-poorer-provided-the-rich-were-less-rich.png": {
    "type": "image/png",
    "etag": "\"91fdb-iNWDo4aWNSKWrmebj2kARNMQwvs\"",
    "mtime": "2025-06-24T17:23:21.799Z",
    "size": 597979,
    "path": "../public/memes/data/the-left-would-rather-the-poor-were-poorer-provided-the-rich-were-less-rich.png"
  },
  "/memes/data/the-middle-east-prior-to-arab-colonization.png": {
    "type": "image/png",
    "etag": "\"59be5-1oSqN9TbQ7CsS/r+6tc3uciqYas\"",
    "mtime": "2025-06-24T17:23:21.803Z",
    "size": 367589,
    "path": "../public/memes/data/the-middle-east-prior-to-arab-colonization.png"
  },
  "/memes/data/the-tax-burden-has-grown-more-progressive-over-time.png": {
    "type": "image/png",
    "etag": "\"178dd-UIsOG5CQ+bGcAArHAGrZdtc8xT8\"",
    "mtime": "2025-06-24T17:23:21.798Z",
    "size": 96477,
    "path": "../public/memes/data/the-tax-burden-has-grown-more-progressive-over-time.png"
  },
  "/memes/data/the-two-totalitarian-systems-which-we-in-britain-had-to-fight.png": {
    "type": "image/png",
    "etag": "\"1710f5-O3/7J1uKoCyO7NTV0AEP22tpBTc\"",
    "mtime": "2025-06-24T17:23:21.825Z",
    "size": 1511669,
    "path": "../public/memes/data/the-two-totalitarian-systems-which-we-in-britain-had-to-fight.png"
  },
  "/memes/data/the-us-middle-class-is-shrinking-because-americans-are-moving-up.png": {
    "type": "image/png",
    "etag": "\"3ea26-8ij/B9PWaNcCGUsQpHUw1Pfb5eY\"",
    "mtime": "2025-06-24T17:23:21.809Z",
    "size": 256550,
    "path": "../public/memes/data/the-us-middle-class-is-shrinking-because-americans-are-moving-up.png"
  },
  "/memes/data/the-waning-of-war.png": {
    "type": "image/png",
    "etag": "\"1c650-92B26ubZUjPS8vho9WI9nDjTJUY\"",
    "mtime": "2025-06-24T17:23:21.802Z",
    "size": 116304,
    "path": "../public/memes/data/the-waning-of-war.png"
  },
  "/memes/data/the-world-as-100-people-over-the-last-two-centuries.png": {
    "type": "image/png",
    "etag": "\"a21c3-+CmKAuaWnHA9SqB3JeSLXZPVK34\"",
    "mtime": "2025-06-24T17:23:21.813Z",
    "size": 664003,
    "path": "../public/memes/data/the-world-as-100-people-over-the-last-two-centuries.png"
  },
  "/memes/data/the-worlds-population-concentrated.png": {
    "type": "image/png",
    "etag": "\"3a151-ZlpBXgxOFg0fu0MXdJ33pLbnCbM\"",
    "mtime": "2025-06-24T17:23:21.813Z",
    "size": 237905,
    "path": "../public/memes/data/the-worlds-population-concentrated.png"
  },
  "/memes/data/thomas-sowell-discrimination-and-disparities.png": {
    "type": "image/png",
    "etag": "\"109c67-hD8OavbA8u7FVITPFpItreM2eEA\"",
    "mtime": "2025-06-24T17:23:21.824Z",
    "size": 1088615,
    "path": "../public/memes/data/thomas-sowell-discrimination-and-disparities.png"
  },
  "/memes/data/top-10-most-dangerous-us-occupations-and-percent-male-2021.png": {
    "type": "image/png",
    "etag": "\"9d176-WMFh6Pv1dh8anWSG0KPNJkB1Fnk\"",
    "mtime": "2025-06-24T17:23:21.824Z",
    "size": 643446,
    "path": "../public/memes/data/top-10-most-dangerous-us-occupations-and-percent-male-2021.png"
  },
  "/memes/data/top-20-most-dangerous-us-occupations-and-percent-male-2015.png": {
    "type": "image/png",
    "etag": "\"9be84-B9rYlDyD247cvsIkqopieeI57uQ\"",
    "mtime": "2025-06-24T17:23:21.829Z",
    "size": 638596,
    "path": "../public/memes/data/top-20-most-dangerous-us-occupations-and-percent-male-2015.png"
  },
  "/memes/data/top-20-us-metro-areas-by-economic-activity-renamed-for-countries-with-similar-gdps-2015.png": {
    "type": "image/png",
    "etag": "\"317aa-jYOJuA9Wo591GS0K1xWHH//zsSE\"",
    "mtime": "2025-06-24T17:23:21.821Z",
    "size": 202666,
    "path": "../public/memes/data/top-20-us-metro-areas-by-economic-activity-renamed-for-countries-with-similar-gdps-2015.png"
  },
  "/memes/data/top-20-us-metro-areas-by-gdp-2017-vs-countries.png": {
    "type": "image/png",
    "etag": "\"76954-t++UqL2qzMbaMrYxtgKdIcTXu2k\"",
    "mtime": "2025-06-24T17:23:21.828Z",
    "size": 485716,
    "path": "../public/memes/data/top-20-us-metro-areas-by-gdp-2017-vs-countries.png"
  },
  "/memes/data/top-20-us-metro-areas-by-gdp-per-capita-2023-vs-countries-1-million-pop.png": {
    "type": "image/png",
    "etag": "\"716e0-gT7nxuGAZmb0aJOwDooyIp7OlHA\"",
    "mtime": "2025-06-24T17:23:21.828Z",
    "size": 464608,
    "path": "../public/memes/data/top-20-us-metro-areas-by-gdp-per-capita-2023-vs-countries-1-million-pop.png"
  },
  "/memes/data/toppoliticaldonors.png": {
    "type": "image/png",
    "etag": "\"a49e9-11Za/YjBDJ52nHzoDLVniAIWtgs\"",
    "mtime": "2025-06-24T17:23:21.831Z",
    "size": 674281,
    "path": "../public/memes/data/toppoliticaldonors.png"
  },
  "/memes/data/total-means-tested-welfare-spending-and-official-poverty-rate-1947-2012.png": {
    "type": "image/png",
    "etag": "\"29744-PxbX2LH2S3UZzs4uGDe093+HxBE\"",
    "mtime": "2025-06-24T17:23:21.831Z",
    "size": 169796,
    "path": "../public/memes/data/total-means-tested-welfare-spending-and-official-poverty-rate-1947-2012.png"
  },
  "/memes/data/track-field-and-cross-country-records.png": {
    "type": "image/png",
    "etag": "\"7af57-5GlzCC+YqBcucwnlJWSiR6gBjiQ\"",
    "mtime": "2025-06-24T17:23:21.834Z",
    "size": 503639,
    "path": "../public/memes/data/track-field-and-cross-country-records.png"
  },
  "/memes/data/trends-in-inflation-adjusted-cost-of-a-complete-k-12-public-education--scale-and-achievement-of-17-year-olds.png": {
    "type": "image/png",
    "etag": "\"258b5-A8wdBk9hcjeTTz8PS7TNGBTd3no\"",
    "mtime": "2025-06-24T17:23:21.832Z",
    "size": 153781,
    "path": "../public/memes/data/trends-in-inflation-adjusted-cost-of-a-complete-k-12-public-education--scale-and-achievement-of-17-year-olds.png"
  },
  "/memes/data/un-total-fertility-rate-by-country-2023.png": {
    "type": "image/png",
    "etag": "\"608c3-XMudgTmBvT/s0xlM7T0U8SIHRrU\"",
    "mtime": "2025-06-24T17:23:21.834Z",
    "size": 395459,
    "path": "../public/memes/data/un-total-fertility-rate-by-country-2023.png"
  },
  "/memes/data/unemployment-labor-force-participation.png": {
    "type": "image/png",
    "etag": "\"323fd-BhZv9ugCLHEjGfUWJqo61RwPvls\"",
    "mtime": "2025-06-24T17:23:21.833Z",
    "size": 205821,
    "path": "../public/memes/data/unemployment-labor-force-participation.png"
  },
  "/memes/data/united-states-croplands-ports-and-rivers.png": {
    "type": "image/png",
    "etag": "\"143066-IYJOIjthpys+wLCQKdGj1aKZo9o\"",
    "mtime": "2025-06-24T17:23:21.839Z",
    "size": 1323110,
    "path": "../public/memes/data/united-states-croplands-ports-and-rivers.png"
  },
  "/memes/data/us-carbon-dioxide-emissions-per-capita-1973-to-2017.png": {
    "type": "image/png",
    "etag": "\"46ab4-GfVwK3Xoaap9HTkxEh6N0pB0thg\"",
    "mtime": "2025-06-24T17:23:21.836Z",
    "size": 289460,
    "path": "../public/memes/data/us-carbon-dioxide-emissions-per-capita-1973-to-2017.png"
  },
  "/memes/data/us-deaths-in-wars.png": {
    "type": "image/png",
    "etag": "\"13cdf-718SkWDd0sFTha3Nq7YGO8rlsEU\"",
    "mtime": "2025-06-24T17:23:21.837Z",
    "size": 81119,
    "path": "../public/memes/data/us-deaths-in-wars.png"
  },
  "/memes/data/us-households-according-to-income-2013.png": {
    "type": "image/png",
    "etag": "\"4428e-cIOkEZhtNO61ThGJCvXMIvFfOYY\"",
    "mtime": "2025-06-24T17:23:21.837Z",
    "size": 279182,
    "path": "../public/memes/data/us-households-according-to-income-2013.png"
  },
  "/memes/data/us-manufacturing-output-vs-world.png": {
    "type": "image/png",
    "etag": "\"1d5c2-TMJ9GaIOFKS4tMo3c6iQ3zH4B1Q\"",
    "mtime": "2025-06-24T17:23:21.842Z",
    "size": 120258,
    "path": "../public/memes/data/us-manufacturing-output-vs-world.png"
  },
  "/memes/data/us-political-spectrum.png": {
    "type": "image/png",
    "etag": "\"5f7f6-qrVh+P1xWJlVPB+CcHuM90FN0BM\"",
    "mtime": "2025-06-24T17:23:21.842Z",
    "size": 391158,
    "path": "../public/memes/data/us-political-spectrum.png"
  },
  "/memes/data/us-poverty-rate-20-trillion-spent.png": {
    "type": "image/png",
    "etag": "\"3add0-Dhmm3jFbuMZXu4NzTVGcDExJ31o\"",
    "mtime": "2025-06-24T17:23:21.842Z",
    "size": 241104,
    "path": "../public/memes/data/us-poverty-rate-20-trillion-spent.png"
  },
  "/memes/data/us-presidential-election-popular-vote-democrat-vs-republican-2012-2024.png": {
    "type": "image/png",
    "etag": "\"b3158-cZ/a2y6aLV/vAk4QviH9chwEwmk\"",
    "mtime": "2025-06-24T17:23:21.845Z",
    "size": 733528,
    "path": "../public/memes/data/us-presidential-election-popular-vote-democrat-vs-republican-2012-2024.png"
  },
  "/memes/data/us-states-renamed-for-countries-with-similar-gdps-2017.png": {
    "type": "image/png",
    "etag": "\"6ebc0-vW9g1GK6qaZdtLrHuvB9BUvTy8s\"",
    "mtime": "2025-06-24T17:23:21.850Z",
    "size": 453568,
    "path": "../public/memes/data/us-states-renamed-for-countries-with-similar-gdps-2017.png"
  },
  "/memes/data/us-states-vs-countries-2016.png": {
    "type": "image/png",
    "etag": "\"134051-0Qd/B5L+R0tiXraGvXkoaxRIVPY\"",
    "mtime": "2025-06-24T17:23:21.852Z",
    "size": 1261649,
    "path": "../public/memes/data/us-states-vs-countries-2016.png"
  },
  "/memes/data/us-states-vs-countries-gdp-per-capita-2024.png": {
    "type": "image/png",
    "etag": "\"a8ee4-+VsGUgPr9uWZPWiaFoSZWcG5Ylo\"",
    "mtime": "2025-06-24T17:23:21.849Z",
    "size": 691940,
    "path": "../public/memes/data/us-states-vs-countries-gdp-per-capita-2024.png"
  },
  "/memes/data/us-total-fertility-rate-tfr-over-time-1800-2023-total-fertility-rate-coollapse.png": {
    "type": "image/png",
    "etag": "\"26e87-Y0RHUcWCHp4sXpfZv+q3vPcriWc\"",
    "mtime": "2025-06-24T17:23:21.846Z",
    "size": 159367,
    "path": "../public/memes/data/us-total-fertility-rate-tfr-over-time-1800-2023-total-fertility-rate-coollapse.png"
  },
  "/memes/data/usa-german-ancestry-2012.png": {
    "type": "image/png",
    "etag": "\"f9f5c-8iDbdqvd5WuxUkXSEIaSYcZt8ko\"",
    "mtime": "2025-06-24T17:23:21.852Z",
    "size": 1023836,
    "path": "../public/memes/data/usa-german-ancestry-2012.png"
  },
  "/memes/data/usa-political-axis.png": {
    "type": "image/png",
    "etag": "\"411be-d6U6QuCqYIFcne6J9PM27sderQ8\"",
    "mtime": "2025-06-24T17:23:21.852Z",
    "size": 266686,
    "path": "../public/memes/data/usa-political-axis.png"
  },
  "/memes/data/when-slavery-was-abolished.png": {
    "type": "image/png",
    "etag": "\"6102f-5UCl7NC7FuvMrZAk+pHKTIr60P4\"",
    "mtime": "2025-06-24T17:23:21.852Z",
    "size": 397359,
    "path": "../public/memes/data/when-slavery-was-abolished.png"
  },
  "/memes/data/which-dictator-killed-the-most-people.png": {
    "type": "image/png",
    "etag": "\"b22f7-4dVMFZTar/jEgg5sXoRDNxCWJYc\"",
    "mtime": "2025-06-24T17:23:21.867Z",
    "size": 729847,
    "path": "../public/memes/data/which-dictator-killed-the-most-people.png"
  },
  "/memes/data/white-women-college-voter-opinion.png": {
    "type": "image/png",
    "etag": "\"6c4d7-RaxpURp84nsESFvgV1BoKKfgHzQ\"",
    "mtime": "2025-06-24T17:23:21.866Z",
    "size": 443607,
    "path": "../public/memes/data/white-women-college-voter-opinion.png"
  },
  "/memes/data/whos-paying-what-taxes.png": {
    "type": "image/png",
    "etag": "\"4f000-j2LcxcUu6B0W3Q9dSRnBZP9H+LY\"",
    "mtime": "2025-06-24T17:23:21.867Z",
    "size": 323584,
    "path": "../public/memes/data/whos-paying-what-taxes.png"
  },
  "/memes/data/world-corruption-homicide-why.png": {
    "type": "image/png",
    "etag": "\"9e00b-9laTAHuV0XOLY9xb7gIqYR0Au2M\"",
    "mtime": "2025-06-24T17:23:21.866Z",
    "size": 647179,
    "path": "../public/memes/data/world-corruption-homicide-why.png"
  },
  "/memes/data/world-gdp-over-the-last-two-millennia-where-the-left-thinks-it-all-went-wrong.png": {
    "type": "image/png",
    "etag": "\"43123-jEVd+lgldUwpAIflZv/pWLn2FMw\"",
    "mtime": "2025-06-24T17:23:21.868Z",
    "size": 274723,
    "path": "../public/memes/data/world-gdp-over-the-last-two-millennia-where-the-left-thinks-it-all-went-wrong.png"
  },
  "/memes/data/world-gdp-ppp-since-1820.png": {
    "type": "image/png",
    "etag": "\"f1d7-giGuMuRdrRHZWZrjS1tH+6lCJDw\"",
    "mtime": "2025-06-24T17:23:21.865Z",
    "size": 61911,
    "path": "../public/memes/data/world-gdp-ppp-since-1820.png"
  },
  "/memes/data/world-homicide-murder-rate.png": {
    "type": "image/png",
    "etag": "\"55c7a-kGyO84PwzxJaLiljWc7Onsm7AhQ\"",
    "mtime": "2025-06-24T17:23:21.869Z",
    "size": 351354,
    "path": "../public/memes/data/world-homicide-murder-rate.png"
  },
  "/memes/data/world-population-living-in-extreme-poverty-1820-2015.png": {
    "type": "image/png",
    "etag": "\"4877e-82NfSLy40ucAaF9qavcqkFVg88I\"",
    "mtime": "2025-06-24T17:23:21.880Z",
    "size": 296830,
    "path": "../public/memes/data/world-population-living-in-extreme-poverty-1820-2015.png"
  },
  "/memes/data/wrong-enemy-correct-enemy.png": {
    "type": "image/png",
    "etag": "\"24412-rXvyCyRCEv5bduIjrgjzNzjdf+I\"",
    "mtime": "2025-06-24T17:23:21.869Z",
    "size": 148498,
    "path": "../public/memes/data/wrong-enemy-correct-enemy.png"
  },
  "/memes/data/yearly-mentions-of-prejudice-in-popular-us-news-media-outlets.png": {
    "type": "image/png",
    "etag": "\"bc87d-5MC2B9b7HvYtQ6mueku5/TKiR8g\"",
    "mtime": "2025-06-24T17:23:21.870Z",
    "size": 772221,
    "path": "../public/memes/data/yearly-mentions-of-prejudice-in-popular-us-news-media-outlets.png"
  },
  "/memes/quotes/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"3804-ynvLNG+oIui6UjSQZOQMlRi+lNo\"",
    "mtime": "2025-06-24T17:23:21.519Z",
    "size": 14340,
    "path": "../public/memes/quotes/.DS_Store"
  },
  "/memes/quotes/a-government-which-lays-t.png": {
    "type": "image/png",
    "etag": "\"11f646-SrQcSLlPTiO6G9ANqvdFfVg3Nhs\"",
    "mtime": "2025-06-24T17:23:21.893Z",
    "size": 1177158,
    "path": "../public/memes/quotes/a-government-which-lays-t.png"
  },
  "/memes/quotes/a-man-who-knows-the-orig.png": {
    "type": "image/png",
    "etag": "\"14cc78-Ld7Ua5yIdv2LHYBcf59Y9Rf9Jg4\"",
    "mtime": "2025-06-24T17:23:21.885Z",
    "size": 1363064,
    "path": "../public/memes/quotes/a-man-who-knows-the-orig.png"
  },
  "/memes/quotes/at-the-core-of-liberalism.png": {
    "type": "image/png",
    "etag": "\"454c1-pkuiYAuON9CHg6frah+9Oqzhh6w\"",
    "mtime": "2025-06-24T17:23:21.872Z",
    "size": 283841,
    "path": "../public/memes/quotes/at-the-core-of-liberalism.png"
  },
  "/memes/quotes/beware-the-irrational,-ho.png": {
    "type": "image/png",
    "etag": "\"49ba7-bANsJ6blg/M/uyt+zxQm5YuakRA\"",
    "mtime": "2025-06-24T17:23:21.881Z",
    "size": 301991,
    "path": "../public/memes/quotes/beware-the-irrational,-ho.png"
  },
  "/memes/quotes/britain-gave-the-world.png": {
    "type": "image/png",
    "etag": "\"16680-eoP9Y2yYo8Lli073gRo7x4+inUg\"",
    "mtime": "2025-06-24T17:23:21.881Z",
    "size": 91776,
    "path": "../public/memes/quotes/britain-gave-the-world.png"
  },
  "/memes/quotes/can-a-people-tax-themselv.png": {
    "type": "image/png",
    "etag": "\"110bd-hyLMNbB9mqNjX//UzXZEdUua7bE\"",
    "mtime": "2025-06-24T17:23:21.881Z",
    "size": 69821,
    "path": "../public/memes/quotes/can-a-people-tax-themselv.png"
  },
  "/memes/quotes/do-not-be-so-open-minded,.png": {
    "type": "image/png",
    "etag": "\"a13f3-TfJPkbWXdbpdbpw7zsFz5+s3tds\"",
    "mtime": "2025-06-24T17:23:21.889Z",
    "size": 660467,
    "path": "../public/memes/quotes/do-not-be-so-open-minded,.png"
  },
  "/memes/quotes/elon-musk-did-not-make-x.png": {
    "type": "image/png",
    "etag": "\"43d52-fJZpLAc615PxGZ/A3PBzx0pYJ3k\"",
    "mtime": "2025-06-24T17:23:21.885Z",
    "size": 277842,
    "path": "../public/memes/quotes/elon-musk-did-not-make-x.png"
  },
  "/memes/quotes/every-generation,-civiliz.png": {
    "type": "image/png",
    "etag": "\"37f4a6-4AfBjYKUATbdY7nBksk0j6Tvc8s\"",
    "mtime": "2025-06-24T17:23:21.901Z",
    "size": 3667110,
    "path": "../public/memes/quotes/every-generation,-civiliz.png"
  },
  "/memes/quotes/government's-first-duty-i.png": {
    "type": "image/png",
    "etag": "\"9e436-6MxVRCyxYuCH589+7oe2fZswHuU\"",
    "mtime": "2025-06-24T17:23:21.892Z",
    "size": 648246,
    "path": "../public/memes/quotes/government's-first-duty-i.png"
  },
  "/memes/quotes/government's-view-of-the.png": {
    "type": "image/png",
    "etag": "\"9c1e2-JYudBOV3HkaXiapwfln43FpkcMw\"",
    "mtime": "2025-06-24T17:23:21.893Z",
    "size": 639458,
    "path": "../public/memes/quotes/government's-view-of-the.png"
  },
  "/memes/quotes/government-is-not-the-sol.png": {
    "type": "image/png",
    "etag": "\"4c8dd-Z2O2xz2kU6E6Uz5MncXc/vn1KYE\"",
    "mtime": "2025-06-24T17:23:21.897Z",
    "size": 313565,
    "path": "../public/memes/quotes/government-is-not-the-sol.png"
  },
  "/memes/quotes/have-you-ever-noticed-how.png": {
    "type": "image/png",
    "etag": "\"85ffb-3exsBpxg/SwRp5vwS7MrsT6V/eg\"",
    "mtime": "2025-06-24T17:23:21.898Z",
    "size": 548859,
    "path": "../public/memes/quotes/have-you-ever-noticed-how.png"
  },
  "/memes/quotes/hayek-to-act-on-the-belie.png": {
    "type": "image/png",
    "etag": "\"23317-G96yEw//YxbO802t6yZ1qafDUbg\"",
    "mtime": "2025-06-24T17:23:21.897Z",
    "size": 144151,
    "path": "../public/memes/quotes/hayek-to-act-on-the-belie.png"
  },
  "/memes/quotes/homicide-is-the-leading-c.png": {
    "type": "image/png",
    "etag": "\"15c47-H2p5FJXjr5/gzUB520uW/4AmNGc\"",
    "mtime": "2025-06-24T17:23:21.898Z",
    "size": 89159,
    "path": "../public/memes/quotes/homicide-is-the-leading-c.png"
  },
  "/memes/quotes/human-beings-are-born-wit.png": {
    "type": "image/png",
    "etag": "\"16cd32-svaOzkk/ihPQ21SbFW6qVDkwjQE\"",
    "mtime": "2025-06-24T17:23:21.909Z",
    "size": 1494322,
    "path": "../public/memes/quotes/human-beings-are-born-wit.png"
  },
  "/memes/quotes/humiliating-to-human-prid.png": {
    "type": "image/png",
    "etag": "\"2dcff-bjMYuxGUUMdyiCg6y2vYGTfuIq8\"",
    "mtime": "2025-06-24T17:23:21.928Z",
    "size": 187647,
    "path": "../public/memes/quotes/humiliating-to-human-prid.png"
  },
  "/memes/quotes/i-always-think-it's-a-sig.png": {
    "type": "image/png",
    "etag": "\"7bf00-Nwrq6aaq4dBU5F5aXcptTgbhROg\"",
    "mtime": "2025-06-24T17:23:21.906Z",
    "size": 507648,
    "path": "../public/memes/quotes/i-always-think-it's-a-sig.png"
  },
  "/memes/quotes/in-100-years-we-have-gone.png": {
    "type": "image/png",
    "etag": "\"312d1-Vs91uzY7BVRJSolJ5doZ0UcC+Aw\"",
    "mtime": "2025-06-24T17:23:21.906Z",
    "size": 201425,
    "path": "../public/memes/quotes/in-100-years-we-have-gone.png"
  },
  "/memes/quotes/intellectuals-are-natural.png": {
    "type": "image/png",
    "etag": "\"71e7b-KCcuSJsAOjaB2WwgDYvutAKP5DM\"",
    "mtime": "2025-06-24T17:23:21.906Z",
    "size": 466555,
    "path": "../public/memes/quotes/intellectuals-are-natural.png"
  },
  "/memes/quotes/islam's-borders-are-blood.png": {
    "type": "image/png",
    "etag": "\"4c5dd-DJPesBBVMpXnG1IUTN5pR+6DwU8\"",
    "mtime": "2025-06-24T17:23:21.909Z",
    "size": 312797,
    "path": "../public/memes/quotes/islam's-borders-are-blood.png"
  },
  "/memes/quotes/it-constantly-amazes-me-t.png": {
    "type": "image/png",
    "etag": "\"b6e35-S60M+86oK690WNRcdxvrKml/84w\"",
    "mtime": "2025-06-24T17:23:21.914Z",
    "size": 749109,
    "path": "../public/memes/quotes/it-constantly-amazes-me-t.png"
  },
  "/memes/quotes/it-didn't-start-with-gas.png": {
    "type": "image/png",
    "etag": "\"1702ad-602hmShvn0Tr9Cm6KgMSLFgUGKI\"",
    "mtime": "2025-06-24T17:23:21.941Z",
    "size": 1508013,
    "path": "../public/memes/quotes/it-didn't-start-with-gas.png"
  },
  "/memes/quotes/it-is-not-the-truth-of-ma.png": {
    "type": "image/png",
    "etag": "\"5b6e2-D9GILsoOqnP1JJR91wMSKYFWRMM\"",
    "mtime": "2025-06-24T17:23:21.928Z",
    "size": 374498,
    "path": "../public/memes/quotes/it-is-not-the-truth-of-ma.png"
  },
  "/memes/quotes/it-is-simply-no-longer-po.png": {
    "type": "image/png",
    "etag": "\"342a3-rUYjryQySKV0gmau2adugznIMAM\"",
    "mtime": "2025-06-24T17:23:21.934Z",
    "size": 213667,
    "path": "../public/memes/quotes/it-is-simply-no-longer-po.png"
  },
  "/memes/quotes/it-just-continues-to-be-o.png": {
    "type": "image/png",
    "etag": "\"3d795-bP5kfAy3oQALtvwaCbSqTn86CJQ\"",
    "mtime": "2025-06-24T17:23:21.939Z",
    "size": 251797,
    "path": "../public/memes/quotes/it-just-continues-to-be-o.png"
  },
  "/memes/quotes/liberals-desperately-need.png": {
    "type": "image/png",
    "etag": "\"2f416-h3TWF65Tw0iPWee9INQVRcHQpqU\"",
    "mtime": "2025-06-24T17:23:21.944Z",
    "size": 193558,
    "path": "../public/memes/quotes/liberals-desperately-need.png"
  },
  "/memes/quotes/live-a-good-life.-if-ther.png": {
    "type": "image/png",
    "etag": "\"d87f2-WoGcW5e5KF59W91Aqcrx9R773Tk\"",
    "mtime": "2025-06-24T17:23:21.941Z",
    "size": 886770,
    "path": "../public/memes/quotes/live-a-good-life.-if-ther.png"
  },
  "/memes/quotes/marxism-is-the-most-destr.png": {
    "type": "image/png",
    "etag": "\"4dd18-T2uDZa7F+rB0kIAiJ60SA2gDSuM\"",
    "mtime": "2025-06-24T17:23:21.940Z",
    "size": 318744,
    "path": "../public/memes/quotes/marxism-is-the-most-destr.png"
  },
  "/memes/quotes/not-to-have-a-correct-pol.png": {
    "type": "image/png",
    "etag": "\"56b4d-goA3wN6BDd1krFJ8OXuK6tPfYLo\"",
    "mtime": "2025-06-24T17:23:21.947Z",
    "size": 355149,
    "path": "../public/memes/quotes/not-to-have-a-correct-pol.png"
  },
  "/memes/quotes/now-i-get-it.-when-they-s.png": {
    "type": "image/png",
    "etag": "\"13b6e7-USehbSwrVbyBSwXfRTXSNb5hIvc\"",
    "mtime": "2025-06-24T17:23:21.951Z",
    "size": 1292007,
    "path": "../public/memes/quotes/now-i-get-it.-when-they-s.png"
  },
  "/memes/quotes/of-all-tyrannies,-a-tyran.png": {
    "type": "image/png",
    "etag": "\"39dc4-ghDnIeeMPwKzFjIl08inShQGyFg\"",
    "mtime": "2025-06-24T17:23:21.954Z",
    "size": 236996,
    "path": "../public/memes/quotes/of-all-tyrannies,-a-tyran.png"
  },
  "/memes/quotes/people-who-wonder-whether.png": {
    "type": "image/png",
    "etag": "\"4fa2b-JNl7IMBsvaGjaz9Jodk2KY08DB4\"",
    "mtime": "2025-06-24T17:23:21.953Z",
    "size": 326187,
    "path": "../public/memes/quotes/people-who-wonder-whether.png"
  },
  "/memes/quotes/political-correctness-is.png": {
    "type": "image/png",
    "etag": "\"5b297-G+Fe5d1QD8IezBU9dyDe3Ftd2+Q\"",
    "mtime": "2025-06-24T17:23:21.947Z",
    "size": 373399,
    "path": "../public/memes/quotes/political-correctness-is.png"
  },
  "/memes/quotes/prior-to-capitalism,-the.png": {
    "type": "image/png",
    "etag": "\"3efa0-OATKides2ilyLfkXjR+DmVPL6v4\"",
    "mtime": "2025-06-24T17:23:21.949Z",
    "size": 257952,
    "path": "../public/memes/quotes/prior-to-capitalism,-the.png"
  },
  "/memes/quotes/real-socialism-has-neve.png": {
    "type": "image/png",
    "etag": "\"80f3e-9Y+0cG33x98y/bQjAnCg2b+vdj8\"",
    "mtime": "2025-06-24T17:23:21.952Z",
    "size": 528190,
    "path": "../public/memes/quotes/real-socialism-has-neve.png"
  },
  "/memes/quotes/religion-is-regarded-by-t.png": {
    "type": "image/png",
    "etag": "\"269e4-yUKAFwTQ7zLk95jJdljIk/akFD0\"",
    "mtime": "2025-06-24T17:23:21.955Z",
    "size": 158180,
    "path": "../public/memes/quotes/religion-is-regarded-by-t.png"
  },
  "/memes/quotes/seneca-quote-religion.png": {
    "type": "image/png",
    "etag": "\"21470-2fV9X+SV84+88D/CGXGcwZ56fSc\"",
    "mtime": "2025-06-24T17:23:21.956Z",
    "size": 136304,
    "path": "../public/memes/quotes/seneca-quote-religion.png"
  },
  "/memes/quotes/socialism-irons-out-the-b.png": {
    "type": "image/png",
    "etag": "\"3a7bf-Rb1oobzFGygWiWj3tRkLHsuwdwg\"",
    "mtime": "2025-06-24T17:23:21.955Z",
    "size": 239551,
    "path": "../public/memes/quotes/socialism-irons-out-the-b.png"
  },
  "/memes/quotes/socialism-irons-out-the-boom-bust-cycle.png": {
    "type": "image/png",
    "etag": "\"3a758-777SlZVldGEj0609nrIqH5oTFiE\"",
    "mtime": "2025-06-24T17:23:21.955Z",
    "size": 239448,
    "path": "../public/memes/quotes/socialism-irons-out-the-boom-bust-cycle.png"
  },
  "/memes/quotes/socialism-will-triumph-fi.png": {
    "type": "image/png",
    "etag": "\"670bc-uK+B+t5rsWy+cIy26Oo6vIkLNLc\"",
    "mtime": "2025-06-24T17:23:21.960Z",
    "size": 422076,
    "path": "../public/memes/quotes/socialism-will-triumph-fi.png"
  },
  "/memes/quotes/some-ideas-are-so-stupid.png": {
    "type": "image/png",
    "etag": "\"62c7e-TlEfXQO5N8NkZnzJy9MJgW63Org\"",
    "mtime": "2025-06-24T17:23:21.959Z",
    "size": 404606,
    "path": "../public/memes/quotes/some-ideas-are-so-stupid.png"
  },
  "/memes/quotes/step-1-prepare-the-enviro.png": {
    "type": "image/png",
    "etag": "\"556ff-NbR98CtYfzjdTZb51ixFpvANfZE\"",
    "mtime": "2025-06-24T17:23:21.961Z",
    "size": 349951,
    "path": "../public/memes/quotes/step-1-prepare-the-enviro.png"
  },
  "/memes/quotes/supreme-court-on-free-speech.png": {
    "type": "image/png",
    "etag": "\"21617-2zpL12jkvYeyCWg69TJtO/e1nHI\"",
    "mtime": "2025-06-24T17:23:21.957Z",
    "size": 136727,
    "path": "../public/memes/quotes/supreme-court-on-free-speech.png"
  },
  "/memes/quotes/that-men-do-not-learn-ver.png": {
    "type": "image/png",
    "etag": "\"5b375-89QuUIFrQ1PpX1gkAzwawBd0nMg\"",
    "mtime": "2025-06-24T17:23:21.963Z",
    "size": 373621,
    "path": "../public/memes/quotes/that-men-do-not-learn-ver.png"
  },
  "/memes/quotes/the-advantage-of-a-free-m.png": {
    "type": "image/png",
    "etag": "\"83016-m20+R55vdlXxqvzv3iBTj/VE3tA\"",
    "mtime": "2025-06-24T17:23:21.969Z",
    "size": 536598,
    "path": "../public/memes/quotes/the-advantage-of-a-free-m.png"
  },
  "/memes/quotes/the-appeal-of-political-c.png": {
    "type": "image/png",
    "etag": "\"33c2d-qfkXewY9vjzWjTbzDyfsWSVwOww\"",
    "mtime": "2025-06-24T17:23:21.962Z",
    "size": 212013,
    "path": "../public/memes/quotes/the-appeal-of-political-c.png"
  },
  "/memes/quotes/the-basic-tool-for-the-ma.png": {
    "type": "image/png",
    "etag": "\"39514-L6qS9YPG3/IMjE91KuTuF2aVX/A\"",
    "mtime": "2025-06-24T17:23:21.964Z",
    "size": 234772,
    "path": "../public/memes/quotes/the-basic-tool-for-the-ma.png"
  },
  "/memes/quotes/the-black-family-survived.png": {
    "type": "image/png",
    "etag": "\"2cf74-eaHG6hHJNbUknCAb5b+W/I82CIo\"",
    "mtime": "2025-06-24T17:23:21.959Z",
    "size": 184180,
    "path": "../public/memes/quotes/the-black-family-survived.png"
  },
  "/memes/quotes/the-cosmos-is-full-beyon.png": {
    "type": "image/png",
    "etag": "\"a8c0a-DTibA8aUomUTDCPhUgWfpH5OMhU\"",
    "mtime": "2025-06-24T17:23:21.968Z",
    "size": 691210,
    "path": "../public/memes/quotes/the-cosmos-is-full-beyon.png"
  },
  "/memes/quotes/the-curious-task-of-econoa.png": {
    "type": "image/png",
    "etag": "\"5633d-N0u+aZ8VpXBVlYRkGDBnPk6YcYg\"",
    "mtime": "2025-06-24T17:23:21.968Z",
    "size": 353085,
    "path": "../public/memes/quotes/the-curious-task-of-econoa.png"
  },
  "/memes/quotes/the-curious-task-of-econob.png": {
    "type": "image/png",
    "etag": "\"9b4e0-/Lb/47bVmCXJSKqqweUoikJEzlk\"",
    "mtime": "2025-06-24T17:23:21.968Z",
    "size": 636128,
    "path": "../public/memes/quotes/the-curious-task-of-econob.png"
  },
  "/memes/quotes/the-democrat-party-has-de.png": {
    "type": "image/png",
    "etag": "\"91fee-PPxEoyIYIWQm/+AK0HhrGT9jJS4\"",
    "mtime": "2025-06-24T17:23:21.971Z",
    "size": 597998,
    "path": "../public/memes/quotes/the-democrat-party-has-de.png"
  },
  "/memes/quotes/the-fatal-conceit--the-er.png": {
    "type": "image/png",
    "etag": "\"241d1-cvVtVfAsfybgQa3ARtnoxQifspM\"",
    "mtime": "2025-06-24T17:23:21.974Z",
    "size": 147921,
    "path": "../public/memes/quotes/the-fatal-conceit--the-er.png"
  },
  "/memes/quotes/the-greatest-enemy-of-the.png": {
    "type": "image/png",
    "etag": "\"c97df-gUdQ4irF1d6LxR2sQHEDCMk2Ea8\"",
    "mtime": "2025-06-24T17:23:21.973Z",
    "size": 825311,
    "path": "../public/memes/quotes/the-greatest-enemy-of-the.png"
  },
  "/memes/quotes/the-limits-of-tyrants-are.png": {
    "type": "image/png",
    "etag": "\"538aa-MOtcJrFRibskPU2vXsrFoKF1GRk\"",
    "mtime": "2025-06-24T17:23:21.972Z",
    "size": 342186,
    "path": "../public/memes/quotes/the-limits-of-tyrants-are.png"
  },
  "/memes/quotes/the-middle-east-bernard_l.png": {
    "type": "image/png",
    "etag": "\"21f5d-dcT5TXpB1eh0VDgMwp2qFjVA0dc\"",
    "mtime": "2025-06-24T17:23:21.969Z",
    "size": 139101,
    "path": "../public/memes/quotes/the-middle-east-bernard_l.png"
  },
  "/memes/quotes/the-people-will-believe-w.png": {
    "type": "image/png",
    "etag": "\"89c6a-SsbwnBgrisomDhKWwCK0GK/FX5M\"",
    "mtime": "2025-06-24T17:23:21.972Z",
    "size": 564330,
    "path": "../public/memes/quotes/the-people-will-believe-w.png"
  },
  "/memes/quotes/the-purpose-of-propaganda.png": {
    "type": "image/png",
    "etag": "\"3670d-WTXCiXnPT1li69NQPbI0TN98knc\"",
    "mtime": "2025-06-24T17:23:21.972Z",
    "size": 222989,
    "path": "../public/memes/quotes/the-purpose-of-propaganda.png"
  },
  "/memes/quotes/the-reason-you-don't-know.png": {
    "type": "image/png",
    "etag": "\"6c7ae-EJMrmvdJYUXhauYbOaDIzv/BoLQ\"",
    "mtime": "2025-06-24T17:23:21.981Z",
    "size": 444334,
    "path": "../public/memes/quotes/the-reason-you-don't-know.png"
  },
  "/memes/quotes/the-trouble-with-our-libe.png": {
    "type": "image/png",
    "etag": "\"18e90e-rGFqfN5WVMr3yfNp6iVz+pc7sE4\"",
    "mtime": "2025-06-24T17:23:21.984Z",
    "size": 1632526,
    "path": "../public/memes/quotes/the-trouble-with-our-libe.png"
  },
  "/memes/quotes/there's-a-word-for-people.png": {
    "type": "image/png",
    "etag": "\"dea51-Wus+wMHweJB7HAVggwzNkC9w2/I\"",
    "mtime": "2025-06-24T17:23:21.982Z",
    "size": 911953,
    "path": "../public/memes/quotes/there's-a-word-for-people.png"
  },
  "/memes/quotes/there's-simply-no-polite.png": {
    "type": "image/png",
    "etag": "\"7c200-hcXO4qpIQW5RSpCVl8km4m3tjGM\"",
    "mtime": "2025-06-24T17:23:21.978Z",
    "size": 508416,
    "path": "../public/memes/quotes/there's-simply-no-polite.png"
  },
  "/memes/quotes/there-is-all-the-differen.png": {
    "type": "image/png",
    "etag": "\"1c7c2-ZnlK4jWOmJMvTUMYMtsB5UpTqok\"",
    "mtime": "2025-06-24T17:23:21.983Z",
    "size": 116674,
    "path": "../public/memes/quotes/there-is-all-the-differen.png"
  },
  "/memes/quotes/there-is-no-swifter-route.png": {
    "type": "image/png",
    "etag": "\"4d55f-Rc+cZ63+BRMZcVEZB5N90+6AY0M\"",
    "mtime": "2025-06-24T17:23:21.982Z",
    "size": 316767,
    "path": "../public/memes/quotes/there-is-no-swifter-route.png"
  },
  "/memes/quotes/we-didn't-love-freedom-en.png": {
    "type": "image/png",
    "etag": "\"26664-EzwtXGM6fC7bEN2AaYPG5WYrhcY\"",
    "mtime": "2025-06-24T17:23:21.986Z",
    "size": 157284,
    "path": "../public/memes/quotes/we-didn't-love-freedom-en.png"
  },
  "/memes/quotes/we-in-america-have-learne.png": {
    "type": "image/png",
    "etag": "\"6c77a-4R5ujP471Tww1BLwm1P8Z2hAY28\"",
    "mtime": "2025-06-24T17:23:21.987Z",
    "size": 444282,
    "path": "../public/memes/quotes/we-in-america-have-learne.png"
  },
  "/memes/quotes/we-know-they-are-lying-t.png": {
    "type": "image/png",
    "etag": "\"27c0e-uazf+8Y5jkcl5O/p9XLg+miokGU\"",
    "mtime": "2025-06-24T17:23:21.987Z",
    "size": 162830,
    "path": "../public/memes/quotes/we-know-they-are-lying-t.png"
  },
  "/memes/quotes/we-must-reject-the-idea-t.png": {
    "type": "image/png",
    "etag": "\"c7b72-DNobh8Iqd1e2+kt1hdISTB9qmSc\"",
    "mtime": "2025-06-24T17:23:21.989Z",
    "size": 818034,
    "path": "../public/memes/quotes/we-must-reject-the-idea-t.png"
  },
  "/memes/quotes/when-young-people-want-to.png": {
    "type": "image/png",
    "etag": "\"c455f-Ex/a/Rwc2NVuBk6vgyG6ngspfrc\"",
    "mtime": "2025-06-24T17:23:21.991Z",
    "size": 804191,
    "path": "../public/memes/quotes/when-young-people-want-to.png"
  },
  "/memes/quotes/white-liberals-are-the-mo.png": {
    "type": "image/png",
    "etag": "\"2d769-lw+lFi+UAcU2+MzoaZ9C8WRVAtU\"",
    "mtime": "2025-06-24T17:23:21.997Z",
    "size": 186217,
    "path": "../public/memes/quotes/white-liberals-are-the-mo.png"
  },
  "/memes/quotes/young-people-are-told-at.png": {
    "type": "image/png",
    "etag": "\"a5859-bDX70Kriud+KOL0GNdcXvW6kOLE\"",
    "mtime": "2025-06-24T17:23:21.992Z",
    "size": 677977,
    "path": "../public/memes/quotes/young-people-are-told-at.png"
  },
  "/memes/politics/13th-14th-15th-amendments-gop-v-dems.png": {
    "type": "image/png",
    "etag": "\"104b4e-1N+ucARI+2nA8zXvagXppPmO/d8\"",
    "mtime": "2025-06-24T17:23:21.523Z",
    "size": 1067854,
    "path": "../public/memes/politics/13th-14th-15th-amendments-gop-v-dems.png"
  },
  "/memes/politics/13th-amendment-14th-amendment-15th-amend.png": {
    "type": "image/png",
    "etag": "\"163696-2vSEgVU7ulTO2XWsUEKaLRPww00\"",
    "mtime": "2025-06-24T17:23:21.993Z",
    "size": 1455766,
    "path": "../public/memes/politics/13th-amendment-14th-amendment-15th-amend.png"
  },
  "/memes/politics/25-of-liberals-are-on-medication-for-men.png": {
    "type": "image/png",
    "etag": "\"7d98b-9Aw/r0NTzSCl9MDDUG5nzH+Fa0M\"",
    "mtime": "2025-06-24T17:23:21.997Z",
    "size": 514443,
    "path": "../public/memes/politics/25-of-liberals-are-on-medication-for-men.png"
  },
  "/memes/politics/a-person-who-wins-an-argument-with-a-lib.png": {
    "type": "image/png",
    "etag": "\"7c292-XR4yrkLbCDlNBac7DKkoozV197M\"",
    "mtime": "2025-06-24T17:23:21.992Z",
    "size": 508562,
    "path": "../public/memes/politics/a-person-who-wins-an-argument-with-a-lib.png"
  },
  "/memes/politics/aoc-i-wish-you-privileged-white-people-w.png": {
    "type": "image/png",
    "etag": "\"d1a32-sKW5V20/VgJn4H5bZQ12HofK+II\"",
    "mtime": "2025-06-24T17:23:22.002Z",
    "size": 858674,
    "path": "../public/memes/politics/aoc-i-wish-you-privileged-white-people-w.png"
  },
  "/memes/politics/awake-yet-1960s-oil-gone-in-10-years.png": {
    "type": "image/png",
    "etag": "\"bc49a-eAPOI7K55whGJld6aQdbbO/pOTo\"",
    "mtime": "2025-06-24T17:23:22.002Z",
    "size": 771226,
    "path": "../public/memes/politics/awake-yet-1960s-oil-gone-in-10-years.png"
  },
  "/memes/politics/basic-political-spectrum.png": {
    "type": "image/png",
    "etag": "\"60a9d-Lhl++YoZwq9Asywxy1pK1z6Xb8c\"",
    "mtime": "2025-06-24T17:23:22.000Z",
    "size": 395933,
    "path": "../public/memes/politics/basic-political-spectrum.png"
  },
  "/memes/politics/be-aware-transwomen-are-men-transmen-are.png": {
    "type": "image/png",
    "etag": "\"da95c-fkjSs+63LLo6pA4U6a8OrcAzULw\"",
    "mtime": "2025-06-24T17:23:22.002Z",
    "size": 895324,
    "path": "../public/memes/politics/be-aware-transwomen-are-men-transmen-are.png"
  },
  "/memes/politics/birth-of-liberalism-and-capitalism-perio.png": {
    "type": "image/png",
    "etag": "\"36dce-Y38Pji5gvSHTQtCK+ZuundCAUl8\"",
    "mtime": "2025-06-24T17:23:22.007Z",
    "size": 224718,
    "path": "../public/memes/politics/birth-of-liberalism-and-capitalism-perio.png"
  },
  "/memes/politics/brutally-oppressing-other-tribes-and-occ.png": {
    "type": "image/png",
    "etag": "\"a3faf-Rd1iYd7JfO2JYqW5vIc/xNyOpQY\"",
    "mtime": "2025-06-24T17:23:22.008Z",
    "size": 671663,
    "path": "../public/memes/politics/brutally-oppressing-other-tribes-and-occ.png"
  },
  "/memes/politics/but-you-claim-the-government-was-almost.png": {
    "type": "image/png",
    "etag": "\"fc183-37ckkIrRFhjzxtcgo3HErLNdhIQ\"",
    "mtime": "2025-06-24T17:23:22.003Z",
    "size": 1032579,
    "path": "../public/memes/politics/but-you-claim-the-government-was-almost.png"
  },
  "/memes/politics/catturd-the-democrat-party-has-destroyed.png": {
    "type": "image/png",
    "etag": "\"b8a0d-oiGAoan+KfM/cSchhhFhE+K6+V4\"",
    "mtime": "2025-06-24T17:23:22.019Z",
    "size": 756237,
    "path": "../public/memes/politics/catturd-the-democrat-party-has-destroyed.png"
  },
  "/memes/politics/college-indoctrination-of-children.png": {
    "type": "image/png",
    "etag": "\"124d6a-PBhXTepAYxRVOV66FVpbS+tgzqA\"",
    "mtime": "2025-06-24T17:23:22.011Z",
    "size": 1199466,
    "path": "../public/memes/politics/college-indoctrination-of-children.png"
  },
  "/memes/politics/creen-is-the-new-red.png": {
    "type": "image/png",
    "etag": "\"b0b6e-+ocRsIRoXmbmZewCYhz1XxCFFMM\"",
    "mtime": "2025-06-24T17:23:22.020Z",
    "size": 723822,
    "path": "../public/memes/politics/creen-is-the-new-red.png"
  },
  "/memes/politics/dei-blm-crt-esg-maoism.png": {
    "type": "image/png",
    "etag": "\"a3990-Fgf2kIWW3LstP0n/CC11B9JfbVc\"",
    "mtime": "2025-06-24T17:23:22.014Z",
    "size": 670096,
    "path": "../public/memes/politics/dei-blm-crt-esg-maoism.png"
  },
  "/memes/politics/democrat-party-cribbing-from-communists.png": {
    "type": "image/png",
    "etag": "\"bc6be-hdfY8XfJoWPVB6KYIPmHOOQ9QzQ\"",
    "mtime": "2025-06-24T17:23:22.011Z",
    "size": 771774,
    "path": "../public/memes/politics/democrat-party-cribbing-from-communists.png"
  },
  "/memes/politics/democrat-voters-democrat-politicians.png": {
    "type": "image/png",
    "etag": "\"16690a-csZMN2Eqd9Hif/u2TLnKo20d7sg\"",
    "mtime": "2025-06-24T17:23:22.015Z",
    "size": 1468682,
    "path": "../public/memes/politics/democrat-voters-democrat-politicians.png"
  },
  "/memes/politics/democrats-are-fuming-that-trump-deported.png": {
    "type": "image/png",
    "etag": "\"64296-ZjK9OC+WqK7XMR6v0FgGsRA8e/I\"",
    "mtime": "2025-06-24T17:23:22.026Z",
    "size": 410262,
    "path": "../public/memes/politics/democrats-are-fuming-that-trump-deported.png"
  },
  "/memes/politics/democrats-fixing-the-economy.png": {
    "type": "image/png",
    "etag": "\"15acf9-OwChFDTdRmWRLAkRqbc+zvPETes\"",
    "mtime": "2025-06-24T17:23:22.020Z",
    "size": 1420537,
    "path": "../public/memes/politics/democrats-fixing-the-economy.png"
  },
  "/memes/politics/democrats-racism.png": {
    "type": "image/png",
    "etag": "\"a8b69-+pW8aNfWbaj2WifbwdHu3rJSz/0\"",
    "mtime": "2025-06-24T17:23:22.025Z",
    "size": 691049,
    "path": "../public/memes/politics/democrats-racism.png"
  },
  "/memes/politics/democrats-usaid-pig-trough.png": {
    "type": "image/png",
    "etag": "\"e30d4-DRNxrAgLOFRPTkXGjUJWD6Ag+HY\"",
    "mtime": "2025-06-24T17:23:22.020Z",
    "size": 930004,
    "path": "../public/memes/politics/democrats-usaid-pig-trough.png"
  },
  "/memes/politics/democrats-when-you-say-anything-negative.png": {
    "type": "image/png",
    "etag": "\"dd2e2-6TAXBM7LRMaerE0HsMNxb9QiBOg\"",
    "mtime": "2025-06-24T17:23:22.027Z",
    "size": 905954,
    "path": "../public/memes/politics/democrats-when-you-say-anything-negative.png"
  },
  "/memes/politics/dems-we-must-stop-elon-musk-from-exposin.png": {
    "type": "image/png",
    "etag": "\"133509-B32ssN42SNXNn+Aa+UDcvQt9FAM\"",
    "mtime": "2025-06-24T17:23:22.029Z",
    "size": 1258761,
    "path": "../public/memes/politics/dems-we-must-stop-elon-musk-from-exposin.png"
  },
  "/memes/politics/doge-reorg-3.png": {
    "type": "image/png",
    "etag": "\"158645-+GwZBamgeTTS7c3n76KqE0Bt3MM\"",
    "mtime": "2025-06-24T17:23:22.031Z",
    "size": 1410629,
    "path": "../public/memes/politics/doge-reorg-3.png"
  },
  "/memes/politics/donkey-pox-the-disease-destroying.png": {
    "type": "image/png",
    "etag": "\"c1159-LVyeH2UMk26acpJdP4FLfFHGuKo\"",
    "mtime": "2025-06-24T17:23:22.027Z",
    "size": 790873,
    "path": "../public/memes/politics/donkey-pox-the-disease-destroying.png"
  },
  "/memes/politics/dr-king-i-thank-you-for-your-endorsement.png": {
    "type": "image/png",
    "etag": "\"ae0b7-1cHzND/rS+u0aCEEPB4hdMs70iI\"",
    "mtime": "2025-06-24T17:23:22.036Z",
    "size": 712887,
    "path": "../public/memes/politics/dr-king-i-thank-you-for-your-endorsement.png"
  },
  "/memes/politics/elaboratelivelyalbertosaurus-sizerestri.png": {
    "type": "image/png",
    "etag": "\"7ea4f-/7q0w7s5FtrCBVDEsPIwVF848bE\"",
    "mtime": "2025-06-24T17:23:22.039Z",
    "size": 518735,
    "path": "../public/memes/politics/elaboratelivelyalbertosaurus-sizerestri.png"
  },
  "/memes/politics/elizabeth-warrens-dog-1-1024th-wolf.png": {
    "type": "image/png",
    "etag": "\"118e00-bsNoJz7LRvbrxPLpHBbNw1Npin8\"",
    "mtime": "2025-06-24T17:23:22.038Z",
    "size": 1150464,
    "path": "../public/memes/politics/elizabeth-warrens-dog-1-1024th-wolf.png"
  },
  "/memes/politics/external-contentduckduckgo.png": {
    "type": "image/png",
    "etag": "\"ca0f3-fcU3bYjRJC1Y+ufNqry2OM7VbkQ\"",
    "mtime": "2025-06-24T17:23:22.037Z",
    "size": 827635,
    "path": "../public/memes/politics/external-contentduckduckgo.png"
  },
  "/memes/politics/fascism-mirror-democrats.png": {
    "type": "image/png",
    "etag": "\"e523d-i07lFx1eAIvZ+8R8Jz2pwLrBpWw\"",
    "mtime": "2025-06-24T17:23:22.041Z",
    "size": 938557,
    "path": "../public/memes/politics/fascism-mirror-democrats.png"
  },
  "/memes/politics/fiery-but-mostly-peaceful-protests-after.png": {
    "type": "image/png",
    "etag": "\"727f6-QKJQr0t1Z+R0NtQLFFbv4ZmMUrk\"",
    "mtime": "2025-06-24T17:23:22.038Z",
    "size": 468982,
    "path": "../public/memes/politics/fiery-but-mostly-peaceful-protests-after.png"
  },
  "/memes/politics/first-we-overlook-evil-then-we-permit-ev.png": {
    "type": "image/png",
    "etag": "\"d4aed-BsjaQLmsAz5Ss1hfKqPNL+EnvfU\"",
    "mtime": "2025-06-24T17:23:22.047Z",
    "size": 871149,
    "path": "../public/memes/politics/first-we-overlook-evil-then-we-permit-ev.png"
  },
  "/memes/politics/four-out-of-five-citizens-love-democracy.png": {
    "type": "image/png",
    "etag": "\"ca79f-Bwwcd4x+rhBwH0jTREn5AuNBEss\"",
    "mtime": "2025-06-24T17:23:22.060Z",
    "size": 829343,
    "path": "../public/memes/politics/four-out-of-five-citizens-love-democracy.png"
  },
  "/memes/politics/from-now-on-money-laundering-will-be-cag.png": {
    "type": "image/png",
    "etag": "\"eaab1-NctOGGJvm5vkDChbwSdLLZaUeT8\"",
    "mtime": "2025-06-24T17:23:22.049Z",
    "size": 961201,
    "path": "../public/memes/politics/from-now-on-money-laundering-will-be-cag.png"
  },
  "/memes/politics/garbage-for-your-body-msm-garbage-for-yo.png": {
    "type": "image/png",
    "etag": "\"1129f9-4mV3XkaFoLVC7lQvTtyWrWNbHd4\"",
    "mtime": "2025-06-24T17:23:22.049Z",
    "size": 1124857,
    "path": "../public/memes/politics/garbage-for-your-body-msm-garbage-for-yo.png"
  },
  "/memes/politics/gavin-newsom-joker.png": {
    "type": "image/png",
    "etag": "\"b9e8e-8m3gGrw4ji1vP3ol9tqchN1ZQIE\"",
    "mtime": "2025-06-24T17:23:22.054Z",
    "size": 761486,
    "path": "../public/memes/politics/gavin-newsom-joker.png"
  },
  "/memes/politics/gavin-newsom-reptile.png": {
    "type": "image/png",
    "etag": "\"adca0-EjEtELBwPCUaYhsVInhDFgpq810\"",
    "mtime": "2025-06-24T17:23:22.060Z",
    "size": 711840,
    "path": "../public/memes/politics/gavin-newsom-reptile.png"
  },
  "/memes/politics/give-a-democrat-a-fish-and-hell-eat-for.png": {
    "type": "image/png",
    "etag": "\"cb9cf-uh+z7wODHivXD4ySeGVLQiUxN84\"",
    "mtime": "2025-06-24T17:23:22.049Z",
    "size": 833999,
    "path": "../public/memes/politics/give-a-democrat-a-fish-and-hell-eat-for.png"
  },
  "/memes/politics/government-is-not-the-solution-to-our-pr.png": {
    "type": "image/png",
    "etag": "\"be15e-1Cdl2TvusXzXdDCV4q5XrHDTnxc\"",
    "mtime": "2025-06-24T17:23:22.060Z",
    "size": 778590,
    "path": "../public/memes/politics/government-is-not-the-solution-to-our-pr.png"
  },
  "/memes/politics/greta-pay-300-more-for-your-electricity.png": {
    "type": "image/png",
    "etag": "\"101e90-RLOTUFKSkITEB3HBVSoOaXTc2h8\"",
    "mtime": "2025-06-24T17:23:22.072Z",
    "size": 1056400,
    "path": "../public/memes/politics/greta-pay-300-more-for-your-electricity.png"
  },
  "/memes/politics/how-real-racism-works-white-liberals.png": {
    "type": "image/png",
    "etag": "\"1382ec-bGpd5ceqVF6F5ap7/tQ9RZl3gmo\"",
    "mtime": "2025-06-24T17:23:22.063Z",
    "size": 1278700,
    "path": "../public/memes/politics/how-real-racism-works-white-liberals.png"
  },
  "/memes/politics/how-to-hide-a-gun-from-socialists-basic.png": {
    "type": "image/png",
    "etag": "\"d71dc-rTdpU1WfViejrnl4f7jKote+t5I\"",
    "mtime": "2025-06-24T17:23:22.064Z",
    "size": 881116,
    "path": "../public/memes/politics/how-to-hide-a-gun-from-socialists-basic.png"
  },
  "/memes/politics/how-white-leftists-see-themselves.png": {
    "type": "image/png",
    "etag": "\"1427ae-Xz1vhx3qxfNo1JVFeq6RxIebQDw\"",
    "mtime": "2025-06-24T17:23:22.064Z",
    "size": 1320878,
    "path": "../public/memes/politics/how-white-leftists-see-themselves.png"
  },
  "/memes/politics/i-award-you-no-points.png": {
    "type": "image/png",
    "etag": "\"b736b-Fg33bJ76f6hTv8abY/Ry/T9+Zh0\"",
    "mtime": "2025-06-24T17:23:22.064Z",
    "size": 750443,
    "path": "../public/memes/politics/i-award-you-no-points.png"
  },
  "/memes/politics/i-havent-seen-the-left-this-mad-since-ye.png": {
    "type": "image/png",
    "etag": "\"c1b66-0ySG6XQJw3z7QPwaqTLQr0mGWtc\"",
    "mtime": "2025-06-24T17:23:22.074Z",
    "size": 793446,
    "path": "../public/memes/politics/i-havent-seen-the-left-this-mad-since-ye.png"
  },
  "/memes/politics/i-pity-you-americans-us-defense-funding.png": {
    "type": "image/png",
    "etag": "\"b361f-45qjs8dSjwtYOldxTnJP3HoYL8o\"",
    "mtime": "2025-06-24T17:23:22.085Z",
    "size": 734751,
    "path": "../public/memes/politics/i-pity-you-americans-us-defense-funding.png"
  },
  "/memes/politics/i-refuse-to-be-lectured-about-racism-by.png": {
    "type": "image/png",
    "etag": "\"bb3e1-haDjMyAeGP6uPiIHMYwt0plha4A\"",
    "mtime": "2025-06-24T17:23:22.074Z",
    "size": 766945,
    "path": "../public/memes/politics/i-refuse-to-be-lectured-about-racism-by.png"
  },
  "/memes/politics/idolizing-a-politician-is-like-believing.png": {
    "type": "image/png",
    "etag": "\"71406-/dXD7moc36nvuN9euennuw8cuQc\"",
    "mtime": "2025-06-24T17:23:22.085Z",
    "size": 463878,
    "path": "../public/memes/politics/idolizing-a-politician-is-like-believing.png"
  },
  "/memes/politics/if-stopping-child-trafficking-is-far-rig.png": {
    "type": "image/png",
    "etag": "\"d0901-ZpR8NuaRBN7bBDriX5Xgsfg9S2c\"",
    "mtime": "2025-06-24T17:23:22.074Z",
    "size": 854273,
    "path": "../public/memes/politics/if-stopping-child-trafficking-is-far-rig.png"
  },
  "/memes/politics/if-we-divide-123-genders-by-white-suprem.png": {
    "type": "image/png",
    "etag": "\"b2121-YS63933oBgnXE16opoIJb+fUPG8\"",
    "mtime": "2025-06-24T17:23:22.077Z",
    "size": 729377,
    "path": "../public/memes/politics/if-we-divide-123-genders-by-white-suprem.png"
  },
  "/memes/politics/if-you-believe-that-a-man-who-went-71-ye.png": {
    "type": "image/png",
    "etag": "\"1ec92-m0Y6yIDa4R4h2em1pw5Us92zOL0\"",
    "mtime": "2025-06-24T17:23:22.082Z",
    "size": 126098,
    "path": "../public/memes/politics/if-you-believe-that-a-man-who-went-71-ye.png"
  },
  "/memes/politics/im-not-a-racist-you-will-be.png": {
    "type": "image/png",
    "etag": "\"d5adf-G30cPIRQjVgFNp1nYhusZVO7lsM\"",
    "mtime": "2025-06-24T17:23:22.086Z",
    "size": 875231,
    "path": "../public/memes/politics/im-not-a-racist-you-will-be.png"
  },
  "/memes/politics/imagine-how-much-propaganda-it-took-to-c.png": {
    "type": "image/png",
    "etag": "\"44050-NzpdFEKpWj3Rf+zzdgMmydWguF8\"",
    "mtime": "2025-06-24T17:23:22.085Z",
    "size": 278608,
    "path": "../public/memes/politics/imagine-how-much-propaganda-it-took-to-c.png"
  },
  "/memes/politics/in-this-house-we-believe-the-news-is-pro.png": {
    "type": "image/png",
    "etag": "\"1a4710-eLEHHYEst4C1rF8QfbgAOtBY7IA\"",
    "mtime": "2025-06-24T17:23:22.088Z",
    "size": 1722128,
    "path": "../public/memes/politics/in-this-house-we-believe-the-news-is-pro.png"
  },
  "/memes/politics/israel-v-hamas.png": {
    "type": "image/png",
    "etag": "\"426a6-LDnI6r6ssfsNfguhRe5XXIhoKRI\"",
    "mtime": "2025-06-24T17:23:22.093Z",
    "size": 272038,
    "path": "../public/memes/politics/israel-v-hamas.png"
  },
  "/memes/politics/its-just-as-easy-to-buy-a-scientist-as-i.png": {
    "type": "image/png",
    "etag": "\"9fe28-5NU+bBFAjDcy/5wwyfRCRC35d+Y\"",
    "mtime": "2025-06-24T17:23:22.088Z",
    "size": 654888,
    "path": "../public/memes/politics/its-just-as-easy-to-buy-a-scientist-as-i.png"
  },
  "/memes/politics/jaketapperimknownuzzing-1.png": {
    "type": "image/png",
    "etag": "\"d89aa-b0PtjvARYeci2aJNSNdZS9xDa10\"",
    "mtime": "2025-06-24T17:23:22.088Z",
    "size": 887210,
    "path": "../public/memes/politics/jaketapperimknownuzzing-1.png"
  },
  "/memes/politics/la-fiery-but-mostly-burning.png": {
    "type": "image/png",
    "etag": "\"d4051-LzKWg/kjhIoouhN/bE6CXYRBIXs\"",
    "mtime": "2025-06-24T17:23:22.099Z",
    "size": 868433,
    "path": "../public/memes/politics/la-fiery-but-mostly-burning.png"
  },
  "/memes/politics/land-of-liars-elizabeth-fauxcahontas.png": {
    "type": "image/png",
    "etag": "\"e5922-8hREcu4njf3pv4H+DV5Jm3ZEF4w\"",
    "mtime": "2025-06-24T17:23:22.088Z",
    "size": 940322,
    "path": "../public/memes/politics/land-of-liars-elizabeth-fauxcahontas.png"
  },
  "/memes/politics/left-v-far-right.png": {
    "type": "image/png",
    "etag": "\"1deef-eAQk4Tb2ArL1QRF2ZmZE18K1kpc\"",
    "mtime": "2025-06-24T17:23:22.093Z",
    "size": 122607,
    "path": "../public/memes/politics/left-v-far-right.png"
  },
  "/memes/politics/leftism-success.png": {
    "type": "image/png",
    "etag": "\"ad651-eQqlr0Ku4isQ2FPH8hjPrkJFBD8\"",
    "mtime": "2025-06-24T17:23:22.098Z",
    "size": 710225,
    "path": "../public/memes/politics/leftism-success.png"
  },
  "/memes/politics/leftist-if-you-dont-agree-with-me-that-m.png": {
    "type": "image/png",
    "etag": "\"dc2ad-hqNAVETupMpKRbubVWuQxqUKnYU\"",
    "mtime": "2025-06-24T17:23:22.094Z",
    "size": 901805,
    "path": "../public/memes/politics/leftist-if-you-dont-agree-with-me-that-m.png"
  },
  "/memes/politics/leftists-say-be-careful-what-we-say-now.png": {
    "type": "image/png",
    "etag": "\"71b8b-xfL8B24VoWDixLuV3W/+pLszG+I\"",
    "mtime": "2025-06-24T17:23:22.094Z",
    "size": 465803,
    "path": "../public/memes/politics/leftists-say-be-careful-what-we-say-now.png"
  },
  "/memes/politics/lets-see-if-ive-got-this-right.png": {
    "type": "image/png",
    "etag": "\"b5b56-JbL7pbY1Emm/bpaPa9bMAFV32eA\"",
    "mtime": "2025-06-24T17:23:22.112Z",
    "size": 744278,
    "path": "../public/memes/politics/lets-see-if-ive-got-this-right.png"
  },
  "/memes/politics/liberals-became-hyper-left-wing.png": {
    "type": "image/png",
    "etag": "\"249c5-Rc11g2uddnxvXis3PAOaK0kkbig\"",
    "mtime": "2025-06-24T17:23:22.095Z",
    "size": 149957,
    "path": "../public/memes/politics/liberals-became-hyper-left-wing.png"
  },
  "/memes/politics/maoist-left.png": {
    "type": "image/png",
    "etag": "\"5f739-xeUy+KZ+OZSzPIGA5z6LNhGKJLo\"",
    "mtime": "2025-06-24T17:23:22.098Z",
    "size": 390969,
    "path": "../public/memes/politics/maoist-left.png"
  },
  "/memes/politics/marxist-black-lives-matter.png": {
    "type": "image/png",
    "etag": "\"f16d3-MOlR/aP2OudLGdemxuU6J9PzLjM\"",
    "mtime": "2025-06-24T17:23:22.099Z",
    "size": 988883,
    "path": "../public/memes/politics/marxist-black-lives-matter.png"
  },
  "/memes/politics/media-racism-democrats.png": {
    "type": "image/png",
    "etag": "\"895b7-uev++lE84NSsZpd84D48cFIfjKo\"",
    "mtime": "2025-06-24T17:23:22.106Z",
    "size": 562615,
    "path": "../public/memes/politics/media-racism-democrats.png"
  },
  "/memes/politics/mediabiasmodified-1.png": {
    "type": "image/png",
    "etag": "\"ac651-J/wX1+/u4T/dRrMR8WHpnhHFLD8\"",
    "mtime": "2025-06-24T17:23:22.106Z",
    "size": 706129,
    "path": "../public/memes/politics/mediabiasmodified-1.png"
  },
  "/memes/politics/nazis-and-communists-and-antifa-the-same.png": {
    "type": "image/png",
    "etag": "\"74068-Zqj9zuxokwCxoLgfHB0iH1s1iIU\"",
    "mtime": "2025-06-24T17:23:22.106Z",
    "size": 475240,
    "path": "../public/memes/politics/nazis-and-communists-and-antifa-the-same.png"
  },
  "/memes/politics/nazis-were-left-wing.png": {
    "type": "image/png",
    "etag": "\"81c2d-gwsaNpNEr7sjah1+tPGNjweafMk\"",
    "mtime": "2025-06-24T17:23:22.106Z",
    "size": 531501,
    "path": "../public/memes/politics/nazis-were-left-wing.png"
  },
  "/memes/politics/no-difference-between-the-nazis-and-the.png": {
    "type": "image/png",
    "etag": "\"b34c6-varNeSOPoMCjYqYqtmg0yFaSKeU\"",
    "mtime": "2025-06-24T17:23:22.108Z",
    "size": 734406,
    "path": "../public/memes/politics/no-difference-between-the-nazis-and-the.png"
  },
  "/memes/politics/no-to-wolf-haters-no-to-wolfphobia.png": {
    "type": "image/png",
    "etag": "\"106bf9-QMha6drr77DSFCeWdRgUVtIp0L0\"",
    "mtime": "2025-06-24T17:23:22.110Z",
    "size": 1076217,
    "path": "../public/memes/politics/no-to-wolf-haters-no-to-wolfphobia.png"
  },
  "/memes/politics/nope-just-a-democrat-from-20-years-ago.png": {
    "type": "image/png",
    "etag": "\"eba85-/tTA/dAgyMyj+LsGC/qZSfZo3s8\"",
    "mtime": "2025-06-24T17:23:22.124Z",
    "size": 965253,
    "path": "../public/memes/politics/nope-just-a-democrat-from-20-years-ago.png"
  },
  "/memes/politics/only-16-of-us-citizens-owned-slaves-in-1.png": {
    "type": "image/png",
    "etag": "\"aaf9f-grNQWYu9bUTkLBCrNIkhmGKUTtU\"",
    "mtime": "2025-06-24T17:23:22.110Z",
    "size": 700319,
    "path": "../public/memes/politics/only-16-of-us-citizens-owned-slaves-in-1.png"
  },
  "/memes/politics/operation-let-them-talk.png": {
    "type": "image/png",
    "etag": "\"10f89c-OEp7S2iCbDmM3RnzM+buq8sGmB4\"",
    "mtime": "2025-06-24T17:23:22.117Z",
    "size": 1112220,
    "path": "../public/memes/politics/operation-let-them-talk.png"
  },
  "/memes/politics/optimist-pessimist-leftist-water-is-raci.png": {
    "type": "image/png",
    "etag": "\"444c0-597ePZrhkTEb43sS5AiJ0iR26JM\"",
    "mtime": "2025-06-24T17:23:22.133Z",
    "size": 279744,
    "path": "../public/memes/politics/optimist-pessimist-leftist-water-is-raci.png"
  },
  "/memes/politics/our-ancestors-werent-evil-be-proud.png": {
    "type": "image/png",
    "etag": "\"12c473-R8DP4/64lTqn3845xxfPeit8dNw\"",
    "mtime": "2025-06-24T17:23:22.119Z",
    "size": 1229939,
    "path": "../public/memes/politics/our-ancestors-werent-evil-be-proud.png"
  },
  "/memes/politics/our-founders-political-spectrum.png": {
    "type": "image/png",
    "etag": "\"3a085-PMyCW9bROfyb6xo5umoDviJlz4s\"",
    "mtime": "2025-06-24T17:23:22.116Z",
    "size": 237701,
    "path": "../public/memes/politics/our-founders-political-spectrum.png"
  },
  "/memes/politics/quick-history-who-did-it-democrats.png": {
    "type": "image/png",
    "etag": "\"11185f-8m6suCDj6NN97mWMOMjs7jU4lDk\"",
    "mtime": "2025-06-24T17:23:22.121Z",
    "size": 1120351,
    "path": "../public/memes/politics/quick-history-who-did-it-democrats.png"
  },
  "/memes/politics/race-card-a-tool-of-the-intellectually-w.png": {
    "type": "image/png",
    "etag": "\"9e1b6-Yo3kuHXrgSIn8D4Vy4ortChroM8\"",
    "mtime": "2025-06-24T17:23:22.117Z",
    "size": 647606,
    "path": "../public/memes/politics/race-card-a-tool-of-the-intellectually-w.png"
  },
  "/memes/politics/reeeeetarded-1.png": {
    "type": "image/png",
    "etag": "\"bbd08-/RRWXIsbeD1F8FTaC0sFdP2j7mI\"",
    "mtime": "2025-06-24T17:23:22.125Z",
    "size": 769288,
    "path": "../public/memes/politics/reeeeetarded-1.png"
  },
  "/memes/politics/remember-communism-killed-100-million-pe.png": {
    "type": "image/png",
    "etag": "\"1194fa-NSdN4ARLYp4g0PD15yroMMQfBFA\"",
    "mtime": "2025-06-24T17:23:22.133Z",
    "size": 1152250,
    "path": "../public/memes/politics/remember-communism-killed-100-million-pe.png"
  },
  "/memes/politics/richard-winn-livingstone-quote.png": {
    "type": "image/png",
    "etag": "\"143cc4-4WLMFsMS6c+2OxKEW061s/6hax8\"",
    "mtime": "2025-06-24T17:23:22.128Z",
    "size": 1326276,
    "path": "../public/memes/politics/richard-winn-livingstone-quote.png"
  },
  "/memes/politics/rioters-arsonists-and-looters-are-here-t.png": {
    "type": "image/png",
    "etag": "\"d56f2-s02wMhI5pSFEDAI9B/aL96ccukY\"",
    "mtime": "2025-06-24T17:23:22.128Z",
    "size": 874226,
    "path": "../public/memes/politics/rioters-arsonists-and-looters-are-here-t.png"
  },
  "/memes/politics/ronald-reagan-if-it-moves-tax-it.png": {
    "type": "image/png",
    "etag": "\"7485d-9jF715luOhWxGcB/mMT0Dz+MYHI\"",
    "mtime": "2025-06-24T17:23:22.133Z",
    "size": 477277,
    "path": "../public/memes/politics/ronald-reagan-if-it-moves-tax-it.png"
  },
  "/memes/politics/scott-jennings-doh-face.png": {
    "type": "image/png",
    "etag": "\"69e94-ZtkW7m+Q4f2PUib5A5oG1mhyNQE\"",
    "mtime": "2025-06-24T17:23:22.137Z",
    "size": 433812,
    "path": "../public/memes/politics/scott-jennings-doh-face.png"
  },
  "/memes/politics/scottadams-hoax-list.png": {
    "type": "image/png",
    "etag": "\"4abef-egtte5rcEAdvvDPCnjhKkTgFtzQ\"",
    "mtime": "2025-06-24T17:23:22.133Z",
    "size": 306159,
    "path": "../public/memes/politics/scottadams-hoax-list.png"
  },
  "/memes/politics/sheepdog-hes-a-threat-to-sheep-safety.png": {
    "type": "image/png",
    "etag": "\"f4c14-VhW2hBC61ccj8TiClliaTptqilQ\"",
    "mtime": "2025-06-24T17:23:22.143Z",
    "size": 1002516,
    "path": "../public/memes/politics/sheepdog-hes-a-threat-to-sheep-safety.png"
  },
  "/memes/politics/should-the-government-nope.png": {
    "type": "image/png",
    "etag": "\"11fc82-0AceAX6/8U6sYHVUWPJT3rxWME0\"",
    "mtime": "2025-06-24T17:23:22.139Z",
    "size": 1178754,
    "path": "../public/memes/politics/should-the-government-nope.png"
  },
  "/memes/politics/socialist-worker-from-the-rivek-to-the-s.png": {
    "type": "image/png",
    "etag": "\"1973f3-gqqYnXZKhMrJSk5ISZlggaweMJs\"",
    "mtime": "2025-06-24T17:23:22.140Z",
    "size": 1668083,
    "path": "../public/memes/politics/socialist-worker-from-the-rivek-to-the-s.png"
  },
  "/memes/politics/socialists-you-guys-always-act-like-your.png": {
    "type": "image/png",
    "etag": "\"da9b2-u869XPLDDt54KthZVEJtWN708ew\"",
    "mtime": "2025-06-24T17:23:22.139Z",
    "size": 895410,
    "path": "../public/memes/politics/socialists-you-guys-always-act-like-your.png"
  },
  "/memes/politics/soviet-slave-state-gulags.png": {
    "type": "image/png",
    "etag": "\"a787e-p3aLT5QkSZX00IAf6FzaM+5SjBY\"",
    "mtime": "2025-06-24T17:23:22.141Z",
    "size": 686206,
    "path": "../public/memes/politics/soviet-slave-state-gulags.png"
  },
  "/memes/politics/that-wasnt-real-socialism.png": {
    "type": "image/png",
    "etag": "\"129fda-3LhMy5Lt7tl5PHgQYJdDCmP2mws\"",
    "mtime": "2025-06-24T17:23:22.154Z",
    "size": 1220570,
    "path": "../public/memes/politics/that-wasnt-real-socialism.png"
  },
  "/memes/politics/the-demons-that-stole-our-country-have-s.png": {
    "type": "image/png",
    "etag": "\"11522e-Uzs016ngJEH0XX7b+hcCUmom4Cg\"",
    "mtime": "2025-06-24T17:23:22.147Z",
    "size": 1135150,
    "path": "../public/memes/politics/the-demons-that-stole-our-country-have-s.png"
  },
  "/memes/politics/the-government-we-have-now-massive-book.png": {
    "type": "image/png",
    "etag": "\"dfa6a-oyZEJZ45pgoiDubbzHLKk3tAR8o\"",
    "mtime": "2025-06-24T17:23:22.144Z",
    "size": 916074,
    "path": "../public/memes/politics/the-government-we-have-now-massive-book.png"
  },
  "/memes/politics/the-lefts-ideology-is-regarded-by-the-co.png": {
    "type": "image/png",
    "etag": "\"109cc8-OoXQgV2oYAtwwUNuz9YYDBV8Zjw\"",
    "mtime": "2025-06-24T17:23:22.145Z",
    "size": 1088712,
    "path": "../public/memes/politics/the-lefts-ideology-is-regarded-by-the-co.png"
  },
  "/memes/politics/the-older-i-get-the-more-i-can-relate-to.png": {
    "type": "image/png",
    "etag": "\"e0d0f-iZKf1TJN4r+EmpbXpUbRK/7iT9I\"",
    "mtime": "2025-06-24T17:23:22.152Z",
    "size": 920847,
    "path": "../public/memes/politics/the-older-i-get-the-more-i-can-relate-to.png"
  },
  "/memes/politics/the-political-spectrum-youre-taught.png": {
    "type": "image/png",
    "etag": "\"46380-7zdJFUiWmi8JS3LURkLX1SqYufU\"",
    "mtime": "2025-06-24T17:23:22.149Z",
    "size": 287616,
    "path": "../public/memes/politics/the-political-spectrum-youre-taught.png"
  },
  "/memes/politics/the-political-spectrum.png": {
    "type": "image/png",
    "etag": "\"3b035-Ixf9kJsPhMWyNWZdM0kDXj8IxeI\"",
    "mtime": "2025-06-24T17:23:22.155Z",
    "size": 241717,
    "path": "../public/memes/politics/the-political-spectrum.png"
  },
  "/memes/politics/the-problem-with-socialism-is.png": {
    "type": "image/png",
    "etag": "\"d781c-I7fl9dZYm8+8A43TvIEE6AVWXgs\"",
    "mtime": "2025-06-24T17:23:22.157Z",
    "size": 882716,
    "path": "../public/memes/politics/the-problem-with-socialism-is.png"
  },
  "/memes/politics/the-reason-you-dont-know-youve-been-lied.png": {
    "type": "image/png",
    "etag": "\"71929-TaiWUQYVqhLt6AjYncgq17KRzQg\"",
    "mtime": "2025-06-24T17:23:22.151Z",
    "size": 465193,
    "path": "../public/memes/politics/the-reason-you-dont-know-youve-been-lied.png"
  },
  "/memes/politics/the-same-analogy-can-be-made-about-human.png": {
    "type": "image/png",
    "etag": "\"e4e63-5zj1XBvicCBNUWu4VqEfcfVLX4M\"",
    "mtime": "2025-06-24T17:23:22.156Z",
    "size": 937571,
    "path": "../public/memes/politics/the-same-analogy-can-be-made-about-human.png"
  },
  "/memes/politics/theres-no-such-thing-as-government-funde.png": {
    "type": "image/png",
    "etag": "\"c8c4b-TclXfzvwamKiHb5ETJDpHV3/KJ4\"",
    "mtime": "2025-06-24T17:23:22.161Z",
    "size": 822347,
    "path": "../public/memes/politics/theres-no-such-thing-as-government-funde.png"
  },
  "/memes/politics/these-people-are-liberal-these-people-ar.png": {
    "type": "image/png",
    "etag": "\"97ce8-ITn/Uayk3IJs3u48YDFmFu7B1Q0\"",
    "mtime": "2025-06-24T17:23:22.157Z",
    "size": 621800,
    "path": "../public/memes/politics/these-people-are-liberal-these-people-ar.png"
  },
  "/memes/politics/theyre-not-after-you-theyre-after-me-you.png": {
    "type": "image/png",
    "etag": "\"5f88f-3uaB8ItF1oq9JjUBK6RMVsSc61Y\"",
    "mtime": "2025-06-24T17:23:22.161Z",
    "size": 391311,
    "path": "../public/memes/politics/theyre-not-after-you-theyre-after-me-you.png"
  },
  "/memes/politics/threat-to-their-corrupt-bureaucracy.png": {
    "type": "image/png",
    "etag": "\"dec6b-FbnwuJX/JGDcFMV4Zc3arwoanbg\"",
    "mtime": "2025-06-24T17:23:22.162Z",
    "size": 912491,
    "path": "../public/memes/politics/threat-to-their-corrupt-bureaucracy.png"
  },
  "/memes/politics/trump-admin-cancel-bingo.png": {
    "type": "image/png",
    "etag": "\"22d04-RYLFaRiw5TH2HEIfWKEjeO/09vQ\"",
    "mtime": "2025-06-24T17:23:22.166Z",
    "size": 142596,
    "path": "../public/memes/politics/trump-admin-cancel-bingo.png"
  },
  "/memes/politics/truth-about-the-crusades.png": {
    "type": "image/png",
    "etag": "\"125ead-1XTcydvy4OpWbx+wqGTdlhzruBw\"",
    "mtime": "2025-06-24T17:23:22.162Z",
    "size": 1203885,
    "path": "../public/memes/politics/truth-about-the-crusades.png"
  },
  "/memes/politics/uk-down-planet-of-the-apes.png": {
    "type": "image/png",
    "etag": "\"ce878-GTcP3hinxE8TXSvjjw33Sqkk3dQ\"",
    "mtime": "2025-06-24T17:23:22.169Z",
    "size": 845944,
    "path": "../public/memes/politics/uk-down-planet-of-the-apes.png"
  },
  "/memes/politics/unless-its-hate-for-trump-his-supporters.png": {
    "type": "image/png",
    "etag": "\"f1f94-nWq7F7ltKGyshBJxRMwf6m94dUQ\"",
    "mtime": "2025-06-24T17:23:22.170Z",
    "size": 991124,
    "path": "../public/memes/politics/unless-its-hate-for-trump-his-supporters.png"
  },
  "/memes/politics/up-until-1913-americans-kept-all-of-thei.png": {
    "type": "image/png",
    "etag": "\"19561e-qRYc1Qs7RfTuEEXGU+CqXTSVa6M\"",
    "mtime": "2025-06-24T17:23:22.172Z",
    "size": 1660446,
    "path": "../public/memes/politics/up-until-1913-americans-kept-all-of-thei.png"
  },
  "/memes/politics/us-political-spectrum-expanded.png": {
    "type": "image/png",
    "etag": "\"ae8c2-aoeXimNqT/qeUbNchf09RrBgw10\"",
    "mtime": "2025-06-24T17:23:22.170Z",
    "size": 714946,
    "path": "../public/memes/politics/us-political-spectrum-expanded.png"
  },
  "/memes/politics/useful-idiots-hugo-chavez.png": {
    "type": "image/png",
    "etag": "\"127a51-lQez+cg9ENszOtgEuxv+z4ghpAg\"",
    "mtime": "2025-06-24T17:23:22.176Z",
    "size": 1210961,
    "path": "../public/memes/politics/useful-idiots-hugo-chavez.png"
  },
  "/memes/politics/view-these-two-symbols-of-murder-and-sla.png": {
    "type": "image/png",
    "etag": "\"610b3-Hi4geCpLXAJxfIcxVwgBiLvCnL8\"",
    "mtime": "2025-06-24T17:23:22.171Z",
    "size": 397491,
    "path": "../public/memes/politics/view-these-two-symbols-of-murder-and-sla.png"
  },
  "/memes/politics/virtue-signalling.png": {
    "type": "image/png",
    "etag": "\"936eb-uAojL3c/G0N5uiyqhl3s9I010x0\"",
    "mtime": "2025-06-24T17:23:22.176Z",
    "size": 603883,
    "path": "../public/memes/politics/virtue-signalling.png"
  },
  "/memes/politics/watermelons-green-outside-red-within.png": {
    "type": "image/png",
    "etag": "\"816c4-9m+QiKxxgnS1v2GkPfvB3uy+XwM\"",
    "mtime": "2025-06-24T17:23:22.176Z",
    "size": 530116,
    "path": "../public/memes/politics/watermelons-green-outside-red-within.png"
  },
  "/memes/politics/we-owe-joseph-mccarthy-an-apology.png": {
    "type": "image/png",
    "etag": "\"5bad4-p6IrBKrFQlw70wdVmi2mKGGRmnE\"",
    "mtime": "2025-06-24T17:23:22.178Z",
    "size": 375508,
    "path": "../public/memes/politics/we-owe-joseph-mccarthy-an-apology.png"
  },
  "/memes/politics/well-need-to-be-more-vile-condescending.png": {
    "type": "image/png",
    "etag": "\"fe770-1w8xqYSX1t+1GjzNEYoA8u+56uw\"",
    "mtime": "2025-06-24T17:23:22.178Z",
    "size": 1042288,
    "path": "../public/memes/politics/well-need-to-be-more-vile-condescending.png"
  },
  "/memes/politics/were-gonna-need-a-bigger-hoax.png": {
    "type": "image/png",
    "etag": "\"9ed7a-IRXN/nM8IpgprBrHra8IAwo0teY\"",
    "mtime": "2025-06-24T17:23:22.180Z",
    "size": 650618,
    "path": "../public/memes/politics/were-gonna-need-a-bigger-hoax.png"
  },
  "/memes/politics/were-the-left-38-we-have-a-plan.png": {
    "type": "image/png",
    "etag": "\"cb9cc-oDO3yWbOP4fQQ60pXY7oRX4LMIg\"",
    "mtime": "2025-06-24T17:23:22.180Z",
    "size": 833996,
    "path": "../public/memes/politics/were-the-left-38-we-have-a-plan.png"
  },
  "/memes/politics/were-way-past-swamp-britain.png": {
    "type": "image/png",
    "etag": "\"157303-t1hhLtET5S558qzPqByY4Lghb9U\"",
    "mtime": "2025-06-24T17:23:22.187Z",
    "size": 1405699,
    "path": "../public/memes/politics/were-way-past-swamp-britain.png"
  },
  "/memes/politics/weve-voted-democrat-for-three-generation.png": {
    "type": "image/png",
    "etag": "\"b6087-NAR6rw5Gd6vMmgpNIg695IeFsRc\"",
    "mtime": "2025-06-24T17:23:22.186Z",
    "size": 745607,
    "path": "../public/memes/politics/weve-voted-democrat-for-three-generation.png"
  },
  "/memes/politics/what-can-we-do-to-stop-living-in-fear-cl.png": {
    "type": "image/png",
    "etag": "\"edee1-sn4JMCw1VjKgjRU+nx4Plcqv1m4\"",
    "mtime": "2025-06-24T17:23:22.187Z",
    "size": 974561,
    "path": "../public/memes/politics/what-can-we-do-to-stop-living-in-fear-cl.png"
  },
  "/memes/politics/what-government-agency-would-you-get-rid.png": {
    "type": "image/png",
    "etag": "\"1286c5-34Ke3d2XJBQ+RlryCGfKu5r4zFA\"",
    "mtime": "2025-06-24T17:23:22.187Z",
    "size": 1214149,
    "path": "../public/memes/politics/what-government-agency-would-you-get-rid.png"
  },
  "/memes/politics/what-have-the-left-ever-done-for-us.png": {
    "type": "image/png",
    "etag": "\"10c43c-ZVxA5A3VDs5hV1L+EKzvzuOaBl4\"",
    "mtime": "2025-06-24T17:23:22.195Z",
    "size": 1098812,
    "path": "../public/memes/politics/what-have-the-left-ever-done-for-us.png"
  },
  "/memes/politics/what-psyop-is-this.png": {
    "type": "image/png",
    "etag": "\"850f4-+f91xOpiSwvfYCnDvr2z8bZRIXI\"",
    "mtime": "2025-06-24T17:23:22.194Z",
    "size": 545012,
    "path": "../public/memes/politics/what-psyop-is-this.png"
  },
  "/memes/politics/when-that-smell-of-democrat-desperation.png": {
    "type": "image/png",
    "etag": "\"5c7ce-oHFa9sm9lnJ3rM4xcrLUIDXaeWU\"",
    "mtime": "2025-06-24T17:23:22.193Z",
    "size": 378830,
    "path": "../public/memes/politics/when-that-smell-of-democrat-desperation.png"
  },
  "/memes/politics/whoever-being-entrusted-with-national-se.png": {
    "type": "image/png",
    "etag": "\"c710d-J/HgzGBBqFRHM356PRbvs96lvHs\"",
    "mtime": "2025-06-24T17:23:22.197Z",
    "size": 815373,
    "path": "../public/memes/politics/whoever-being-entrusted-with-national-se.png"
  },
  "/memes/politics/why-are-you-so-poor-and-primitive-its-go.png": {
    "type": "image/png",
    "etag": "\"f615a-g3AAwtuVlXOqTjYqIJrjFIcgzMQ\"",
    "mtime": "2025-06-24T17:23:22.195Z",
    "size": 1007962,
    "path": "../public/memes/politics/why-are-you-so-poor-and-primitive-its-go.png"
  },
  "/memes/politics/world-racism-people-they-would-not-want.png": {
    "type": "image/png",
    "etag": "\"5e2c9-oPwjTAxrN7SbAydEMV5atAn0Cfc\"",
    "mtime": "2025-06-24T17:23:22.197Z",
    "size": 385737,
    "path": "../public/memes/politics/world-racism-people-they-would-not-want.png"
  },
  "/memes/politics/you-will-be-hated-if-you-cant-be-manipul.png": {
    "type": "image/png",
    "etag": "\"f78dd-mcFpeaXFonQ2OqlTkSsSwxCfucQ\"",
    "mtime": "2025-06-24T17:23:22.197Z",
    "size": 1013981,
    "path": "../public/memes/politics/you-will-be-hated-if-you-cant-be-manipul.png"
  },
  "/memes/politics/your-government-at-work.png": {
    "type": "image/png",
    "etag": "\"118e63-7inb4+LcSd+KE2loMGU92JrRwKw\"",
    "mtime": "2025-06-24T17:23:22.205Z",
    "size": 1150563,
    "path": "../public/memes/politics/your-government-at-work.png"
  },
  "/memes/politics/your-race-card-has-been-declined.png": {
    "type": "image/png",
    "etag": "\"115a88-ku3K229c7IVyOSjP4xA9qvFp9aM\"",
    "mtime": "2025-06-24T17:23:22.201Z",
    "size": 1137288,
    "path": "../public/memes/politics/your-race-card-has-been-declined.png"
  },
  "/memes/woke-insanity/democrat-savior-complex.png": {
    "type": "image/png",
    "etag": "\"141fc8-ocAwUc4wTe3lRBirYMwZa5UH1zA\"",
    "mtime": "2025-06-24T17:23:21.521Z",
    "size": 1318856,
    "path": "../public/memes/woke-insanity/democrat-savior-complex.png"
  },
  "/memes/woke-insanity/man-pregnant.png": {
    "type": "image/png",
    "etag": "\"77103-fzT3l3qHNbch0voFcmD+GjRgaYI\"",
    "mtime": "2025-06-24T17:23:21.870Z",
    "size": 487683,
    "path": "../public/memes/woke-insanity/man-pregnant.png"
  },
  "/memes/thomas-sowell/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"4804-/S698SoKhred3NItBFUaOlpOdZ4\"",
    "mtime": "2025-06-24T17:23:21.520Z",
    "size": 18436,
    "path": "../public/memes/thomas-sowell/.DS_Store"
  },
  "/memes/thomas-sowell/More-whites-were-brought-as-slaves-to-North-Africa-than.png": {
    "type": "image/png",
    "etag": "\"ac74d-urFY5J4Qg+njgxb7C/3szOa4/bE\"",
    "mtime": "2025-06-24T17:23:22.204Z",
    "size": 706381,
    "path": "../public/memes/thomas-sowell/More-whites-were-brought-as-slaves-to-North-Africa-than.png"
  },
  "/memes/thomas-sowell/activism-is-a-way-for-useless-people-to-feel.png": {
    "type": "image/png",
    "etag": "\"16c597-lytaGwne9bDdGIHlraq5N1NRBE8\"",
    "mtime": "2025-06-24T17:23:22.205Z",
    "size": 1492375,
    "path": "../public/memes/thomas-sowell/activism-is-a-way-for-useless-people-to-feel.png"
  },
  "/memes/thomas-sowell/blacks-were-not-enslaved-becuase-they-were-black.png": {
    "type": "image/png",
    "etag": "\"46963-ig2xNlC4McOwmO0T4N0oIU5ib/A\"",
    "mtime": "2025-06-24T17:23:22.203Z",
    "size": 289123,
    "path": "../public/memes/thomas-sowell/blacks-were-not-enslaved-becuase-they-were-black.png"
  },
  "/memes/thomas-sowell/both-free-speech-rights-and-property-rights-belong-legally-to-individuals.png": {
    "type": "image/png",
    "etag": "\"1deb7-MD31qimoWcDyc4K4q+PNdiTpzk0\"",
    "mtime": "2025-06-24T17:23:22.207Z",
    "size": 122551,
    "path": "../public/memes/thomas-sowell/both-free-speech-rights-and-property-rights-belong-legally-to-individuals.png"
  },
  "/memes/thomas-sowell/despite-a-voluminous-and-often-fervent-literature-on-income-distribution.png": {
    "type": "image/png",
    "etag": "\"3b9c5-pqhExilMvRNquxa7ehW2AaDI5HQ\"",
    "mtime": "2025-06-24T17:23:22.208Z",
    "size": 244165,
    "path": "../public/memes/thomas-sowell/despite-a-voluminous-and-often-fervent-literature-on-income-distribution.png"
  },
  "/memes/thomas-sowell/during-the-1920s-and-the-early-1930s-fascism-was.png": {
    "type": "image/png",
    "etag": "\"e8c6a-2uUkMHWR0AYyNWivV+AAjgvm6v0\"",
    "mtime": "2025-06-24T17:23:22.211Z",
    "size": 953450,
    "path": "../public/memes/thomas-sowell/during-the-1920s-and-the-early-1930s-fascism-was.png"
  },
  "/memes/thomas-sowell/europe-is-belatedly-discovering-how-unbelievably-stupid.png": {
    "type": "image/png",
    "etag": "\"10e574-CuKPqGneVHL8jjRbvCuJdqwUM4s\"",
    "mtime": "2025-06-24T17:23:22.212Z",
    "size": 1107316,
    "path": "../public/memes/thomas-sowell/europe-is-belatedly-discovering-how-unbelievably-stupid.png"
  },
  "/memes/thomas-sowell/guilt-has-so-furtively-stolen-into-many-hearts.png": {
    "type": "image/png",
    "etag": "\"4e397-vkzS740LDOqMA+xdfa0hGdu/lXY\"",
    "mtime": "2025-06-24T17:23:22.218Z",
    "size": 320407,
    "path": "../public/memes/thomas-sowell/guilt-has-so-furtively-stolen-into-many-hearts.png"
  },
  "/memes/thomas-sowell/hours-may-become-the-first-civilization-destroyed.png": {
    "type": "image/png",
    "etag": "\"f9b08-ICmxKmoHwadpENGL0shPXWtbW8Q\"",
    "mtime": "2025-06-24T17:23:22.212Z",
    "size": 1022728,
    "path": "../public/memes/thomas-sowell/hours-may-become-the-first-civilization-destroyed.png"
  },
  "/memes/thomas-sowell/i-have-never-understood-why-it-is-agreed-to-want-to-keep-the-money-you-have-earned.png": {
    "type": "image/png",
    "etag": "\"5bdfd-CKX+gvEf/Al31IDcU4a446X52tU\"",
    "mtime": "2025-06-24T17:23:22.213Z",
    "size": 376317,
    "path": "../public/memes/thomas-sowell/i-have-never-understood-why-it-is-agreed-to-want-to-keep-the-money-you-have-earned.png"
  },
  "/memes/thomas-sowell/if-you-are-not-prepared-to-use-force-to-defend.png": {
    "type": "image/png",
    "etag": "\"39a3f-4PapunUzf1aJyu/8/BmgaCPXixU\"",
    "mtime": "2025-06-24T17:23:22.213Z",
    "size": 236095,
    "path": "../public/memes/thomas-sowell/if-you-are-not-prepared-to-use-force-to-defend.png"
  },
  "/memes/thomas-sowell/if-you-cannot-achieve-a-quality-of-performance-among-people-born-to-the-same-parents.png": {
    "type": "image/png",
    "etag": "\"3b7bf-dOSjoTKvtVAYWJE+13lm7HpTUSM\"",
    "mtime": "2025-06-24T17:23:22.213Z",
    "size": 243647,
    "path": "../public/memes/thomas-sowell/if-you-cannot-achieve-a-quality-of-performance-among-people-born-to-the-same-parents.png"
  },
  "/memes/thomas-sowell/if-you-want-to-see-the-poor-remain-poor-generation-after-generation.png": {
    "type": "image/png",
    "etag": "\"4956c-VsgIwTa89H58Ku+7P+kv9385A/g\"",
    "mtime": "2025-06-24T17:23:22.217Z",
    "size": 300396,
    "path": "../public/memes/thomas-sowell/if-you-want-to-see-the-poor-remain-poor-generation-after-generation.png"
  },
  "/memes/thomas-sowell/immigration-laws-are-the-only-laws.png": {
    "type": "image/png",
    "etag": "\"45414-StnkeMrvx96OUZtydCKjf6PleUA\"",
    "mtime": "2025-06-24T17:23:22.218Z",
    "size": 283668,
    "path": "../public/memes/thomas-sowell/immigration-laws-are-the-only-laws.png"
  },
  "/memes/thomas-sowell/it-is-fascinating-to-watch-politicians-come-up-with-solutions.png": {
    "type": "image/png",
    "etag": "\"a904e-cBM9ncku40kcTi2iaf4HM5WMNnU\"",
    "mtime": "2025-06-24T17:23:22.218Z",
    "size": 692302,
    "path": "../public/memes/thomas-sowell/it-is-fascinating-to-watch-politicians-come-up-with-solutions.png"
  },
  "/memes/thomas-sowell/it-is-not-enough-for-us-to-discover-belatedly-that-we-have-been-lied-to.png": {
    "type": "image/png",
    "etag": "\"32348-/dy2sdjt0E783jkNUr2ClElUm+o\"",
    "mtime": "2025-06-24T17:23:22.219Z",
    "size": 205640,
    "path": "../public/memes/thomas-sowell/it-is-not-enough-for-us-to-discover-belatedly-that-we-have-been-lied-to.png"
  },
  "/memes/thomas-sowell/it-is-usually-futile-to-try-to-talk-facts.png": {
    "type": "image/png",
    "etag": "\"19a02-hTgxBg6J1EwIz5vu3sELV4xPoCM\"",
    "mtime": "2025-06-24T17:23:22.218Z",
    "size": 104962,
    "path": "../public/memes/thomas-sowell/it-is-usually-futile-to-try-to-talk-facts.png"
  },
  "/memes/thomas-sowell/it-was-thomas-edison-who-brought-us-elctricity.png": {
    "type": "image/png",
    "etag": "\"111806-F+CJUzYvIPOU7KfS+949wYu4YIQ\"",
    "mtime": "2025-06-24T17:23:22.222Z",
    "size": 1120262,
    "path": "../public/memes/thomas-sowell/it-was-thomas-edison-who-brought-us-elctricity.png"
  },
  "/memes/thomas-sowell/its-amazing-how-fast-people-learn-when-they-are.png": {
    "type": "image/png",
    "etag": "\"756e9-53OY3Ikl9+1UH11e/FRHJMg2gyI\"",
    "mtime": "2025-06-24T17:23:22.221Z",
    "size": 481001,
    "path": "../public/memes/thomas-sowell/its-amazing-how-fast-people-learn-when-they-are.png"
  },
  "/memes/thomas-sowell/many-on-the-political-left-are-so-entranced-by-the-beauty-of-their-vision.png": {
    "type": "image/png",
    "etag": "\"1849dc-yPxjqDz1XvrwbMrROaHLeVsB4xA\"",
    "mtime": "2025-06-24T17:23:22.225Z",
    "size": 1591772,
    "path": "../public/memes/thomas-sowell/many-on-the-political-left-are-so-entranced-by-the-beauty-of-their-vision.png"
  },
  "/memes/thomas-sowell/much-of-the-social-history-of-the-western-world-over-the-past-three-decades.png": {
    "type": "image/png",
    "etag": "\"3703c-JF+vFUn7ekpG2VyG045kYtzJkio\"",
    "mtime": "2025-06-24T17:23:22.220Z",
    "size": 225340,
    "path": "../public/memes/thomas-sowell/much-of-the-social-history-of-the-western-world-over-the-past-three-decades.png"
  },
  "/memes/thomas-sowell/much-of-the-social-history-of-the-western-world.png": {
    "type": "image/png",
    "etag": "\"7a1b2-TsmfakMcFFZ7mYi22K529ASQkPc\"",
    "mtime": "2025-06-24T17:23:22.222Z",
    "size": 500146,
    "path": "../public/memes/thomas-sowell/much-of-the-social-history-of-the-western-world.png"
  },
  "/memes/thomas-sowell/much-of-what-are-called-social-problems.png": {
    "type": "image/png",
    "etag": "\"b2fc2-7VOnq//4hm9xebZMq3CgBAYzC64\"",
    "mtime": "2025-06-24T17:23:22.227Z",
    "size": 733122,
    "path": "../public/memes/thomas-sowell/much-of-what-are-called-social-problems.png"
  },
  "/memes/thomas-sowell/multiculturalism-like-the-cast-system.png": {
    "type": "image/png",
    "etag": "\"f60c-Uqc1g2jyFjMZc2ixMRKuaH22JX8\"",
    "mtime": "2025-06-24T17:23:22.227Z",
    "size": 62988,
    "path": "../public/memes/thomas-sowell/multiculturalism-like-the-cast-system.png"
  },
  "/memes/thomas-sowell/no-matter-how-disastrously-some-policy-has-turned-out.png": {
    "type": "image/png",
    "etag": "\"ad8d8-rufXqDLJ2kkfeiw5lmIaa08cmqw\"",
    "mtime": "2025-06-24T17:23:22.223Z",
    "size": 710872,
    "path": "../public/memes/thomas-sowell/no-matter-how-disastrously-some-policy-has-turned-out.png"
  },
  "/memes/thomas-sowell/nobody-is-equal-to-anybody.png": {
    "type": "image/png",
    "etag": "\"b7b23-4jLq+eM8ne01nzV35L6/d8INUt0\"",
    "mtime": "2025-06-24T17:23:22.228Z",
    "size": 752419,
    "path": "../public/memes/thomas-sowell/nobody-is-equal-to-anybody.png"
  },
  "/memes/thomas-sowell/one-of-the-many-services-done-to-young-people-is-giving-them-a-puffed-up-notion.png": {
    "type": "image/png",
    "etag": "\"ad658-crv6TcqdY5UNmAdFMA4g0EgqQDA\"",
    "mtime": "2025-06-24T17:23:22.229Z",
    "size": 710232,
    "path": "../public/memes/thomas-sowell/one-of-the-many-services-done-to-young-people-is-giving-them-a-puffed-up-notion.png"
  },
  "/memes/thomas-sowell/one-of-the-most-important-reasons-for-studying-history.png": {
    "type": "image/png",
    "etag": "\"3c71e-0qyZjLGDB8yR2puyKQDhuhITgCc\"",
    "mtime": "2025-06-24T17:23:22.228Z",
    "size": 247582,
    "path": "../public/memes/thomas-sowell/one-of-the-most-important-reasons-for-studying-history.png"
  },
  "/memes/thomas-sowell/one-of-them-many-disservices-done-to-young-people.png": {
    "type": "image/png",
    "etag": "\"ad658-crv6TcqdY5UNmAdFMA4g0EgqQDA\"",
    "mtime": "2025-06-24T17:23:22.231Z",
    "size": 710232,
    "path": "../public/memes/thomas-sowell/one-of-them-many-disservices-done-to-young-people.png"
  },
  "/memes/thomas-sowell/people-who-are-very-aware-that-they-have-more-knowledge.png": {
    "type": "image/png",
    "etag": "\"68b8a-siUiAe7CST3Qz5VlGfW+ZoIs1VM\"",
    "mtime": "2025-06-24T17:23:22.229Z",
    "size": 428938,
    "path": "../public/memes/thomas-sowell/people-who-are-very-aware-that-they-have-more-knowledge.png"
  },
  "/memes/thomas-sowell/people-who-pride-themselves-on-their-complexity.png": {
    "type": "image/png",
    "etag": "\"40975-ZiuSfWVtWb6hIarNy5KbPh5XWX8\"",
    "mtime": "2025-06-24T17:23:22.233Z",
    "size": 264565,
    "path": "../public/memes/thomas-sowell/people-who-pride-themselves-on-their-complexity.png"
  },
  "/memes/thomas-sowell/racism-is-not-dead-but-it-is-on-life-support-kept-alive-by-politicians.png": {
    "type": "image/png",
    "etag": "\"5e115-yOEaNc0YDzPWFxSdKMvODuX/ZlA\"",
    "mtime": "2025-06-24T17:23:22.233Z",
    "size": 385301,
    "path": "../public/memes/thomas-sowell/racism-is-not-dead-but-it-is-on-life-support-kept-alive-by-politicians.png"
  },
  "/memes/thomas-sowell/schools-exist-for-the-education-of-children.png": {
    "type": "image/png",
    "etag": "\"ae533-NjV99VHiCDxQ1A95nhNJdO8eWMw\"",
    "mtime": "2025-06-24T17:23:22.235Z",
    "size": 714035,
    "path": "../public/memes/thomas-sowell/schools-exist-for-the-education-of-children.png"
  },
  "/memes/thomas-sowell/since-wealth-is-the-only-thing-that-can-cure-poverty.png": {
    "type": "image/png",
    "etag": "\"53891-IXm88X2celAfVZs3YUnNrrk/Z8s\"",
    "mtime": "2025-06-24T17:23:22.234Z",
    "size": 342161,
    "path": "../public/memes/thomas-sowell/since-wealth-is-the-only-thing-that-can-cure-poverty.png"
  },
  "/memes/thomas-sowell/socialism-in-general-has-a-record-of-failure-so-blatant.png": {
    "type": "image/png",
    "etag": "\"2319b-6Og2gljnP8Mo2Vg4z3MgrbmbTwY\"",
    "mtime": "2025-06-24T17:23:22.236Z",
    "size": 143771,
    "path": "../public/memes/thomas-sowell/socialism-in-general-has-a-record-of-failure-so-blatant.png"
  },
  "/memes/thomas-sowell/some-americans-will-never-appreciate.png": {
    "type": "image/png",
    "etag": "\"2da8f-0Ls/C9kd1SjrPWNHzZpmBj3LTCc\"",
    "mtime": "2025-06-24T17:23:22.237Z",
    "size": 187023,
    "path": "../public/memes/thomas-sowell/some-americans-will-never-appreciate.png"
  },
  "/memes/thomas-sowell/the-assumption-that-spending-more-of-the-taxpayers-money-will.png": {
    "type": "image/png",
    "etag": "\"40c60-uV2PmapRmoZ2Kvakt8Owai7XgNQ\"",
    "mtime": "2025-06-24T17:23:22.236Z",
    "size": 265312,
    "path": "../public/memes/thomas-sowell/the-assumption-that-spending-more-of-the-taxpayers-money-will.png"
  },
  "/memes/thomas-sowell/the-beauty-of-doing-nothing-is-that-you-can-do-it-perfectly.png": {
    "type": "image/png",
    "etag": "\"148bdf-wKf8MO5gDd0yXbgqi9eO9k7OvfM\"",
    "mtime": "2025-06-24T17:23:22.238Z",
    "size": 1346527,
    "path": "../public/memes/thomas-sowell/the-beauty-of-doing-nothing-is-that-you-can-do-it-perfectly.png"
  },
  "/memes/thomas-sowell/the-black-family-survived-centuries-of-slavery.png": {
    "type": "image/png",
    "etag": "\"b389f-sdzYSVWkc6Bh8hxt5f0/TK7yG08\"",
    "mtime": "2025-06-24T17:23:22.237Z",
    "size": 735391,
    "path": "../public/memes/thomas-sowell/the-black-family-survived-centuries-of-slavery.png"
  },
  "/memes/thomas-sowell/the-endlessly-repeated-argument-that-most-americans-are-the-descendants.png": {
    "type": "image/png",
    "etag": "\"2b5be-FKASXQmx2ReBMr2rZNM2lLcjMwo\"",
    "mtime": "2025-06-24T17:23:22.237Z",
    "size": 177598,
    "path": "../public/memes/thomas-sowell/the-endlessly-repeated-argument-that-most-americans-are-the-descendants.png"
  },
  "/memes/thomas-sowell/the-fact-that-crime-and-poverty-are-correlated-is-automatically-taken-to-mean.png": {
    "type": "image/png",
    "etag": "\"b0048-w2S2t3HQQ5D9LOoD1PnbzA1RMfc\"",
    "mtime": "2025-06-24T17:23:22.243Z",
    "size": 720968,
    "path": "../public/memes/thomas-sowell/the-fact-that-crime-and-poverty-are-correlated-is-automatically-taken-to-mean.png"
  },
  "/memes/thomas-sowell/the-first-lesson-of-economics-is-scarcity.png": {
    "type": "image/png",
    "etag": "\"13e3c-e1wyvv/UikCZ0Yhs0FgsJ0qp8HE\"",
    "mtime": "2025-06-24T17:23:22.241Z",
    "size": 81468,
    "path": "../public/memes/thomas-sowell/the-first-lesson-of-economics-is-scarcity.png"
  },
  "/memes/thomas-sowell/the-left-attempts-to-silence-ideas-they-cannot-or-will-not-debate.png": {
    "type": "image/png",
    "etag": "\"db953-+sHfHBgtY1AP4q/KifMBJ8zikCg\"",
    "mtime": "2025-06-24T17:23:22.242Z",
    "size": 899411,
    "path": "../public/memes/thomas-sowell/the-left-attempts-to-silence-ideas-they-cannot-or-will-not-debate.png"
  },
  "/memes/thomas-sowell/the-left-takes-its-vision-seriously.png": {
    "type": "image/png",
    "etag": "\"52e1f-noIJUSPQZH0hnTOeOadG2Thp9Vc\"",
    "mtime": "2025-06-24T17:23:22.247Z",
    "size": 339487,
    "path": "../public/memes/thomas-sowell/the-left-takes-its-vision-seriously.png"
  },
  "/memes/thomas-sowell/the-more-i-study-the-history-of-intellectuals-the-more-they-seem-like-a-wrecking-crew.png": {
    "type": "image/png",
    "etag": "\"ba0c1-0JMRJyYIsgpPbzCCPd4BzMd7ExM\"",
    "mtime": "2025-06-24T17:23:22.243Z",
    "size": 762049,
    "path": "../public/memes/thomas-sowell/the-more-i-study-the-history-of-intellectuals-the-more-they-seem-like-a-wrecking-crew.png"
  },
  "/memes/thomas-sowell/the-most-basic-question-is-not-what-is-best-but-who-shall-decide-what-is-best.png": {
    "type": "image/png",
    "etag": "\"ab030-FROVNQVqkEfkOqX4/wM4jfeMBTc\"",
    "mtime": "2025-06-24T17:23:22.245Z",
    "size": 700464,
    "path": "../public/memes/thomas-sowell/the-most-basic-question-is-not-what-is-best-but-who-shall-decide-what-is-best.png"
  },
  "/memes/thomas-sowell/the-most-basic-question-is-not-what-is.png": {
    "type": "image/png",
    "etag": "\"2f7b7-P/82akYDbz1QB9p5XozhzCxw1AY\"",
    "mtime": "2025-06-24T17:23:22.247Z",
    "size": 194487,
    "path": "../public/memes/thomas-sowell/the-most-basic-question-is-not-what-is.png"
  },
  "/memes/thomas-sowell/the-next-time-some-academics-tell-you-how-important-diversity-is-ask.png": {
    "type": "image/png",
    "etag": "\"5831d-eEsts+8BhF6fcnBdRq9pHGOQjh8\"",
    "mtime": "2025-06-24T17:23:22.248Z",
    "size": 361245,
    "path": "../public/memes/thomas-sowell/the-next-time-some-academics-tell-you-how-important-diversity-is-ask.png"
  },
  "/memes/thomas-sowell/the-purpose-of-politics-is-not-to-solve-problems.png": {
    "type": "image/png",
    "etag": "\"271f50-a6WwQ0ygPYiWLTgHtpkQN/5Rwzc\"",
    "mtime": "2025-06-24T17:23:22.253Z",
    "size": 2563920,
    "path": "../public/memes/thomas-sowell/the-purpose-of-politics-is-not-to-solve-problems.png"
  },
  "/memes/thomas-sowell/the-real-motives-of-liberals-have-nothing-to-do-with-the-welfare-of-other-people.png": {
    "type": "image/png",
    "etag": "\"13b164-Icey4iRrJfbyGNAh2tMCagOJCiY\"",
    "mtime": "2025-06-24T17:23:22.251Z",
    "size": 1290596,
    "path": "../public/memes/thomas-sowell/the-real-motives-of-liberals-have-nothing-to-do-with-the-welfare-of-other-people.png"
  },
  "/memes/thomas-sowell/the-reason-so-many-people-misunderstand-so-many-issues.png": {
    "type": "image/png",
    "etag": "\"4a7ab-Fgaz6TUYYmxzjYn+McRtmTC754U\"",
    "mtime": "2025-06-24T17:23:22.248Z",
    "size": 305067,
    "path": "../public/memes/thomas-sowell/the-reason-so-many-people-misunderstand-so-many-issues.png"
  },
  "/memes/thomas-sowell/there-are-no-solutions-there-are-only-trade-offs.png": {
    "type": "image/png",
    "etag": "\"21578-Ow8W8WAx+CgWjVUgGqtWbL7RddY\"",
    "mtime": "2025-06-24T17:23:22.248Z",
    "size": 136568,
    "path": "../public/memes/thomas-sowell/there-are-no-solutions-there-are-only-trade-offs.png"
  },
  "/memes/thomas-sowell/there-has-now-been-created-a-world.png": {
    "type": "image/png",
    "etag": "\"1b01b-ePKzEufT5xM4mtLUMrgevyCbFOs\"",
    "mtime": "2025-06-24T17:23:22.249Z",
    "size": 110619,
    "path": "../public/memes/thomas-sowell/there-has-now-been-created-a-world.png"
  },
  "/memes/thomas-sowell/thomas-sowell-discrimination-and-disparities.png": {
    "type": "image/png",
    "etag": "\"228860-VBudHJI0TDQDu+z1Qjqb8qOSYEE\"",
    "mtime": "2025-06-24T17:23:22.254Z",
    "size": 2263136,
    "path": "../public/memes/thomas-sowell/thomas-sowell-discrimination-and-disparities.png"
  },
  "/memes/thomas-sowell/thomas-sowell-it-was-thomas-edison.png": {
    "type": "image/png",
    "etag": "\"7aeb4-CXkhvZvbjh/XVpP7AJT9SCNXK3c\"",
    "mtime": "2025-06-24T17:23:22.252Z",
    "size": 503476,
    "path": "../public/memes/thomas-sowell/thomas-sowell-it-was-thomas-edison.png"
  },
  "/memes/thomas-sowell/thomas-sowell-quote-freedom-unlikely-to-be-lost.png": {
    "type": "image/png",
    "etag": "\"89457-aYdg+n8z727ldU7FjgEOWBkPn5Q\"",
    "mtime": "2025-06-24T17:23:22.254Z",
    "size": 562263,
    "path": "../public/memes/thomas-sowell/thomas-sowell-quote-freedom-unlikely-to-be-lost.png"
  },
  "/memes/thomas-sowell/thomas-sowell-sexual-activity-vs-economic-activity.png": {
    "type": "image/png",
    "etag": "\"5bc78-uweHnNn7z4wZ4Yh34i4kQnhMot8\"",
    "mtime": "2025-06-24T17:23:22.260Z",
    "size": 375928,
    "path": "../public/memes/thomas-sowell/thomas-sowell-sexual-activity-vs-economic-activity.png"
  },
  "/memes/thomas-sowell/too-much-of-what-is-called-education.png": {
    "type": "image/png",
    "etag": "\"23ba4-PDS7f8VCgX3w9BBrdi6I5utJK6Q\"",
    "mtime": "2025-06-24T17:23:22.254Z",
    "size": 146340,
    "path": "../public/memes/thomas-sowell/too-much-of-what-is-called-education.png"
  },
  "/memes/thomas-sowell/we-are-a-nation-of-immigrants-we-are-constantly-reminded.png": {
    "type": "image/png",
    "etag": "\"3429a-9oI/+kuEq2H87EmZwNs+oA4FCiY\"",
    "mtime": "2025-06-24T17:23:22.259Z",
    "size": 213658,
    "path": "../public/memes/thomas-sowell/we-are-a-nation-of-immigrants-we-are-constantly-reminded.png"
  },
  "/memes/thomas-sowell/we-seem-to-be-closer-and-closer-to-a-situation-where-nobody-is-responsible.png": {
    "type": "image/png",
    "etag": "\"127439-kC2q5uayBG+ouwntfLcfsFNI/ys\"",
    "mtime": "2025-06-24T17:23:22.263Z",
    "size": 1209401,
    "path": "../public/memes/thomas-sowell/we-seem-to-be-closer-and-closer-to-a-situation-where-nobody-is-responsible.png"
  },
  "/memes/thomas-sowell/what-do-you-call-it-when-someone-steals-money-secretly.png": {
    "type": "image/png",
    "etag": "\"91b5a-XqHIaGFBs711rIX1JdTkIWveFOo\"",
    "mtime": "2025-06-24T17:23:22.260Z",
    "size": 596826,
    "path": "../public/memes/thomas-sowell/what-do-you-call-it-when-someone-steals-money-secretly.png"
  },
  "/memes/thomas-sowell/what-do-you-replace-a-fire-with-thomas-sowell.png": {
    "type": "image/png",
    "etag": "\"2c363-kbkmwAd6Vr5kQCwPGRv5Dd2fJyI\"",
    "mtime": "2025-06-24T17:23:22.261Z",
    "size": 181091,
    "path": "../public/memes/thomas-sowell/what-do-you-replace-a-fire-with-thomas-sowell.png"
  },
  "/memes/thomas-sowell/what-exactly-is-your-fair-share-of-what-someone-else-has-worked-for.png": {
    "type": "image/png",
    "etag": "\"42518-HTCsdztY/6HqcJlYMAqIqXT2/QA\"",
    "mtime": "2025-06-24T17:23:22.265Z",
    "size": 271640,
    "path": "../public/memes/thomas-sowell/what-exactly-is-your-fair-share-of-what-someone-else-has-worked-for.png"
  },
  "/memes/thomas-sowell/what-multiculturalism-boils-down-to.png": {
    "type": "image/png",
    "etag": "\"170b91-+jC+wNEXBagytlZOnlwjvbrWy9s\"",
    "mtime": "2025-06-24T17:23:22.265Z",
    "size": 1510289,
    "path": "../public/memes/thomas-sowell/what-multiculturalism-boils-down-to.png"
  },
  "/memes/thomas-sowell/when-i-was-growing-up-we-were-taught.png": {
    "type": "image/png",
    "etag": "\"16ac3b-zqV5a6S4GKnEOCA5q/x/iFzH7fQ\"",
    "mtime": "2025-06-24T17:23:22.268Z",
    "size": 1485883,
    "path": "../public/memes/thomas-sowell/when-i-was-growing-up-we-were-taught.png"
  },
  "/memes/thomas-sowell/when-it-is-proclaimed-that-one-must-become-more.png": {
    "type": "image/png",
    "etag": "\"cf9dd-ziX3/Q3BD7mBmmNylt85ZWBUtMw\"",
    "mtime": "2025-06-24T17:23:22.266Z",
    "size": 850397,
    "path": "../public/memes/thomas-sowell/when-it-is-proclaimed-that-one-must-become-more.png"
  },
  "/memes/thomas-sowell/when-you-import-people-you-import-cultures.png": {
    "type": "image/png",
    "etag": "\"884d5-2bMjMHQHhYE2eJrKvDS74/ppmgk\"",
    "mtime": "2025-06-24T17:23:22.271Z",
    "size": 558293,
    "path": "../public/memes/thomas-sowell/when-you-import-people-you-import-cultures.png"
  },
  "/memes/thomas-sowell/when-you-want-to-help-people-you-tell-them-the-truth.png": {
    "type": "image/png",
    "etag": "\"b7e5f-QnXusVwhr9vXb5OVHG/BlY4+rKg\"",
    "mtime": "2025-06-24T17:23:22.271Z",
    "size": 753247,
    "path": "../public/memes/thomas-sowell/when-you-want-to-help-people-you-tell-them-the-truth.png"
  },
  "/memes/thomas-sowell/you-have-to-have-a-sense-of-humor-if-you-follow-politics.png": {
    "type": "image/png",
    "etag": "\"39bd3-I3x0FtJ9Yri9vLcR28a4K2WFmbA\"",
    "mtime": "2025-06-24T17:23:22.270Z",
    "size": 236499,
    "path": "../public/memes/thomas-sowell/you-have-to-have-a-sense-of-humor-if-you-follow-politics.png"
  },
  "/_nuxt/builds/meta/ce94bca9-a4ce-413a-8013-1f4369f224dc.json": {
    "type": "application/json",
    "etag": "\"128-xFBM49GViKBP50QtboOxhXMaO24\"",
    "mtime": "2025-06-24T17:23:21.457Z",
    "size": 296,
    "path": "../public/_nuxt/builds/meta/ce94bca9-a4ce-413a-8013-1f4369f224dc.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _EkOEB2 = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _SxA8c9 = defineEventHandler(() => {});

const _7dKCuM = eventHandler(async (event) => {
  const collection = getRouterParam(event, "collection");
  setHeader(event, "Content-Type", "text/plain");
  const data = await useStorage().getItem(`build:content:database.compressed.mjs`) || "";
  if (data) {
    const lineStart = `export const ${collection} = "`;
    const content = String(data).split("\n").find((line) => line.startsWith(lineStart));
    if (content) {
      return content.substring(lineStart.length, content.length - 1);
    }
  }
  return await import('../build/database.compressed.mjs').then((m) => m[collection]);
});

async function decompressSQLDump(base64Str, compressionType = "gzip") {
  const binaryData = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
  const response = new Response(new Blob([binaryData]));
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType));
  const decompressedText = await new Response(decompressedStream).text();
  return decompressedText.split("\n");
}

const checksums = {
  "claims": "v3.5.0--ncSntnoOYbuWEsUVfbYMU-spDwyFoSaOyO_0tV3UhzM",
  "quotes": "v3.5.0--aTqS14fKbHECEoKWnzc21qVSAApVfr6c6mFvti7ydGk",
  "memes": "v3.5.0--sE5wBnE9Dz2mpdVe_swvWpZS1ook9DWoTXePXRA9AvA"
};
const checksumsStructure = {
  "claims": "6dWk8M7axknLqL9igW_-SjCioTdrPkjJHeclOdOXLJM",
  "quotes": "W-EVotDwsiw3OcPVUe1KZ3J2TCKRXfMa9fSMh7fLhPY",
  "memes": "7iTHqDEHryIFjDg-UahsUH1ljgZ7dcVYtLJC8L3Iqew"
};
const tables = {
  "claims": "_content_claims",
  "quotes": "_content_quotes",
  "memes": "_content_memes",
  "info": "_content_info"
};
const contentManifest = {
  "claims": {
    "type": "page",
    "fields": {
      "id": "string",
      "stem": "string",
      "extension": "string",
      "meta": "json",
      "path": "string",
      "title": "string",
      "description": "string",
      "seo": "json",
      "body": "json",
      "navigation": "json"
    }
  },
  "quotes": {
    "type": "page",
    "fields": {
      "id": "string",
      "stem": "string",
      "extension": "string",
      "meta": "json",
      "path": "string",
      "title": "string",
      "description": "string",
      "seo": "json",
      "body": "json",
      "navigation": "json"
    }
  },
  "memes": {
    "type": "page",
    "fields": {
      "id": "string",
      "stem": "string",
      "extension": "string",
      "meta": "json",
      "path": "string",
      "title": "string",
      "description": "string",
      "seo": "json",
      "body": "json",
      "navigation": "json"
    }
  },
  "info": {
    "type": "data",
    "fields": {}
  }
};

async function fetchDatabase(event, collection) {
  return await $fetch(`/__nuxt_content/${collection}/sql_dump`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    responseType: "text",
    headers: { "content-type": "text/plain" },
    query: { v: checksums[String(collection)], t: void 0 }
  });
}

function refineContentFields(sql, doc) {
  const fields = findCollectionFields(sql);
  const item = { ...doc };
  for (const key in item) {
    if (fields[key] === "json" && item[key] && item[key] !== "undefined") {
      item[key] = JSON.parse(item[key]);
    }
    if (fields[key] === "boolean" && item[key] !== "undefined") {
      item[key] = Boolean(item[key]);
    }
  }
  for (const key in item) {
    if (item[key] === "NULL") {
      item[key] = void 0;
    }
  }
  return item;
}
function findCollectionFields(sql) {
  const table = sql.match(/FROM\s+(\w+)/);
  if (!table) {
    return {};
  }
  const info = contentManifest[getCollectionName(table[1])];
  return info?.fields || {};
}
function getCollectionName(table) {
  return table.replace(/^_content_/, "");
}

class BoundableStatement {
  _statement;
  constructor(rawStmt) {
    this._statement = rawStmt;
  }
  bind(...params) {
    return new BoundStatement(this, params);
  }
}
class BoundStatement {
  #statement;
  #params;
  constructor(statement, params) {
    this.#statement = statement;
    this.#params = params;
  }
  bind(...params) {
    return new BoundStatement(this.#statement, params);
  }
  all() {
    return this.#statement.all(...this.#params);
  }
  run() {
    return this.#statement.run(...this.#params);
  }
  get() {
    return this.#statement.get(...this.#params);
  }
}

function sqliteConnector(opts) {
  let _db;
  const getDB = () => {
    if (_db) {
      return _db;
    }
    if (opts.name === ":memory:") {
      _db = new Database(":memory:");
      return _db;
    }
    const filePath = resolve$1(
      opts.cwd || ".",
      opts.path || `.data/${opts.name || "db"}.sqlite3`
    );
    mkdirSync(dirname$1(filePath), { recursive: true });
    _db = new Database(filePath);
    return _db;
  };
  return {
    name: "sqlite",
    dialect: "sqlite",
    getInstance: () => getDB(),
    exec: (sql) => getDB().exec(sql),
    prepare: (sql) => new StatementWrapper(() => getDB().prepare(sql))
  };
}
class StatementWrapper extends BoundableStatement {
  async all(...params) {
    return this._statement().all(...params);
  }
  async run(...params) {
    const res = this._statement().run(...params);
    return { success: res.changes > 0, ...res };
  }
  async get(...params) {
    return this._statement().get(...params);
  }
}

let db;
function loadDatabaseAdapter(config) {
  const { database, localDatabase } = config;
  if (!db) {
    if (["nitro-prerender", "nitro-dev"].includes("node-server")) {
      db = sqliteConnector(refineDatabaseConfig(localDatabase));
    } else {
      db = sqliteConnector(refineDatabaseConfig(database));
    }
  }
  return {
    all: async (sql, params = []) => {
      return db.prepare(sql).all(...params).then((result) => (result || []).map((item) => refineContentFields(sql, item)));
    },
    first: async (sql, params = []) => {
      return db.prepare(sql).get(...params).then((item) => item ? refineContentFields(sql, item) : item);
    },
    exec: async (sql, params = []) => {
      return db.prepare(sql).run(...params);
    }
  };
}
const checkDatabaseIntegrity = {};
const integrityCheckPromise = {};
async function checkAndImportDatabaseIntegrity(event, collection, config) {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false;
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], checksumsStructure[String(collection)], config).then((isValid) => {
      checkDatabaseIntegrity[String(collection)] = !isValid;
    }).catch((error) => {
      console.error("Database integrity check failed", error);
      checkDatabaseIntegrity[String(collection)] = true;
      integrityCheckPromise[String(collection)] = null;
    });
  }
  if (integrityCheckPromise[String(collection)]) {
    await integrityCheckPromise[String(collection)];
  }
}
async function _checkAndImportDatabaseIntegrity(event, collection, integrityVersion, structureIntegrityVersion, config) {
  const db2 = loadDatabaseAdapter(config);
  const before = await db2.first(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => null);
  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    await db2.exec(`DROP TABLE IF EXISTS ${tables.info}`);
    before.version = "";
  }
  const unchangedStructure = before?.structureVersion === structureIntegrityVersion;
  if (before?.version) {
    if (before.version === integrityVersion) {
      if (before.ready) {
        return true;
      }
      await waitUntilDatabaseIsReady(db2, collection);
      return true;
    }
    await db2.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]);
    if (!unchangedStructure) {
      await db2.exec(`DROP TABLE IF EXISTS ${tables[collection]}`);
    }
  }
  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump);
  const dumpLinesHash = dump.map((row) => row.split(" -- ").pop());
  let hashesInDb = /* @__PURE__ */ new Set();
  if (unchangedStructure) {
    const hashListFromTheDump = new Set(dumpLinesHash);
    const hashesInDbRecords = await db2.all(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => []);
    hashesInDb = new Set(hashesInDbRecords.map((r) => r.__hash__));
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump);
    if (hashesToDelete.size) {
      await db2.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill("?").join(",")})`, Array.from(hashesToDelete));
    }
  }
  await dump.reduce(async (prev, sql, index) => {
    await prev;
    const hash = dumpLinesHash[index];
    const statement = sql.substring(0, sql.length - hash.length - 4);
    if (unchangedStructure) {
      if (hash === "structure") {
        return Promise.resolve();
      }
      if (hashesInDb.has(hash)) {
        return Promise.resolve();
      }
    }
    await db2.exec(statement).catch((err) => {
      const message = err.message || "Unknown error";
      console.error(`Failed to execute SQL ${sql}: ${message}`);
    });
  }, Promise.resolve());
  const after = await db2.first(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: "" }));
  return after?.version === integrityVersion;
}
const REQUEST_TIMEOUT = 90;
async function waitUntilDatabaseIsReady(db2, collection) {
  let iterationCount = 0;
  let interval;
  await new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      const row = await db2.first(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ ready: true }));
      if (row?.ready) {
        clearInterval(interval);
        resolve(0);
      }
      if (iterationCount++ > REQUEST_TIMEOUT) {
        clearInterval(interval);
        reject(new Error("Waiting for another database initialization timed out"));
      }
    }, 1e3);
  }).catch((e) => {
    throw e;
  }).finally(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
}
async function loadDatabaseDump(event, collection) {
  return await fetchDatabase(event, String(collection)).catch((e) => {
    console.error("Failed to fetch compressed dump", e);
    return "";
  });
}
function refineDatabaseConfig(config) {
  if (config.type === "d1") {
    return { ...config, bindingName: config.bindingName || config.binding };
  }
  if (config.type === "sqlite") {
    const _config = { ...config };
    if (config.filename === ":memory:") {
      return { name: "memory" };
    }
    if ("filename" in config) {
      const filename = isAbsolute(config?.filename || "") || config?.filename === ":memory:" ? config?.filename : new URL(config.filename, globalThis._importMeta_.url).pathname;
      _config.path = process.platform === "win32" && filename.startsWith("/") ? filename.slice(1) : filename;
    }
    return _config;
  }
  return config;
}

const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i;
const SQL_COUNT_REGEX = /COUNT\((DISTINCT )?([a-z_]\w+|\*)\)/i;
const SQL_SELECT_REGEX = /^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/;
function assertSafeQuery(sql, collection) {
  if (!sql) {
    throw new Error("Invalid query");
  }
  const cleanedupQuery = cleanupQuery(sql);
  if (cleanedupQuery !== sql) {
    throw new Error("Invalid query");
  }
  const match = sql.match(SQL_SELECT_REGEX);
  if (!match) {
    throw new Error("Invalid query");
  }
  const [_, select, from, where, orderBy, order, limit, offset] = match;
  const columns = select.trim().split(", ");
  if (columns.length === 1) {
    if (columns[0] !== "*" && !columns[0].match(SQL_COUNT_REGEX) && !columns[0].match(/^"[a-z_]\w+"$/i)) {
      throw new Error("Invalid query");
    }
  } else if (!columns.every((column) => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error("Invalid query");
  }
  if (from !== `_content_${collection}`) {
    throw new Error("Invalid query");
  }
  if (where) {
    if (!where.startsWith(" WHERE (") || !where.endsWith(")")) {
      throw new Error("Invalid query");
    }
    const noString = cleanupQuery(where, { removeString: true });
    if (noString.match(SQL_COMMANDS)) {
      throw new Error("Invalid query");
    }
  }
  const _order = (orderBy + " " + order).split(", ");
  if (!_order.every((column) => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
    throw new Error("Invalid query");
  }
  if (limit !== void 0 && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error("Invalid query");
  }
  if (offset !== void 0 && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error("Invalid query");
  }
  return true;
}
function cleanupQuery(query, options = { removeString: false }) {
  let inString = false;
  let stringFence = "";
  let result = "";
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prevChar = query[i - 1];
    const nextChar = query[i + 1];
    if (char === "'" || char === '"') {
      if (!options?.removeString) {
        result += char;
        continue;
      }
      if (inString) {
        if (char !== stringFence || nextChar === stringFence || prevChar === stringFence) {
          continue;
        }
        inString = false;
        stringFence = "";
        continue;
      } else {
        inString = true;
        stringFence = char;
        continue;
      }
    }
    if (!inString) {
      if (char === "-" && nextChar === "-") {
        return result;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < query.length && !(query[i] === "*" && query[i + 1] === "/")) {
          i += 1;
        }
        i += 2;
        continue;
      }
      result += char;
    }
  }
  return result;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const _MojEM8 = eventHandler(async (event) => {
  const { sql } = await readBody(event);
  const collection = getRouterParam(event, "collection");
  assertSafeQuery(sql, collection);
  const conf = useRuntimeConfig().content;
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf);
  }
  return loadDatabaseAdapter(conf).all(sql);
});

const _lazy_UITgJD = () => import('../routes/api/content-item.mjs');
const _lazy_VkkVdw = () => import('../routes/api/content.mjs');
const _lazy_862YuX = () => import('../routes/api/content/debug.mjs');
const _lazy_DApUBP = () => import('../routes/api/content/item.get.mjs');
const _lazy_Id3UyK = () => import('../routes/api/content/search.mjs');
const _lazy_0n3a19 = () => import('../routes/api/search.mjs');
const _lazy_vudxzG = () => import('../routes/.well-known/appspecific/com.chrome.devtools.json.mjs');
const _lazy_XoLYtK = () => import('../routes/well-known.mjs');
const _lazy_zvwZFb = () => import('../routes/renderer.mjs');

const handlers = [
  { route: '', handler: _EkOEB2, lazy: false, middleware: true, method: undefined },
  { route: '/api/content-item', handler: _lazy_UITgJD, lazy: true, middleware: false, method: undefined },
  { route: '/api/content', handler: _lazy_VkkVdw, lazy: true, middleware: false, method: undefined },
  { route: '/api/content/debug', handler: _lazy_862YuX, lazy: true, middleware: false, method: undefined },
  { route: '/api/content/item', handler: _lazy_DApUBP, lazy: true, middleware: false, method: "get" },
  { route: '/api/content/search', handler: _lazy_Id3UyK, lazy: true, middleware: false, method: undefined },
  { route: '/api/search', handler: _lazy_0n3a19, lazy: true, middleware: false, method: undefined },
  { route: '/.well-known/appspecific/com.chrome.devtools.json', handler: _lazy_vudxzG, lazy: true, middleware: false, method: undefined },
  { route: '/well-known', handler: _lazy_XoLYtK, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_zvwZFb, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/sql_dump', handler: _7dKCuM, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/query', handler: _MojEM8, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_zvwZFb, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return O(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { getResponseStatusText as a, buildAssetsURL as b, createError$1 as c, defineEventHandler as d, getResponseStatus as e, defineRenderHandler as f, getQuery as g, getRouteRules as h, useNitroApp as i, nodeServer as n, publicAssetsURL as p, useRuntimeConfig as u };
//# sourceMappingURL=nitro.mjs.map
