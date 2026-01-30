import { ref, computed, onMounted, onUnmounted } from 'vue'
import { pb } from '~/services/pocketbase'
import type { RecordModel } from 'pocketbase'

const user = ref<RecordModel | null>(pb.authStore.record)
const isAuthorized = computed(() => pb.authStore.isValid)

export function useAuth() {
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    // Keep user reactive when authStore changes
    unsubscribe = pb.authStore.onChange((_, record) => {
      user.value = record
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

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
