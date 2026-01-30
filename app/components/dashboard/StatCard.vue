<script setup lang="ts">
import type { StatCardData } from '~/types/dashboard'

defineProps<{
  stat: StatCardData
}>()

const trendColorClass = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return 'text-emerald-600 dark:text-emerald-400'
    case 'down': return 'text-rose-600 dark:text-rose-400'
    default: return 'text-gray-500 dark:text-gray-400'
  }
}

const trendIcon = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return 'i-lucide-trending-up'
    case 'down': return 'i-lucide-trending-down'
    default: return 'i-lucide-minus'
  }
}
</script>

<template>
  <UCard class="h-full">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-sm text-muted truncate">
          {{ stat.label }}
        </p>
        <p class="text-2xl font-semibold mt-1">
          {{ stat.value }}
        </p>
        <div
          v-if="stat.trend"
          class="flex items-center gap-1 mt-1"
          :class="trendColorClass(stat.trend.direction)"
        >
          <UIcon
            :name="trendIcon(stat.trend.direction)"
            class="size-3.5"
          />
          <span class="text-xs font-medium">
            {{ stat.trend.direction === 'neutral' ? '—' : `${stat.trend.percentage}%` }}
          </span>
        </div>
      </div>
      <div class="p-2 rounded-lg bg-primary/10 shrink-0">
        <UIcon
          :name="stat.icon"
          class="size-5 text-primary"
        />
      </div>
    </div>
  </UCard>
</template>
