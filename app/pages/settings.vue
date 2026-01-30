<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Settings',
  middleware: 'auth'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full p-8">
    <UIcon
      name="i-lucide-settings"
      class="size-16 text-muted mb-4"
    />
    <h1 class="text-2xl font-semibold text-default mb-2">
      Settings
    </h1>
    <p class="text-muted text-center max-w-md">
      Application settings and preferences will be available here.
    </p>
  </div>
</template>
