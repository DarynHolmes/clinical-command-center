<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

definePageMeta({
  layout: false
})

const { loginWithOAuth2, isAuthorized } = useAuth()
const loading = ref(false)
const error = ref<string | null>(null)

// Redirect if already logged in
watchEffect(() => {
  if (isAuthorized.value) {
    navigateTo('/dashboard')
  }
})

const providers: ButtonProps[] = [
  {
    label: 'Continue with Google',
    icon: 'i-simple-icons-google',
    color: 'neutral',
    variant: 'subtle',
    block: true,
    onClick: async () => {
      loading.value = true
      error.value = null
      try {
        await loginWithOAuth2('google')
      } catch {
        error.value = 'Failed to sign in with Google. Please try again.'
      } finally {
        loading.value = false
      }
    }
  }
]
</script>

<template>
  <UApp>
    <div class="min-h-screen flex flex-col items-center justify-center bg-default p-4">
      <UPageCard
        class="w-full max-w-md"
        variant="outline"
      >
        <UAuthForm
          title="Welcome to Clinical Command Center"
          description="Clinical trial management and biomarker tracking"
          icon="i-lucide-heart-pulse"
          :providers="providers"
          :loading="loading"
        >
          <template #validation>
            <UAlert
              v-if="error"
              color="rose"
              icon="i-lucide-alert-circle"
              :title="error"
            />
          </template>
          <template #footer>
            <p class="text-sm text-muted text-center">
              Sign in to access your clinical trial dashboard
            </p>
          </template>
        </UAuthForm>
      </UPageCard>
      <UButton
        to="/"
        variant="link"
        color="neutral"
        icon="i-lucide-arrow-left"
        class="mt-4"
      >
        Back to home
      </UButton>
    </div>
  </UApp>
</template>
