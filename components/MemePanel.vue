<!-- components/MemePanel.vue -->
<template>
  <router-link
    v-if="meme && extractMemeImage && slug"
    :to="slug"
    class="mx-auto w-full h-full overflow-hidden block p-3 bg-gray-800 rounded-lg shadow-[inset_0_0_12px_0_#0f1e24] hover:bg-gray-700"
  >
    <img :src="extractMemeImage"
alt="Meme"
class="w-full h-full object-contain object-center" />
  </router-link>
  <div 
    v-else-if="meme && extractMemeImage"
    class="mx-auto w-full h-full overflow-hidden block p-3 bg-gray-800 rounded-lg shadow-[inset_0_0_12px_0_#0f1e24]"
  >
    <img :src="extractMemeImage"
alt="Meme"
class="w-full h-full object-contain object-center" />
  </div>
  <div v-else class="mx-auto w-full h-full overflow-hidden block p-3 bg-gray-800 rounded-lg shadow-[inset_0_0_12px_0_#0f1e24]">
    <p class="text-white text-center">🚨 Meme image not found!</p>
  </div>
</template>

<script setup>
  import { computed } from "vue"

  const props = defineProps({
    meme: Object,
    slug: String,
  })

  const extractMemeImage = computed(() => {
    // Nuxt Content v3 structure
    if (props.meme?.body?.content) {
      const children = props.meme.body.content.children || []
      
      // Find image in content
      for (const node of children) {
        // Check for direct img tag
        if (node.tag === 'img' && node.props?.src) {
          return node.props.src
        }
        
        // Check for img inside paragraph
        if (node.tag === 'p' && node.children) {
          const imgChild = node.children.find(child => child.tag === 'img')
          if (imgChild && imgChild.props?.src) {
            return imgChild.props.src
          }
        }
      }
      
      // Fallback to frontmatter
      if (props.meme.image) {
        return props.meme.image
      }
      
      return null
    }
    
    // Fallback to v2 structure
    if (props.meme?.body?.value) {
      let imgNode
      props.meme.body.value.forEach((node) => {
        if (Array.isArray(node)) {
          if (node[0] === "img") imgNode = node
          else if (node[2] && Array.isArray(node[2]) && node[2][0] === "img") imgNode = node[2]
        }
      })
      
      // If we found an image node, use it
      if (imgNode && imgNode[1] && imgNode[1].src) {
        return imgNode[1].src
      }
      
      // Fallback: check if there's an image property in the frontmatter
      if (props.meme.image) {
        return props.meme.image
      }
    }
    
    return null
  })
</script>
