// PocketBase singleton instance
import PocketBase from 'pocketbase'

function getPocketBaseUrl(): string {
  // Env variable for local dev (where Nuxt & PocketBase run on different ports)
  if (import.meta.env.VITE_POCKETBASE_URL) {
    return import.meta.env.VITE_POCKETBASE_URL
  }

  // Production PocketHost URL
  return 'https://clinical-command-center.pockethost.io'
}

export const pb = new PocketBase(getPocketBaseUrl())

// Disable auto-cancellation for subscriptions
pb.autoCancellation(false)
