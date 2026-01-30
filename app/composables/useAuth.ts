import { ref, computed } from 'vue'
import { pb } from '~/services/pocketbase'
import type { RecordModel } from 'pocketbase'

const user = ref<RecordModel | null>(pb.authStore.record)

// Derive isAuthorized from user ref so it's properly reactive
const isAuthorized = computed(() => pb.authStore.isValid && user.value !== null)

// Set up the auth store listener at module level so it's always active
// This ensures reactivity works even before any component mounts
pb.authStore.onChange((_, record) => {
  user.value = record
})

export function useAuth() {

  const loginWithOAuth2 = async (provider: 'google' | 'microsoft') => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider })
      user.value = authData.record
      navigateTo('/dashboard')
    } catch (error) {
      console.error('OAuth2 failed:', error)
      throw error
    }
  }

  const logout = () => {
    pb.authStore.clear()
    user.value = null
    navigateTo('/')
  }

  return {
    user,
    isAuthorized,
    loginWithOAuth2,
    logout
  }
}
