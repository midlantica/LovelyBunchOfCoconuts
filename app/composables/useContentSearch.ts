// composables/useContentSearch.ts
// Full-text content search using @nuxt/content 3.12's queryCollectionSearchSections API.
import { ref } from 'vue'
//
// queryCollectionSearchSections() (new in @nuxt/content 3.8+, improved in 3.12) returns
// structured search sections from markdown content — each section has a title, content
// excerpt, and the source document's path/id. This is far more accurate than the
// previous approach of building a flat _search string from frontmatter fields.
//
// This composable is used to power the SearchBar autocomplete suggestions with
// real content data from the markdown files, replacing the static popularTerms list.
//
// Usage:
//   const { searchContent, results, isSearching } = useContentSearch()
//   await searchContent('climate change')
//   // results.value => [{ title, content, id, score }, ...]

interface SearchSection {
  id: string
  title: string
  titles: string[]
  content: string
  level: number
}

interface SearchResult {
  title: string
  excerpt: string
  path: string
  type: 'grift' | 'quote' | 'meme' | 'post' | 'profile' | 'general'
  score: number
}

function inferContentType(path: string): SearchResult['type'] {
  if (path.includes('/grifts/')) return 'grift'
  if (path.includes('/quotes/')) return 'quote'
  if (path.includes('/memes/')) return 'meme'
  if (path.includes('/posts/')) return 'post'
  if (path.includes('/profiles/')) return 'profile'
  return 'general'
}

export function useContentSearch() {
  const results = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const lastQuery = ref('')

  /**
   * Search across all content collections using queryCollectionSearchSections.
   * Returns ranked results with title, excerpt, path, and content type.
   *
   * @param query - The search string (min 2 chars to trigger)
   * @param limit - Max results to return (default 8)
   */
  async function searchContent(
    query: string,
    limit = 8
  ): Promise<SearchResult[]> {
    const q = query?.trim()
    if (!q || q.length < 2) {
      results.value = []
      return []
    }

    // Avoid redundant fetches for the same query
    if (q === lastQuery.value) return results.value

    isSearching.value = true
    lastQuery.value = q

    try {
      // queryCollectionSearchSections is auto-imported by @nuxt/content 3.12.
      // It queries the content SQLite database for full-text matches across
      // all sections of all documents in the specified collection.
      // We query all major collections in parallel for speed.
      const [griftSections, quoteSections, memeSections, postSections] =
        await Promise.all([
          // @ts-expect-error — queryCollectionSearchSections is auto-imported by @nuxt/content
          queryCollectionSearchSections('grifts', { term: q }),
          // @ts-expect-error — queryCollectionSearchSections is auto-imported by @nuxt/content
          queryCollectionSearchSections('quotes', { term: q }),
          // @ts-expect-error — queryCollectionSearchSections is auto-imported by @nuxt/content
          queryCollectionSearchSections('memes', { term: q }),
          // @ts-expect-error — queryCollectionSearchSections is auto-imported by @nuxt/content
          queryCollectionSearchSections('posts', { term: q }),
        ])

      const allSections: SearchSection[] = [
        ...(griftSections || []),
        ...(quoteSections || []),
        ...(memeSections || []),
        ...(postSections || []),
      ]

      // Map sections to SearchResult format, score by title match > content match
      const mapped: SearchResult[] = allSections
        .map((section) => {
          const qLower = q.toLowerCase()
          const titleLower = (section.title || '').toLowerCase()
          const contentLower = (section.content || '').toLowerCase()

          // Simple relevance score: title match = 2, content match = 1
          const score =
            (titleLower.includes(qLower) ? 2 : 0) +
            (contentLower.includes(qLower) ? 1 : 0)

          // Extract a short excerpt around the match
          const matchIdx = contentLower.indexOf(qLower)
          const excerptStart = Math.max(0, matchIdx - 40)
          const excerpt =
            matchIdx >= 0
              ? '...' +
                section.content.substring(excerptStart, excerptStart + 120) +
                '...'
              : section.content.substring(0, 120)

          return {
            title: section.title || section.titles?.[0] || 'Untitled',
            excerpt: excerpt.trim(),
            path: section.id || '',
            type: inferContentType(section.id || ''),
            score,
          }
        })
        .filter((r) => r.score > 0) // Only include actual matches
        .sort((a, b) => b.score - a.score) // Best matches first
        .slice(0, limit)

      results.value = mapped
      return mapped
    } catch (e) {
      // queryCollectionSearchSections may not be available in all environments
      // (e.g., static generation without SQLite). Fail silently.
      if (import.meta.dev) {
        console.warn(
          '[useContentSearch] queryCollectionSearchSections failed:',
          e
        )
      }
      results.value = []
      return []
    } finally {
      isSearching.value = false
    }
  }

  function clearResults() {
    results.value = []
    lastQuery.value = ''
  }

  return {
    searchContent,
    clearResults,
    results,
    isSearching,
  }
}
