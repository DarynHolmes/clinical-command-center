<template>
  <div class="fixed inset-0 flex overflow-hidden bg-gray-50 dark:bg-gray-950">
    <aside class="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div class="flex h-16 items-center px-6">
        <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">Luvida</span>
      </div>
      
      <nav class="flex-1 space-y-1 px-3 py-4">
        <UVerticalNavigation :links="navLinks" />
      </nav>

      <div class="border-t border-gray-200 p-4 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <UAvatar size="sm" src="https://avatars.githubusercontent.com/u/739984?v=4" />
          <div class="text-sm font-medium">Lead Researcher</div>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const navLinks = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Protocols', icon: 'i-heroicons-beaker', to: '/protocols' },
  { label: 'Biomarkers', icon: 'i-heroicons-chart-bar', to: '/biomarkers' },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
]
</script>
