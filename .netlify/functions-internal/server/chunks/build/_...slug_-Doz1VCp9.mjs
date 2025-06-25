import __nuxt_component_0 from './Icon-CqYqGx2s.mjs';
import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { u as useNavigation } from './useNavigation-DrmvaAAr.mjs';
import { u as useContentCache } from './useContentCache-lE4rpJVf.mjs';
import MarkdownIt from 'markdown-it';
import '@iconify/vue/dist/offline';
import '@iconify/vue';
import './config-BFzuITvt.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';

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
    const quote = ref(null);
    const error = ref(null);
    const allQuotes = ref([]);
    const initialLoad = ref(true);
    const markdownContent = ref(null);
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
    const currentSlug = computed(() => {
      const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
      return slugParts.join("/");
    });
    const formattedQuotes = computed(() => {
      return allQuotes.value.map((item) => ({
        path: item._path
      }));
    });
    const navigation = computed(() => {
      if (allQuotes.value.length > 0) {
        return useNavigation(formattedQuotes, currentSlug.value, "/quotes").value;
      }
      return { prevSlug: "/", nextSlug: "/" };
    });
    watch(
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
    watch(
      () => route.params.slug,
      () => {
        quote.value = null;
        error.value = null;
        loadQuote();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto px-0 pb-3 max-w-3xl" }, _attrs))}>`);
      if (quote.value) {
        _push(`<div class="bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] p-6 rounded-lg text-slate-100"><h1 class="font-light text-2xl tracking-wide">${ssrInterpolate(cleanHeading(
          quote.value.headings && quote.value.headings.length > 0 ? quote.value.headings[0] : quote.value.title
        ))}</h1>`);
        if (quote.value.attribution) {
          _push(`<p class="mt-2 font-light text-slate-200 text-xl tracking-wide"> \u2014 ${ssrInterpolate(quote.value.attribution)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (markdownContent.value) {
          _push(`<div class="mt-6 pt-4 border-slate-700 border-t"><div class="prose-invert max-w-none prose prose-sm">${(_a = markdownContent.value) != null ? _a : ""}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (initialLoad.value) {
        _push(`<div class="flex flex-col flex-wrap gap-1 bg-slate-800 shadow-lg p-6 rounded-lg text-slate-100"><p>Loading quote...</p>`);
        if (error.value) {
          _push(`<div class="mt-4 text-red-500">Error: ${ssrInterpolate(error.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="flex flex-col flex-wrap justify-center items-center gap-1 bg-slate-800 shadow-lg p-6 rounded-lg min-h-[100px] text-slate-100"><div class="flex flex-col items-center">`);
        _push(ssrRenderComponent(_component_Icon, {
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
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/quotes/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_...slug_-Doz1VCp9.mjs.map
