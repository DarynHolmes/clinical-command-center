<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useSyncBiomarkers } from '~/composables/useSyncBiomarkers'
import { useSyncAmendments } from '~/composables/useSyncAmendments'
import { usePulseSimulation } from '~/composables/usePulseSimulation'

const { user, isAuthorized, logout } = useAuth()
const colorMode = useColorMode()
const route = useRoute()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Only initialize real-time subscriptions if authenticated
watchEffect(() => {
  if (isAuthorized.value) {
    useSyncBiomarkers()
    useSyncAmendments()
    usePulseSimulation()
  }
})

const navItems: NavigationMenuItem[] = [
  { label: 'Dashboard', icon: 'i-lucide-home', to: '/dashboard' },
  { label: 'Protocols', icon: 'i-lucide-flask-conical', to: '/protocols' },
  { label: 'Biomarkers', icon: 'i-lucide-activity', to: '/biomarkers' }
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      id="main-sidebar"
      collapsible
      resizable
      :min-size="5"
      :default-size="15"
      :max-size="25"
      :ui="{ footer: 'border-t border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2 overflow-hidden min-w-0">
          <UIcon
            name="i-lucide-heart-pulse"
            class="size-6 text-primary shrink-0"
          />
          <span
            v-if="!collapsed"
            class="font-semibold text-sm truncate"
          >Clinical Command Center</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navItems"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-1 p-2">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            size="sm"
            :class="{ 'justify-start': !collapsed }"
            :label="collapsed ? undefined : 'Theme'"
            @click="toggleColorMode"
          />
          <UButton
            to="/settings"
            icon="i-lucide-settings"
            color="neutral"
            variant="ghost"
            size="sm"
            :class="{ 'justify-start': !collapsed }"
            :label="collapsed ? undefined : 'Settings'"
          />
          <UButton
            v-if="user"
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            size="sm"
            :class="{ 'justify-start': !collapsed }"
            :label="collapsed ? undefined : 'Logout'"
            @click="logout"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="main-panel">
      <template #header>
        <UDashboardNavbar :title="(route.meta.title as string) ?? 'Dashboard'" />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
