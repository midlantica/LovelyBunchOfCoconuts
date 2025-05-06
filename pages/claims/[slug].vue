<!-- pages/claims/[slug].vue -->
<template>
  <div v-if="currentItem" class="claims-pg w-full flex flex-col gap-3">
    <ContentNavigation :prev-slug="prevSlug" :next-slug="nextSlug" />
    <div class="claims-details flex flex-col gap-3 p-4 text-white bg-gray-800 rounded-md">
      <article class="">
        <!-- Claim Section -->
        <div v-if="claimSection.length" class="mb-0">
          <div class="flex items-start gap-4">
            <img src="@/assets/icons/npc_icon.svg" alt="NPC" class="w-10" />
            <div class="flex flex-col self-center gap-2">
              <h2 class="font-medium line-clamp-1">
                {{ claimHeadings[0] }}
              </h2>
              <ContentRenderer
                v-if="claimContent.length"
                :value="{ type: 'root', children: claimContent }"
              />
            </div>
          </div>
        </div>
        <!-- Translation Section -->
        <div v-if="translationSection.length">
          <hr class="border-white/10 my-4 border-t" />
          <div class="flex items-start gap-4">
            <img src="@/assets/icons/player_icon.svg" alt="Player" class="w-10" />
            <div class="flex flex-col self-center gap-2">
              <h2 class="font-medium line-clamp-1">
                {{ translationHeadings[0] }}
              </h2>
              <ContentRenderer
                v-if="translationContent.length"
                :value="{ type: 'root', children: translationContent }"
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
  <div v-else>
    <p class="text-red-500">🚨 Claim not found!</p>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useContentNavigation } from "@/composables/useContentNavigation"

const { currentItem, prevSlug, nextSlug } = useContentNavigation("claims")

// Extract headings (h2) from the content
const extractHeadings = (body) => {
  if (!body || !body.value) return []
  return body.value
    .filter((node) => Array.isArray(node) && node[0] === "h2")
    .map((node) => node[2] || "")
}

// Compute the claim and translation headings
const claimHeadings = computed(() => {
  const headings = extractHeadings(currentItem.value?.body)
  return headings.length > 0 ? [headings[0]] : []
})
const translationHeadings = computed(() => {
  const headings = extractHeadings(currentItem.value?.body)
  return headings.length > 1 ? [headings[1]] : []
})

// Split content into claim and translation sections
const claimSection = computed(() => {
  if (!currentItem.value?.body?.value) return []
  const nodes = currentItem.value.body.value
  let secondH2Index = -1

  // Find the index of the second h2
  let h2Count = 0
  for (let i = 0; i < nodes.length; i++) {
    if (Array.isArray(nodes[i]) && nodes[i][0] === "h2") {
      h2Count++
      if (h2Count === 2) {
        secondH2Index = i
        break
      }
    }
  }

  // If no second h2, the entire content is the claim section
  if (secondH2Index === -1) {
    return nodes
  }

  // Return content from the start to just before the second h2
  return nodes.slice(0, secondH2Index)
})

const translationSection = computed(() => {
  if (!currentItem.value?.body?.value) return []
  const nodes = currentItem.value.body.value
  let secondH2Index = -1

  // Find the index of the second h2
  let h2Count = 0
  for (let i = 0; i < nodes.length; i++) {
    if (Array.isArray(nodes[i]) && nodes[i][0] === "h2") {
      h2Count++
      if (h2Count === 2) {
        secondH2Index = i
        break
      }
    }
  }

  // If no second h2, there is no translation section
  if (secondH2Index === -1) {
    return []
  }

  // Return content from the second h2 onward
  return nodes.slice(secondH2Index)
})

// Extract content after the first h2 for the claim section
const claimContent = computed(() => {
  const section = claimSection.value
  if (!section.length) return []

  // Find the index of the first h2
  const firstH2Index = section.findIndex((node) => Array.isArray(node) && node[0] === "h2")
  if (firstH2Index === -1) return section

  // Return content after the first h2
  const content = section.slice(firstH2Index + 1)
  // Convert the content to the format ContentRenderer expects
  return content.map((node) => ({
    type: "element",
    tag: node[0],
    props: node[1] || {},
    children:
      typeof node[2] === "string"
        ? [{ type: "text", value: node[2] }]
        : convertNestedNodes(node[2]),
  }))
})

// Extract content after the second h2 for the translation section
const translationContent = computed(() => {
  const section = translationSection.value
  if (!section.length) return []

  // Find the index of the first h2 in the translation section (which is the second h2 overall)
  const firstH2Index = section.findIndex((node) => Array.isArray(node) && node[0] === "h2")
  if (firstH2Index === -1) return section

  // Return content after the first h2 in the translation section
  const content = section.slice(firstH2Index + 1)
  // Convert the content to the format ContentRenderer expects
  return content.map((node) => ({
    type: "element",
    tag: node[0],
    props: node[1] || {},
    children:
      typeof node[2] === "string"
        ? [{ type: "text", value: node[2] }]
        : convertNestedNodes(node[2]),
  }))
})

// Helper function to convert nested nodes (e.g., images inside paragraphs)
const convertNestedNodes = (nestedNode) => {
  if (Array.isArray(nestedNode)) {
    if (typeof nestedNode[0] === "string") {
      return [
        {
          type: "element",
          tag: nestedNode[0],
          props: nestedNode[1] || {},
          children:
            typeof nestedNode[2] === "string"
              ? [{ type: "text", value: nestedNode[2] }]
              : convertNestedNodes(nestedNode[2]),
        },
      ]
    }
    return nestedNode.map((child) => convertNestedNodes(child))
  }
  return [{ type: "text", value: nestedNode }]
}
</script>
