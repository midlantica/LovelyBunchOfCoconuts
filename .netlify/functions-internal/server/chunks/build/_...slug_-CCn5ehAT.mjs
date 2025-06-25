import __nuxt_component_0 from './Icon-CqYqGx2s.mjs';
import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _imports_0, a as _imports_1 } from './player_icon-BVgPiptf.mjs';
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
    const claim = ref(null);
    const error = ref(null);
    const allClaims = ref([]);
    const initialLoad = ref(true);
    const markdownContent = ref(null);
    const { getAllContent, getContentItem, prefetchContentItem } = useContentCache();
    const extractMarkdownContent = (body) => {
      var _a;
      if (!body) return null;
      const contentWithoutFrontmatter = body.replace(/^---[\s\S]*?---/, "").trim();
      const sections = contentWithoutFrontmatter.split(/^##\s+/m);
      if (sections.length > 2) {
        const remainingSections = sections.slice(2);
        const additionalContent = remainingSections.filter((section) => section.trim()).join("\n\n").trim();
        if (additionalContent) {
          const translation = ((_a = claim.value) == null ? void 0 : _a.translation) || "";
          const cleanedContent = additionalContent.replace(new RegExp(`^${translation}\\s*$`, "mi"), "").trim();
          if (cleanedContent) {
            return md.render(cleanedContent);
          }
        }
      }
      return null;
    };
    const currentSlug = computed(() => {
      const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
      return slugParts.join("/");
    });
    const formattedClaims = computed(() => {
      return allClaims.value.map((item) => ({
        path: item._path
      }));
    });
    const navigation = computed(() => {
      if (allClaims.value.length > 0) {
        return useNavigation(formattedClaims, currentSlug.value, "/claims").value;
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
            contentType: "claims"
          };
        }
      },
      { immediate: true, deep: true }
    );
    const loadClaim = async () => {
      try {
        markdownContent.value = null;
        const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
        const slug = slugParts.join("/");
        const fullPath = `/claims/${slug}`;
        console.log("Fetching claim with path:", fullPath);
        if (allClaims.value.length === 0) {
          const data = await getAllContent("claims");
          allClaims.value = data || [];
        }
        const foundClaim = await getContentItem("claims", slug);
        if (foundClaim && !foundClaim.error) {
          claim.value = foundClaim;
          console.log("Found claim:", foundClaim);
          if (foundClaim.body) {
            markdownContent.value = extractMarkdownContent(foundClaim.body);
            console.log("Extracted markdown content:", !!markdownContent.value);
          }
          if (navigation.value.prevSlug) {
            prefetchContentItem(navigation.value.prevSlug);
          }
          if (navigation.value.nextSlug) {
            prefetchContentItem(navigation.value.nextSlug);
          }
        } else {
          console.error("Claim not found with path:", fullPath);
          error.value = "Claim not found";
        }
      } catch (err) {
        console.error("Error fetching claim:", err);
        error.value = err.message;
      } finally {
        initialLoad.value = false;
      }
    };
    watch(
      () => route.params.slug,
      () => {
        claim.value = null;
        error.value = null;
        loadClaim();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto pb-3 max-w-3xl" }, _attrs))}>`);
      if (claim.value) {
        _push(`<div class="bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] mb-3 p-6 rounded-lg text-white"><div class="flex items-center gap-3 mb-4"><img${ssrRenderAttr("src", _imports_0)} alt="NPC" class="w-10"><h1 class="font-light text-2xl tracking-wide">${ssrInterpolate(claim.value.claim)}</h1></div><hr class="my-4 border-white/10"><div class="flex items-center gap-3"><img${ssrRenderAttr("src", _imports_1)} alt="Player" class="w-10"><h2 class="font-light text-2xl tracking-wide">${ssrInterpolate(claim.value.translation)}</h2></div>`);
        if (markdownContent.value) {
          _push(`<div class="mt-6 pt-4 border-slate-700 border-t"><div class="prose-invert max-w-none prose prose-sm">${(_a = markdownContent.value) != null ? _a : ""}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (initialLoad.value) {
        _push(`<div class="bg-slate-800 shadow-lg mb-3 p-6 rounded-lg text-white"><p>Loading claim...</p>`);
        if (error.value) {
          _push(`<div class="mt-4 text-red-500">Error: ${ssrInterpolate(error.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center bg-slate-800 shadow-lg mb-3 p-6 rounded-lg min-h-[200px] text-white"><div class="flex flex-col items-center">`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/claims/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_...slug_-CCn5ehAT.mjs.map
