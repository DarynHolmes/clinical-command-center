<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Biomarkers',
  middleware: 'auth'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full p-8">
    <UIcon
      name="i-lucide-activity"
      class="size-16 text-muted mb-4"
    />
    <h1 class="text-2xl font-semibold text-default mb-2">
      Biomarkers
    </h1>
    <p class="text-muted text-center max-w-md">
      Biomarker catalog and reference data will be available here.
    </p>
  </div>
</template>
