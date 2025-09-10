// Central list of permanently banned like IDs that must never appear in admin or API responses.
// Add any legacy / renamed paths here. If a replacement target exists, map it below.
export const BANNED_LIKE_IDS: Record<string, string | null> = {
  '/claims/rehabilitation-and-restorative-justice':
    '/claims/restorative-justice',
}

export function isBanned(id: string) {
  return Object.prototype.hasOwnProperty.call(BANNED_LIKE_IDS, id)
}

export function applyBanPurge(map: Record<string, number>) {
  let changed = false
  for (const [from, target] of Object.entries(BANNED_LIKE_IDS)) {
    if (map[from] !== undefined) {
      if (target) {
        map[target] = Math.max(0, (map[target] || 0) + (map[from] || 0))
      }
      delete map[from]
      changed = true
    }
  }
  return changed
}
