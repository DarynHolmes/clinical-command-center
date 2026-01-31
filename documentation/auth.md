# OAuth2


By leveraging PocketBase’s built-in OAuth2 handlers, we can provide a commercial-grade authentication experience with minimal boilerplate

## Page structure 

- Marketing/Landing (/): This is where we explain the value proposition (e.g., "AI-optimized protocol design") to prospective researchers or stakeholders.

- The App Root (/dashboard or /app): This is the "Clinical Command Center" we have been building.

- The Login (/login): A dedicated route for the UAuthForm helps with clean SEO and clear bookmarking for institutional users.


## The useAuth Composable

This is the "Brain" of your identity layer. It manages the user session, handles the OAuth2 redirect flow, and ensures your real-time listeners (Biomarkers/Amendments) are only active for authorized users.


Sample implementation

```ts

// app/composables/useAuth.ts
import { ref, computed } from 'vue'
import { pb } from '~/services/pocketbase'

export function useAuth() {
  const user = ref(pb.authStore.model)
  const isAuthorized = computed(() => pb.authStore.isValid)

  // Standard OAuth2 flow for Google/Microsoft (Common in Clinical Orgs)
  const loginWithOAuth2 = async (provider: 'google' | 'microsoft') => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider })
      user.value = authData.meta?.rawUser
      // Founding Move: Redirect to dashboard after success
      navigateTo('/')
    } catch (error) {
      console.error('OAuth2 failed:', error)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    isAuthorized,
    loginWithOAuth2,
    logout
  }
}
```

## Gating the Real-time Sync

To ensure Commercial Stability, we must wrap our sync composables so they don't fire requests for unauthenticated users.

```ts
// app/app.vue or a global layout
const { isAuthorized } = useAuth()

// Only initialize high-stakes subscriptions if we have a valid session
watchEffect(() => {
  if (isAuthorized.value) {
    useSyncBiomarkers()
    useSyncAmendments()
  }
})
```


## The Login UI (Nuxt UI)

Your login page should reflect the companies brand—clean, professional, and "Scientific".

Use the auth form component - https://ui.nuxt.com/docs/components/auth-form

