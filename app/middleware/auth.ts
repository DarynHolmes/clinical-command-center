import { pb } from '~/services/pocketbase'

export default defineNuxtRouteMiddleware(() => {
  if (!pb.authStore.isValid) {
    return navigateTo('/login')
  }
})
