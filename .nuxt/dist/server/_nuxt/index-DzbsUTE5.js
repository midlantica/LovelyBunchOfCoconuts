import { mergeProps, useSSRContext, ref, watch, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, Fragment, computed, renderSlot, inject, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderTeleport, ssrRenderStyle, ssrRenderSlot, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
import { _ as _imports_0, a as _imports_1 } from "./player_icon-BVgPiptf.js";
import __nuxt_component_0$1 from "./Icon-CT7HiOLN.js";
import { u as useContentCache } from "./useContentCache-BZl2BVqo.js";
import MarkdownIt from "markdown-it";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { withoutTrailingSlash } from "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import { t as tryUseNuxtApp } from "../server.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "./config-CcmVt8v2.js";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "node:http";
import "node:https";
import "node:zlib";
import "node:stream";
import "node:buffer";
import "node:util";
import "node:url";
import "node:net";
import "node:fs";
import "node:path";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "#internal/nuxt/paths";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/@unhead+vue@2.0.11_vue@3.5.17_typescript@5.8.3_/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main$8 = {
  __name: "CloseButton",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(`<button${ssrRenderAttrs(mergeProps({
        class: "hidden sm:block top-1 right-1 z-10 absolute bg-slate-800 hover:bg-slate-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white -translate-y-1/2 translate-x-1/2",
        "aria-label": "Close",
        type: "button"
      }, _attrs))} data-v-14fedde9>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:x-mark-solid",
        size: "2.025rem",
        class: "text-white"
      }, null, _parent));
      _push(`</button>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CloseButton.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-14fedde9"]]);
const _sfc_main$7 = {
  __name: "ModalFrame",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, default: false },
    modalStyle: { type: Object, default: null }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const onClose = () => emit("close");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CloseButton = __nuxt_component_0;
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.show) {
          _push2(`<div class="z-50 fixed inset-0 flex justify-center items-center bg-black/80 modal-overlay"><div class="relative flex flex-col bg-slate-800 shadow-lg mx-6 rounded-lg min-w-[60vw] max-w-[500px] modal-frame" style="${ssrRenderStyle(__props.modalStyle ? __props.modalStyle : { maxHeight: "90vh", padding: "1rem 1.75rem" })}">`);
          _push2(ssrRenderComponent(_component_CloseButton, { onClick: onClose }, null, _parent));
          _push2(`<div class="w-full overflow-y-auto">`);
          ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent);
          _push2(`</div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "#modal-root", false, _parent);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalFrame.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = {
  __name: "ClaimDetailModal",
  __ssrInlineRender: true,
  props: {
    slug: { type: String, required: true },
    show: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const claim = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const markdownContent = ref("");
    const { getContentItem } = useContentCache();
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const close = () => emit("close");
    const loadClaim = async () => {
      loading.value = true;
      error.value = null;
      claim.value = null;
      markdownContent.value = "";
      try {
        const cleanSlug = props.slug.replace(/^\/*claims\//, "").replace(/^\/*/, "");
        const found = await getContentItem("claims", cleanSlug);
        if (found && !found.error) {
          claim.value = found;
          if (found.body) {
            let content = found.body.replace(/^---[\s\S]*?---/, "").trim();
            markdownContent.value = md.render(content);
          }
        } else {
          error.value = (found == null ? void 0 : found.message) || "🚨 Claim not found!";
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    watch(() => props.slug, loadClaim, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(ssrRenderComponent(_sfc_main$7, mergeProps({
        show: __props.show,
        onClose: close
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col w-full overflow-y-auto" data-v-ab5156c2${_scopeId}><div class="flex-1 min-h-0 overflow-y-auto" data-v-ab5156c2${_scopeId}>`);
            if (loading.value) {
              _push2(`<div class="flex flex-1 justify-center items-center py-8 text-white text-center" data-v-ab5156c2${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "svg-spinners:90-ring-with-bg",
                size: "2rem"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (error.value) {
              _push2(`<div class="flex flex-1 justify-center items-center py-8 text-red-500 text-center" data-v-ab5156c2${_scopeId}>${ssrInterpolate(error.value)}</div>`);
            } else if (claim.value) {
              _push2(`<div class="flex flex-col flex-1 min-h-0" data-v-ab5156c2${_scopeId}><div class="pb-2" data-v-ab5156c2${_scopeId}><div class="prose-invert max-w-none prose prose-lg" data-v-ab5156c2${_scopeId}><div data-v-ab5156c2${_scopeId}>${markdownContent.value ?? ""}</div></div></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col w-full overflow-y-auto" }, [
                createVNode("div", { class: "flex-1 min-h-0 overflow-y-auto" }, [
                  loading.value ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex flex-1 justify-center items-center py-8 text-white text-center"
                  }, [
                    createVNode(_component_Icon, {
                      name: "svg-spinners:90-ring-with-bg",
                      size: "2rem"
                    })
                  ])) : error.value ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "flex flex-1 justify-center items-center py-8 text-red-500 text-center"
                  }, toDisplayString(error.value), 1)) : claim.value ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "flex flex-col flex-1 min-h-0"
                  }, [
                    createVNode("div", { class: "pb-2" }, [
                      createVNode("div", { class: "prose-invert max-w-none prose prose-lg" }, [
                        createVNode("div", { innerHTML: markdownContent.value }, null, 8, ["innerHTML"])
                      ])
                    ])
                  ])) : createCommentVNode("", true)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ClaimDetailModal.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const ClaimDetailModal = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-ab5156c2"]]);
const _sfc_main$5 = {
  __name: "ClaimTranslationPanel",
  __ssrInlineRender: true,
  props: {
    claim: Object,
    slug: String
  },
  setup(__props) {
    const showModal = ref(false);
    const closeModal = () => showModal.value = false;
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.claim && __props.claim.claim && __props.claim.translation && __props.slug) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] px-4 py-3 border hover:border hover:border-seagull-400 border-transparent rounded-lg h-full text-white transition-colors cursor-pointer" }, _attrs))}><div class="my-auto"><div class="flex items-center gap-3"><img${ssrRenderAttr("src", _imports_0)} alt="NPC" class="w-8"><h2 class="font-light text-xl line-clamp-1 tracking-wide">${ssrInterpolate(__props.claim.claim)}</h2></div><hr class="my-2 border-white/10 border-t"><div class="flex items-center gap-3"><img${ssrRenderAttr("src", _imports_1)} alt="Player" class="w-8">`);
        if (__props.claim.translation) {
          _push(`<h2 class="font-light text-xl line-clamp-1 tracking-wide">${ssrInterpolate(__props.claim.translation)}</h2>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (showModal.value) {
          _push(ssrRenderComponent(ClaimDetailModal, {
            slug: __props.slug,
            show: showModal.value,
            onClose: closeModal
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-2 bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] px-4 py-3 rounded-lg h-full text-white" }, _attrs))}><div class="my-auto"><div class="flex items-center gap-3"><img${ssrRenderAttr("src", _imports_0)} alt="NPC" class="w-8"><h2 class="line-clamp-1">${ssrInterpolate(__props.claim && __props.claim.claim ? __props.claim.claim : "Missing claim")}</h2></div><hr class="my-2 border-white/10 border-t"><div class="flex items-center gap-3"><img${ssrRenderAttr("src", _imports_1)} alt="Player" class="w-8">`);
        if (__props.claim && __props.claim.translation) {
          _push(`<h2 class="line-clamp-1">${ssrInterpolate(__props.claim.translation)}</h2>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      }
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ClaimTranslationPanel.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = {
  __name: "QuoteDetailModal",
  __ssrInlineRender: true,
  props: {
    slug: { type: String, required: true },
    show: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const quote = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const markdownContent = ref("");
    const quoteBodyHtml = ref("");
    const { getContentItem } = useContentCache();
    const md = new MarkdownIt({
      html: true,
      // Allow HTML tags in source
      linkify: true,
      typographer: true
    });
    const close = () => emit("close");
    const loadQuote = async () => {
      loading.value = true;
      error.value = null;
      quote.value = null;
      markdownContent.value = "";
      quoteBodyHtml.value = "";
      try {
        const cleanSlug = props.slug.replace(/^\/*quotes\//, "").replace(/^\/*/, "");
        const found = await getContentItem("quotes", cleanSlug);
        if (found && !found.error) {
          quote.value = found;
          if (found.body) {
            let content = found.body.replace(/^---[\s\S]*?---/, "").trim();
            const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
            let attribution = "";
            let lastHeadingIdx = -1;
            for (let i = lines.length - 1; i >= 0; i--) {
              if (!lines[i].startsWith("##")) {
                attribution = lines[i];
                lastHeadingIdx = i - 1;
                break;
              }
            }
            const quoteLines = lines.slice(0, lastHeadingIdx + 1);
            const quoteBody = quoteLines.join("\n");
            quoteBodyHtml.value = md.render(quoteBody);
            quote.value.attribution = attribution;
            markdownContent.value = md.render(content);
          }
        } else {
          error.value = (found == null ? void 0 : found.message) || "🚨 Quote not found!";
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    watch(() => props.slug, loadQuote, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(ssrRenderComponent(_sfc_main$7, mergeProps({
        show: __props.show,
        onClose: close
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (loading.value) {
              _push2(`<div class="flex flex-1 justify-center items-center py-8 text-white text-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "svg-spinners:90-ring-with-bg",
                size: "2rem"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (error.value) {
              _push2(`<div class="flex flex-1 justify-center items-center py-8 text-red-500 text-center"${_scopeId}>${ssrInterpolate(error.value)}</div>`);
            } else if (quote.value) {
              _push2(`<div class="flex flex-col flex-1 min-h-0"${_scopeId}><div class="pb-2"${_scopeId}><div class="prose-invert max-w-none text-left prose prose-sm"${_scopeId}><div${_scopeId}>${quoteBodyHtml.value ?? ""}</div></div>`);
              if (quote.value.attribution) {
                _push2(`<p class="mt-2 font-light text-seagull-200 text-lg"${_scopeId}> — ${ssrInterpolate(quote.value.attribution)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
              if (markdownContent.value.split("<hr>")[1] && markdownContent.value.split("<hr>")[1].trim()) {
                _push2(`<!--[--><hr class="my-2 border-white/10 border-t"${_scopeId}><div class="flex-1 bg-slate-800 py-2 rounded-b-lg min-h-0 overflow-y-auto" style="${ssrRenderStyle({ "max-height": "40vh" })}"${_scopeId}><div class="prose-invert max-w-none text-seagull-200 prose prose-sm"${_scopeId}><div class="text-seagull-200 quote-explanation-text"${_scopeId}>${markdownContent.value.split("<hr>")[1] ?? ""}</div></div></div><!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              loading.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "flex flex-1 justify-center items-center py-8 text-white text-center"
              }, [
                createVNode(_component_Icon, {
                  name: "svg-spinners:90-ring-with-bg",
                  size: "2rem"
                })
              ])) : error.value ? (openBlock(), createBlock("div", {
                key: 1,
                class: "flex flex-1 justify-center items-center py-8 text-red-500 text-center"
              }, toDisplayString(error.value), 1)) : quote.value ? (openBlock(), createBlock("div", {
                key: 2,
                class: "flex flex-col flex-1 min-h-0"
              }, [
                createVNode("div", { class: "pb-2" }, [
                  createVNode("div", { class: "prose-invert max-w-none text-left prose prose-sm" }, [
                    createVNode("div", { innerHTML: quoteBodyHtml.value }, null, 8, ["innerHTML"])
                  ]),
                  quote.value.attribution ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "mt-2 font-light text-seagull-200 text-lg"
                  }, " — " + toDisplayString(quote.value.attribution), 1)) : createCommentVNode("", true)
                ]),
                markdownContent.value.split("<hr>")[1] && markdownContent.value.split("<hr>")[1].trim() ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createVNode("hr", { class: "my-2 border-white/10 border-t" }),
                  createVNode("div", {
                    class: "flex-1 bg-slate-800 py-2 rounded-b-lg min-h-0 overflow-y-auto",
                    style: { "max-height": "40vh" }
                  }, [
                    createVNode("div", { class: "prose-invert max-w-none text-seagull-200 prose prose-sm" }, [
                      createVNode("div", {
                        innerHTML: markdownContent.value.split("<hr>")[1],
                        class: "text-seagull-200 quote-explanation-text"
                      }, null, 8, ["innerHTML"])
                    ])
                  ])
                ], 64)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/QuoteDetailModal.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: "QuotePanel",
  __ssrInlineRender: true,
  props: {
    quote: Object,
    slug: String
  },
  setup(__props) {
    const showModal = ref(false);
    const closeModal = () => showModal.value = false;
    function formatQuote(text) {
      return text.replace(/&lt;wbr&gt;/g, "<wbr>").replace(/<wbr>/g, "<wbr>");
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.quote && __props.quote.headings && __props.quote.headings.length > 0 && __props.slug) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-2 bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] px-6 py-4 border hover:border hover:border-seagull-400 border-transparent rounded-lg text-white cursor-pointer quotePanel" }, _attrs))}><div class="flex flex-col flex-wrap gap-0.5 my-auto"><h1 class="inline-block font-light text-xl align-baseline tracking-wide">${formatQuote(__props.quote.headings[0]) ?? ""}</h1>`);
        if (__props.quote.attribution) {
          _push(`<p class="inline-block font-light text-seagull-200 text-lg align-baseline tracking-wide"> — ${ssrInterpolate(__props.quote.attribution)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (showModal.value) {
          _push(ssrRenderComponent(_sfc_main$4, {
            slug: __props.slug,
            show: showModal.value,
            onClose: closeModal
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-2 bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] px-5 py-4 rounded-lg text-white quotePanel" }, _attrs))}><div class="my-auto"><h2 class="inline-block align-baseline">${ssrInterpolate(__props.quote && __props.quote.headings && __props.quote.headings.length > 0 ? `“${__props.quote.headings[0]}”` : "🚨 No quote found!")}</h2>`);
        if (__props.quote && __props.quote.attribution) {
          _push(`<p class="inline-block font-light text-seagull-200 text-lg align-baseline"> — ${ssrInterpolate(__props.quote.attribution)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/QuotePanel.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
function useModalLogic({ show, onClose }) {
  const isOpen = ref(show);
  return {
    isOpen,
    close: onClose
  };
}
function useModalSizing(imageUrlRef) {
  const imageNatural = ref({ width: 1, height: 1 });
  const viewport = ref({ width: 0, height: 0 });
  const aspect = computed(() => {
    const w = imageNatural.value.width;
    const h = imageNatural.value.height;
    return w / h;
  });
  const modalLayout = computed(() => {
    return {
      width: "90vw",
      height: "90vh",
      flexDirection: "column"
    };
  });
  return {
    imageNatural,
    aspect,
    modalLayout,
    viewport
  };
}
const checksums = {
  "claims": "v3.5.0--9TDlm67x4mY6MY2rs85FT0QyP68jSvbhxOOy8-80bf4",
  "quotes": "v3.5.0--YdDX2AphLssyVFmRQSpusa3OyX_FIVHe8XDKxHGLx-s",
  "memes": "v3.5.0--inThamuldj3MesKG0d8BOFpTzuF4LhHZn5fFyxx2yc0"
};
const tables = {
  "claims": "_content_claims",
  "quotes": "_content_quotes",
  "memes": "_content_memes",
  "info": "_content_info"
};
const buildGroup = (group, type) => {
  const conditions = group._conditions;
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : "";
};
const collectionQueryGroup = (collection) => {
  const conditions = [];
  const query = {
    // @ts-expect-error -- internal
    _conditions: conditions,
    where(field, operator, value) {
      let condition;
      switch (operator.toUpperCase()) {
        case "IN":
        case "NOT IN":
          if (Array.isArray(value)) {
            const values = value.map((val) => singleQuote(val)).join(", ");
            condition = `"${String(field)}" ${operator.toUpperCase()} (${values})`;
          } else {
            throw new TypeError(`Value for ${operator} must be an array`);
          }
          break;
        case "BETWEEN":
        case "NOT BETWEEN":
          if (Array.isArray(value) && value.length === 2) {
            condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value[0])} AND ${singleQuote(value[1])}`;
          } else {
            throw new Error(`Value for ${operator} must be an array with two elements`);
          }
          break;
        case "IS NULL":
        case "IS NOT NULL":
          condition = `"${String(field)}" ${operator.toUpperCase()}`;
          break;
        case "LIKE":
        case "NOT LIKE":
          condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value)}`;
          break;
        default:
          condition = `"${String(field)}" ${operator} ${singleQuote(typeof value === "boolean" ? Number(value) : value)}`;
      }
      conditions.push(`${condition}`);
      return query;
    },
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "OR"));
      return query;
    }
  };
  return query;
};
const collectionQueryBuilder = (collection, fetch) => {
  const params = {
    conditions: [],
    selectedFields: [],
    offset: 0,
    limit: 0,
    orderBy: [],
    // Count query
    count: {
      field: "",
      distinct: false
    }
  };
  const query = {
    // @ts-expect-error -- internal
    __params: params,
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "OR"));
      return query;
    },
    path(path) {
      return query.where("path", "=", withoutTrailingSlash(path));
    },
    skip(skip) {
      params.offset = skip;
      return query;
    },
    where(field, operator, value) {
      query.andWhere((group) => group.where(String(field), operator, value));
      return query;
    },
    limit(limit) {
      params.limit = limit;
      return query;
    },
    select(...fields) {
      if (fields.length) {
        params.selectedFields.push(...fields);
      }
      return query;
    },
    order(field, direction) {
      params.orderBy.push(`"${String(field)}" ${direction}`);
      return query;
    },
    async all() {
      return fetch(collection, buildQuery()).then((res) => res || []);
    },
    async first() {
      return fetch(collection, buildQuery({ limit: 1 })).then((res) => res[0] || null);
    },
    async count(field = "*", distinct = false) {
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct }
      })).then((m) => m[0].count);
    }
  };
  function buildQuery(opts = {}) {
    let query2 = "SELECT ";
    if (opts == null ? void 0 : opts.count) {
      query2 += `COUNT(${opts.count.distinct ? "DISTINCT " : ""}${opts.count.field}) as count`;
    } else {
      const fields = Array.from(new Set(params.selectedFields));
      query2 += fields.length > 0 ? fields.map((f) => `"${String(f)}"`).join(", ") : "*";
    }
    query2 += ` FROM ${tables[String(collection)]}`;
    if (params.conditions.length > 0) {
      query2 += ` WHERE ${params.conditions.join(" AND ")}`;
    }
    if (params.orderBy.length > 0) {
      query2 += ` ORDER BY ${params.orderBy.join(", ")}`;
    } else {
      query2 += ` ORDER BY stem ASC`;
    }
    const limit = (opts == null ? void 0 : opts.limit) || params.limit;
    if (limit > 0) {
      if (params.offset > 0) {
        query2 += ` LIMIT ${limit} OFFSET ${params.offset}`;
      } else {
        query2 += ` LIMIT ${limit}`;
      }
    }
    return query2;
  }
  return query;
};
function singleQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}
async function fetchQuery(event, collection, sql) {
  var _a, _b, _c;
  return await $fetch(`/__nuxt_content/${collection}/query`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: {
      "content-type": "application/json",
      ...((_c = (_b = (_a = event == null ? void 0 : event.node) == null ? void 0 : _a.req) == null ? void 0 : _b.headers) == null ? void 0 : _c.cookie) ? { cookie: event.node.req.headers.cookie } : {}
    },
    query: { v: checksums[String(collection)], t: void 0 },
    method: "POST",
    body: {
      sql
    }
  });
}
const queryCollection = (collection) => {
  var _a, _b;
  const event = (_b = (_a = tryUseNuxtApp()) == null ? void 0 : _a.ssrContext) == null ? void 0 : _b.event;
  return collectionQueryBuilder(collection, (collection2, sql) => executeContentQuery(event, collection2, sql));
};
async function executeContentQuery(event, collection, sql) {
  {
    return fetchQuery(event, String(collection), sql);
  }
}
const _sfc_main$2 = {
  __name: "MemeDetailModal",
  __ssrInlineRender: true,
  props: {
    slug: { type: String, required: true },
    show: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const meme = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const markdownContent = ref("");
    const isLandscape = ref(false);
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const close = () => emit("close");
    useModalLogic({ show: props.show, onClose: close });
    computed(() => meme.value && meme.value.image ? meme.value.image : "");
    const { imageNatural, modalLayout } = useModalSizing();
    const loadMeme = async () => {
      loading.value = true;
      error.value = null;
      meme.value = null;
      markdownContent.value = "";
      try {
        const cleanSlug = props.slug.replace(/^\/*memes\//, "").replace(/^\/*/, "");
        const found = await queryCollection("memes").where({ slug: cleanSlug }).fetch();
        if (found.length > 0) {
          meme.value = found[0];
          if (meme.value.body) {
            markdownContent.value = md.render(meme.value.body);
          }
        } else {
          error.value = "🚨 Meme not found!";
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    watch(() => props.slug, loadMeme, { immediate: true });
    function getAboveHr(html) {
      if (!html) return "";
      const idx = html.indexOf("<hr");
      if (idx === -1) return html;
      return html.slice(0, idx);
    }
    function getBelowHr(html) {
      if (!html) return "";
      const idx = html.indexOf("<hr");
      if (idx === -1) return "";
      const closeIdx = html.indexOf(">", idx);
      if (closeIdx === -1) return "";
      return html.slice(closeIdx + 1);
    }
    const modalFrameStyle = computed(() => {
      const { width, height } = modalLayout.value;
      return {
        width: width + "px",
        height: height + "px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
        boxSizing: "border-box"
      };
    });
    computed(() => {
      return {
        width: modalLayout.value.flexDirection === "row" ? "50%" : "100%",
        height: modalLayout.value.flexDirection === "row" ? "100%" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      };
    });
    computed(() => {
      const w = imageNatural.value.width;
      const h = imageNatural.value.height;
      if (!w || !h)
        return {
          maxWidth: "clamp(200px, 90vw, 1200px)",
          maxHeight: "clamp(200px, 90vh, 900px)",
          width: "auto",
          height: "auto",
          display: "block",
          margin: "0 auto",
          padding: "2rem"
        };
      const aspect2 = w / h;
      if (aspect2 > 1.2) {
        return {
          maxWidth: "clamp(200px, 90vw, 1200px)",
          maxHeight: "clamp(200px, 90vh, 900px)",
          width: "100%",
          height: "auto",
          display: "block",
          margin: "0 auto",
          padding: "2rem"
        };
      } else if (aspect2 < 0.8) {
        return {
          maxWidth: "clamp(200px, 90vw, 700px)",
          maxHeight: "clamp(200px, 90vh, 900px)",
          width: "auto",
          height: "100%",
          display: "block",
          margin: "0 auto",
          padding: "2rem"
        };
      } else {
        return {
          maxWidth: "clamp(200px, 90vw, 900px)",
          maxHeight: "clamp(200px, 90vh, 900px)",
          width: "auto",
          height: "auto",
          display: "block",
          margin: "0 auto",
          padding: "2rem"
        };
      }
    });
    computed(() => {
      return {
        minHeight: 0,
        overflowY: "auto",
        maxHeight: "100%",
        width: modalLayout.value.flexDirection === "row" ? "50%" : "100%",
        height: modalLayout.value.flexDirection === "row" ? "100%" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      };
    });
    watch(() => props.slug, loadMeme, { immediate: true });
    const hasExtraText = computed(() => {
      if (!markdownContent.value) return false;
      const idx = markdownContent.value.indexOf("<hr");
      if (idx === -1) return false;
      const closeIdx = markdownContent.value.indexOf(">", idx);
      if (closeIdx === -1) return false;
      return markdownContent.value.slice(closeIdx + 1).replace(/<[^>]+>/g, "").trim().length > 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(ssrRenderComponent(_sfc_main$7, mergeProps({
        show: __props.show,
        onClose: close,
        modalStyle: modalFrameStyle.value
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (loading.value) {
              _push2(`<div class="flex flex-1 justify-center items-center py-8 text-white text-center" data-v-bf2c896e${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "svg-spinners:90-ring-with-bg",
                size: "2rem"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (error.value) {
              _push2(`<div class="flex flex-1 justify-center items-center py-8 text-red-500 text-center" data-v-bf2c896e${_scopeId}>${ssrInterpolate(error.value)}</div>`);
            } else if (meme.value) {
              _push2(`<div data-v-bf2c896e${_scopeId}><div class="flex flex-col flex-1 justify-center items-center w-full h-full" data-v-bf2c896e${_scopeId}><div class="relative flex flex-col bg-slate-800 rounded-lg w-full h-full modal-frame" style="${ssrRenderStyle({ "max-width": "90vw", "max-height": "90vh", "min-width": "41vw", "height": "100%", "box-sizing": "border-box", "display": "flex", "flex-direction": "column", "align-items": "stretch", "justify-content": "flex-start", "margin": "auto" })}" data-v-bf2c896e${_scopeId}><div style="${ssrRenderStyle({ "width": "100%", "flex-shrink": "0", "display": "flex", "align-items": "flex-start", "justify-content": "center", "padding": "0", "margin": "0" })}" data-v-bf2c896e${_scopeId}>`);
              if (meme.value.image) {
                _push2(`<img${ssrRenderAttr("src", meme.value.image)}${ssrRenderAttr("alt", meme.value.title || "Meme")} class="${ssrRenderClass([!isLandscape.value ? "meme-modal-img-column" : "", "rounded object-contain"])}" style="${ssrRenderStyle(
                  isLandscape.value ? "max-width: 100%; max-height: 45vh; width: 100%; height: auto; display: block; margin: 0; padding: 0; object-fit: contain; object-position: top;" : "max-width: 100%; width: 100%; height: auto; display: block; margin: 0; padding: 0; object-fit: contain; object-position: top;"
                )}" data-v-bf2c896e${_scopeId}>`);
              } else {
                _push2(`<div class="py-4 text-red-400" data-v-bf2c896e${_scopeId}>🚨 Meme image not found!</div>`);
              }
              _push2(`</div>`);
              if (hasExtraText.value) {
                _push2(`<div class="${ssrRenderClass([
                  "flex flex-1 items-stretch w-full text-slate-200",
                  isLandscape.value ? "flex-row gap-4" : "flex-col"
                ])}" style="${ssrRenderStyle(`
              flex: 0 1 auto;
              min-height: 0;
              overflow: hidden;
              width: 100%;
              display: flex;
              flex-direction: ${isLandscape.value ? "row" : "column"};
              align-items: flex-start;
              justify-content: flex-start;
              padding: 0;
              margin: 0;
              ${isLandscape.value ? "gap: 1rem;" : ""}
            `)}" data-v-bf2c896e${_scopeId}><div class="prose-invert mx-auto pt-2 w-full text-center shrink prose prose-base" style="${ssrRenderStyle({ "font-size": "clamp(1rem, 2vw, 1.5rem)", "width": "100%", "margin-bottom": "1rem" })}" data-v-bf2c896e${_scopeId}><div data-v-bf2c896e${_scopeId}>${getAboveHr(markdownContent.value) ?? ""}</div></div><div class="bg-slate-800 w-full min-h-0 text-slate-200 shrink modal-scrollable-text" style="${ssrRenderStyle({ "overflow-y": "auto", "max-height": "100%", "width": "100%" })}" data-v-bf2c896e${_scopeId}><div data-v-bf2c896e${_scopeId}>${getBelowHr(markdownContent.value) ?? ""}</div></div></div>`);
              } else {
                _push2(`<div class="prose-invert mx-auto pt-2 w-full text-center shrink prose prose-base" style="${ssrRenderStyle({ "font-size": "clamp(1rem, 2vw, 1.5rem)", "width": "100%" })}" data-v-bf2c896e${_scopeId}><div data-v-bf2c896e${_scopeId}>${markdownContent.value ?? ""}</div></div>`);
              }
              _push2(`</div></div></div>`);
            } else {
              _push2(`<div class="flex flex-col justify-center items-center p-8 min-w-[10vw] min-h-[10vh]" data-v-bf2c896e${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            }
          } else {
            return [
              loading.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "flex flex-1 justify-center items-center py-8 text-white text-center"
              }, [
                createVNode(_component_Icon, {
                  name: "svg-spinners:90-ring-with-bg",
                  size: "2rem"
                })
              ])) : error.value ? (openBlock(), createBlock("div", {
                key: 1,
                class: "flex flex-1 justify-center items-center py-8 text-red-500 text-center"
              }, toDisplayString(error.value), 1)) : meme.value ? (openBlock(), createBlock("div", { key: 2 }, [
                createVNode("div", { class: "flex flex-col flex-1 justify-center items-center w-full h-full" }, [
                  createVNode("div", {
                    class: "relative flex flex-col bg-slate-800 rounded-lg w-full h-full modal-frame",
                    style: { "max-width": "90vw", "max-height": "90vh", "min-width": "41vw", "height": "100%", "box-sizing": "border-box", "display": "flex", "flex-direction": "column", "align-items": "stretch", "justify-content": "flex-start", "margin": "auto" }
                  }, [
                    createVNode("div", { style: { "width": "100%", "flex-shrink": "0", "display": "flex", "align-items": "flex-start", "justify-content": "center", "padding": "0", "margin": "0" } }, [
                      meme.value.image ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: meme.value.image,
                        alt: meme.value.title || "Meme",
                        class: ["rounded object-contain", !isLandscape.value ? "meme-modal-img-column" : ""],
                        style: isLandscape.value ? "max-width: 100%; max-height: 45vh; width: 100%; height: auto; display: block; margin: 0; padding: 0; object-fit: contain; object-position: top;" : "max-width: 100%; width: 100%; height: auto; display: block; margin: 0; padding: 0; object-fit: contain; object-position: top;"
                      }, null, 14, ["src", "alt"])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "py-4 text-red-400"
                      }, "🚨 Meme image not found!"))
                    ]),
                    hasExtraText.value ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: [
                        "flex flex-1 items-stretch w-full text-slate-200",
                        isLandscape.value ? "flex-row gap-4" : "flex-col"
                      ],
                      style: `
              flex: 0 1 auto;
              min-height: 0;
              overflow: hidden;
              width: 100%;
              display: flex;
              flex-direction: ${isLandscape.value ? "row" : "column"};
              align-items: flex-start;
              justify-content: flex-start;
              padding: 0;
              margin: 0;
              ${isLandscape.value ? "gap: 1rem;" : ""}
            `
                    }, [
                      createVNode("div", {
                        class: "prose-invert mx-auto pt-2 w-full text-center shrink prose prose-base",
                        style: { "font-size": "clamp(1rem, 2vw, 1.5rem)", "width": "100%", "margin-bottom": "1rem" }
                      }, [
                        createVNode("div", {
                          innerHTML: getAboveHr(markdownContent.value)
                        }, null, 8, ["innerHTML"])
                      ]),
                      createVNode("div", {
                        class: "bg-slate-800 w-full min-h-0 text-slate-200 shrink modal-scrollable-text",
                        style: { "overflow-y": "auto", "max-height": "100%", "width": "100%" }
                      }, [
                        createVNode("div", {
                          innerHTML: getBelowHr(markdownContent.value)
                        }, null, 8, ["innerHTML"])
                      ])
                    ], 6)) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "prose-invert mx-auto pt-2 w-full text-center shrink prose prose-base",
                      style: { "font-size": "clamp(1rem, 2vw, 1.5rem)", "width": "100%" }
                    }, [
                      createVNode("div", { innerHTML: markdownContent.value }, null, 8, ["innerHTML"])
                    ]))
                  ])
                ])
              ])) : (openBlock(), createBlock("div", {
                key: 3,
                class: "flex flex-col justify-center items-center p-8 min-w-[10vw] min-h-[10vh]"
              }, [
                renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ]))
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MemeDetailModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const MemeDetailModal = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-bf2c896e"]]);
const _sfc_main$1 = {
  __name: "MemePanel",
  __ssrInlineRender: true,
  props: {
    meme: Object,
    slug: String
  },
  setup(__props) {
    const showModal = ref(false);
    const closeModal = () => showModal.value = false;
    const getSlug = (path) => {
      if (!path) return "";
      if (path.startsWith("/memes/")) {
        return path.substring("/memes/".length);
      }
      return path;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (__props.meme && __props.meme.image && __props.slug) {
        _push(`<div class="block bg-slate-800 hover:bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 border hover:border hover:border-seagull-400 border-transparent rounded-lg w-full h-full overflow-hidden cursor-pointer"><img${ssrRenderAttr("src", __props.meme.image)} alt="Meme" class="bg-black/40 rounded-lg w-full h-full object-contain aspect-square" style="${ssrRenderStyle({ "max-width": "100%", "max-height": "100%", "min-width": "0", "min-height": "0" })}"></div>`);
      } else if (__props.meme && __props.meme.image) {
        _push(`<div class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"><img${ssrRenderAttr("src", __props.meme.image)} alt="Meme" class="bg-black/40 rounded-lg w-full h-full object-contain aspect-square" style="${ssrRenderStyle({ "max-width": "100%", "max-height": "100%", "min-width": "0", "min-height": "0" })}"></div>`);
      } else {
        _push(`<div class="block bg-slate-800 shadow-[inset_0_0_12px_0_#0f1e24] mx-auto p-3 rounded-lg w-full h-full overflow-hidden"><p class="text-white text-center">🚨 Meme image not found!</p></div>`);
      }
      if (showModal.value) {
        _push(ssrRenderComponent(MemeDetailModal, {
          slug: getSlug(__props.meme._path),
          show: showModal.value,
          onClose: closeModal
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MemePanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const searchTerm = inject("searchTerm", ref(""));
    const contentFilters = inject("contentFilters", ref({ claims: true, quotes: true, memes: true }));
    const loading = ref(false);
    ref(true);
    const error = ref(null);
    const displayedItems = ref([]);
    computed(() => {
      const claims = displayedItems.value.filter((item) => item.type === "claimPair");
      const quotes = displayedItems.value.filter((item) => item.type === "quote");
      const memes = displayedItems.value.filter((item) => item.type === "memeRow");
      const interleaved = [];
      const maxLength = Math.max(claims.length, quotes.length, memes.length);
      for (let i = 0; i < maxLength; i++) {
        if (claims[i]) interleaved.push(claims[i]);
        if (quotes[i]) interleaved.push(quotes[i]);
        if (memes[i]) interleaved.push(memes[i]);
      }
      return interleaved;
    });
    const claimCount = computed(() => {
      return displayedItems.value.flatMap((item) => item.type === "claimPair" ? item.data : []).filter((item) => item.type === "claim").length;
    });
    const quoteCount = computed(() => {
      return displayedItems.value.filter((item) => item.type === "quote").length;
    });
    const memeCount = computed(() => {
      return displayedItems.value.flatMap((item) => item.type === "memeRow" ? item.data : []).filter((item) => item.type === "meme").length;
    });
    computed(() => claimCount.value + quoteCount.value + memeCount.value);
    ref(null);
    console.log(queryContent);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClaimTranslationPanel = _sfc_main$5;
      const _component_QuotePanel = _sfc_main$3;
      const _component_MemePanel = _sfc_main$1;
      const _component_Icon = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 w-full" }, _attrs))}><div id="modal-root"></div>`);
      if (error.value) {
        _push(`<div class="text-red-500">Error loading content: ${ssrInterpolate(error.value.message)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (displayedItems.value.length) {
        _push(`<section class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 auto-rows-min"><!--[-->`);
        ssrRenderList(displayedItems.value, (item, index) => {
          var _a;
          _push(`<div class="col-span-1 sm:col-span-2 lg:col-span-2">`);
          if (item.type === "claimPair") {
            _push(`<div class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"><!--[-->`);
            ssrRenderList(item.data, (claimItem, idx) => {
              var _a2;
              _push(ssrRenderComponent(_component_ClaimTranslationPanel, {
                key: idx,
                claim: claimItem.data,
                slug: ((_a2 = claimItem.data) == null ? void 0 : _a2._path) || ""
              }, null, _parent));
            });
            _push(`<!--]--></div>`);
          } else if (item.type === "quote") {
            _push(ssrRenderComponent(_component_QuotePanel, {
              quote: item.data,
              slug: ((_a = item.data) == null ? void 0 : _a._path) || ""
            }, null, _parent));
          } else if (item.type === "memeRow") {
            _push(`<div class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"><!--[-->`);
            ssrRenderList(item.data, (memeItem, idx) => {
              var _a2;
              _push(ssrRenderComponent(_component_MemePanel, {
                key: idx,
                meme: memeItem.data,
                slug: ((_a2 = memeItem.data) == null ? void 0 : _a2._path) || ""
              }, null, _parent));
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></section>`);
      } else if (loading.value) {
        _push(`<div class="flex flex-col justify-center justify-self-center content-center place-content-center self-center place-items-center gap-4 py-4 text-white text-center align-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "svg-spinners:90-ring-with-bg",
          size: "1.75rem"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-col justify-center items-center min-h-[60vh]"><h1 class="font-light text-white text-2xl text-center">${ssrInterpolate(unref(searchTerm) ? "No results found." : !unref(contentFilters).claims && !unref(contentFilters).quotes && !unref(contentFilters).memes ? "No content found. Select a category above." : "No content found.")}</h1></div>`);
      }
      if (loading.value && displayedItems.value.length) {
        _push(`<div class="flex flex-col justify-center justify-self-center content-center place-content-center self-center place-items-center gap-4 py-4 text-white text-center align-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "svg-spinners:90-ring-with-bg",
          size: "1.75rem"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="h-10"></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-DzbsUTE5.js.map
