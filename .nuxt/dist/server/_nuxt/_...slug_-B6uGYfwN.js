import __nuxt_component_0 from "./Icon-B_75CSgK.js";
import { u as useRoute, a as useRouter, v as vueExports, s as serverRenderer_cjs_prodExports } from "../server.mjs";
import { u as useNavigation } from "./useNavigation-_x1YO2TU.js";
import { u as useContentCache } from "./useContentCache-1wictnit.js";
import MarkdownIt from "markdown-it";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "./config-DmdBDFMn.js";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
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
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "#internal/nuxt/paths";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/@unhead+vue@2.0.11_vue@3.5.17_typescript@5.8.3_/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = {
  __name: "[...slug]",
  __ssrInlineRender: true,
  setup(__props) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    });
    const route = useRoute();
    useRouter();
    const quote = vueExports.ref(null);
    const error = vueExports.ref(null);
    const allQuotes = vueExports.ref([]);
    const initialLoad = vueExports.ref(true);
    const markdownContent = vueExports.ref(null);
    const { getAllContent, getContentItem, prefetchContentItem } = useContentCache();
    const cleanHeading = (text) => {
      if (!text) return "";
      return text.replace(/^#+\s+/, "").replace(/^["'](.*)["']$/, "$1");
    };
    const extractMarkdownContent = (body) => {
      if (!body) return null;
      const contentWithoutFrontmatter = body.replace(/^---[\s\S]*?---/, "").trim();
      const explainedMatch = contentWithoutFrontmatter.match(/##\s+Explained:[\s\S]*/i);
      if (explainedMatch) {
        const explainedContent = explainedMatch[0];
        const contentWithoutHeading = explainedContent.replace(/##\s+Explained:\s*/i, "");
        return md.render(contentWithoutHeading);
      }
      return null;
    };
    const currentSlug = vueExports.computed(() => {
      const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
      return slugParts.join("/");
    });
    const formattedQuotes = vueExports.computed(() => {
      return allQuotes.value.map((item) => ({
        path: item._path
      }));
    });
    const navigation = vueExports.computed(() => {
      if (allQuotes.value.length > 0) {
        return useNavigation(formattedQuotes, currentSlug.value, "/quotes").value;
      }
      return { prevSlug: "/", nextSlug: "/" };
    });
    vueExports.watch(
      navigation,
      (newNavigation) => {
        if (newNavigation) {
          route.meta.navigation = {
            prevSlug: newNavigation.prevSlug,
            nextSlug: newNavigation.nextSlug,
            contentType: "quotes"
          };
        }
      },
      { immediate: true, deep: true }
    );
    const loadQuote = async () => {
      try {
        markdownContent.value = null;
        const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
        const slug = slugParts.join("/");
        const fullPath = `/quotes/${slug}`;
        console.log("Fetching quote with path:", fullPath);
        if (allQuotes.value.length === 0) {
          const data = await getAllContent("quotes");
          allQuotes.value = data || [];
        }
        const foundQuote = await getContentItem("quotes", slug);
        if (foundQuote && !foundQuote.error) {
          quote.value = foundQuote;
          console.log("Found quote:", foundQuote);
          if (foundQuote.body) {
            markdownContent.value = extractMarkdownContent(foundQuote.body);
            console.log("Extracted markdown content:", !!markdownContent.value);
          }
          if (navigation.value.prevSlug) {
            prefetchContentItem(navigation.value.prevSlug);
          }
          if (navigation.value.nextSlug) {
            prefetchContentItem(navigation.value.nextSlug);
          }
        } else {
          console.error("Quote not found with path:", fullPath);
          error.value = "Quote not found";
        }
      } catch (err) {
        console.error("Error fetching quote:", err);
        error.value = err.message;
      } finally {
        initialLoad.value = false;
      }
    };
    vueExports.watch(
      () => route.params.slug,
      () => {
        quote.value = null;
        error.value = null;
        loadQuote();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(vueExports.mergeProps({ class: "mx-auto px-0 pb-3 max-w-3xl" }, _attrs))}>`);
      if (quote.value) {
        _push(`<div class="bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] p-6 rounded-lg text-slate-100"><h1 class="font-light text-2xl tracking-wide">${serverRenderer_cjs_prodExports.ssrInterpolate(cleanHeading(
          quote.value.headings && quote.value.headings.length > 0 ? quote.value.headings[0] : quote.value.title
        ))}</h1>`);
        if (quote.value.attribution) {
          _push(`<p class="mt-2 font-light text-slate-200 text-xl tracking-wide"> — ${serverRenderer_cjs_prodExports.ssrInterpolate(quote.value.attribution)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (markdownContent.value) {
          _push(`<div class="mt-6 pt-4 border-slate-700 border-t"><div class="prose-invert max-w-none prose prose-sm">${markdownContent.value ?? ""}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (initialLoad.value) {
        _push(`<div class="flex flex-col flex-wrap gap-1 bg-slate-800 shadow-lg p-6 rounded-lg text-slate-100"><p>Loading quote...</p>`);
        if (error.value) {
          _push(`<div class="mt-4 text-red-500">Error: ${serverRenderer_cjs_prodExports.ssrInterpolate(error.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-col flex-wrap justify-center items-center gap-1 bg-slate-800 shadow-lg p-6 rounded-lg min-h-[100px] text-slate-100"><div class="flex flex-col items-center">`);
        _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_Icon, {
          name: "svg-spinners:90-ring-with-bg",
          size: "2rem",
          class: "mb-2"
        }, null, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/quotes/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_...slug_-B6uGYfwN.js.map
