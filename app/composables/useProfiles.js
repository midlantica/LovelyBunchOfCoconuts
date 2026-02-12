// composables/useProfiles.js
// Fetches and manages profile content (heroes and zeros)

// extractSearchableText is auto-imported from ~/utils/searchText.ts

export const useProfiles = () => {
  const allProfilesData = useState('allProfiles', () => null)
  const heroesData = useState('heroProfiles', () => null)
  const zerosData = useState('zeroProfiles', () => null)

  const fetchAllProfiles = async () => {
    if (allProfilesData.value) return allProfilesData.value

    try {
      // Fetch all profiles at once - the collection includes both heroes and zeros
      const allProfiles = await queryCollection('profiles').all()

      // Transform profiles to add searchable text
      const profiles = (allProfiles || []).map((profile) => {
        const profileName = profile.meta?.profile || ''
        const status = profile.meta?.status || ''
        const searchText = extractSearchableText(profile.body, {
          profile: profileName,
          status,
        })

        return {
          ...profile,
          searchableText: searchText,
          _search: (profileName + ' ' + status + ' ' + searchText)
            .toLowerCase()
            .replace(/[-_]/g, ' '),
        }
      })

      if (import.meta.dev && profiles.length > 0) {
        console.log(`✅ Fetched ${profiles.length} profiles for wall display`)
      }

      allProfilesData.value = profiles
      return profiles
    } catch (error) {
      console.error('Error fetching profiles:', error)
      return []
    }
  }

  const fetchHeroes = async () => {
    if (heroesData.value) return heroesData.value

    try {
      const allProfiles = await queryCollection('profiles').all()
      const heroes = (allProfiles || []).filter((p) =>
        p._path?.includes('/heroes/')
      )

      heroesData.value = heroes
      return heroes
    } catch (error) {
      console.error('Error fetching heroes:', error)
      return []
    }
  }

  const fetchZeros = async () => {
    if (zerosData.value) return zerosData.value

    try {
      const allProfiles = await queryCollection('profiles').all()
      const zeros = (allProfiles || []).filter((p) =>
        p._path?.includes('/zeros/')
      )

      zerosData.value = zeros
      return zeros
    } catch (error) {
      console.error('Error fetching zeros:', error)
      return []
    }
  }

  return {
    allProfiles: allProfilesData,
    heroes: heroesData,
    zeros: zerosData,
    fetchAllProfiles,
    fetchHeroes,
    fetchZeros,
  }
}
