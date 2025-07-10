// composables/useSimpleAnalytics.js
export function useSimpleAnalytics() {
  // Simple, privacy-friendly page view tracking
  const trackPageView = () => {
    if (typeof window === 'undefined') return

    try {
      // Simple counter in localStorage (privacy-friendly)
      const visits = parseInt(localStorage.getItem('wakeupnpc_visits') || '0')
      localStorage.setItem('wakeupnpc_visits', (visits + 1).toString())

      // Optional: Send to your own analytics if you have them
      // fetch('/api/analytics/pageview', { method: 'POST' })
    } catch (error) {
      // Ignore analytics errors
    }
  }

  const getVisitCount = () => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem('wakeupnpc_visits') || '0')
  }

  return {
    trackPageView,
    getVisitCount,
  }
}
