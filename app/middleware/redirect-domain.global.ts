/// <reference types="nuxt" />
// Nuxt global middleware to enforce allowed domain.
// Previously inline in app.html; now centralized here.

import { defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware((_to: any, _from: any) => {
  if (typeof window === 'undefined') return // Only run client-side

  const domainName = 'wakeupnpc.com'
  const allowedHosts = [
    window.location.host, // Always allow the current host (dev or prod)
    `www.${domainName}`,
  ]
  const currentHost = window.location.host
  const isAllowed = allowedHosts.includes(currentHost)

  // If not allowed host, redirect to canonical domain
  if (!isAllowed) {
    window.location.replace(
      window.location.protocol +
        '//' +
        (process.env.NODE_ENV === 'development'
          ? window.location.host + '/'
          : domainName)
    )
    return
  }

  // Optional root-path enforcement (kept disabled to allow future routed pages):
  // if (_to.path !== '/' && process.env.ENFORCE_ROOT === '1') {
  //   return navigateTo('/')
  // }
})
