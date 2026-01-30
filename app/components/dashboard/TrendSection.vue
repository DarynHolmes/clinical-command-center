<script setup lang="ts">
import type { BiomarkerTrend } from '~/types/dashboard'

const props = defineProps<{
  trends: BiomarkerTrend[]
}>()

// Pulse effect state for WebSocket updates
const flashingIds = ref(new Set<string>())
const previousValues = new Map<string, number>()

watch(() => props.trends, (trends) => {
  trends.forEach((trend) => {
    const prev = previousValues.get(trend.id)
    if (prev !== undefined && prev !== trend.currentValue) {
      flashingIds.value.add(trend.id)
      setTimeout(() => {
        flashingIds.value.delete(trend.id)
      }, 800)
    }
    previousValues.set(trend.id, trend.currentValue)
  })
}, { deep: true })

const categoryBadge = (category: BiomarkerTrend['category']) => {
  switch (category) {
    case 'efficacy':
      return { label: 'Efficacy', color: 'primary' as const }
    case 'safety':
      return { label: 'Safety', color: 'rose' as const }
    case 'exploratory':
      return { label: 'Exploratory', color: 'neutral' as const }
  }
}

// Calculate trend direction from recent values for accessibility icons
const getTrendDirection = (values: number[]) => {
  if (values.length < 2) return 'neutral'
  const recent = values.slice(-3)
  const first = recent[0]
  const last = recent[recent.length - 1]
  if (first === undefined || last === undefined) return 'neutral'
  const change = last - first
  if (Math.abs(change) < 0.01 * first) return 'neutral'
  return change > 0 ? 'up' : 'down'
}

const trendMeta = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return { icon: 'i-lucide-trending-up', class: 'text-emerald-600 dark:text-emerald-400' }
    case 'down':
      return { icon: 'i-lucide-trending-down', class: 'text-rose-600 dark:text-rose-400' }
    default:
      return { icon: 'i-lucide-minus', class: 'text-gray-400' }
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">
          Biomarker Trends
        </h2>
        <UBadge
          color="neutral"
          variant="subtle"
          size="sm"
        >
          Last 30 days
        </UBadge>
      </div>
    </template>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      <div
        v-for="trend in trends"
        :key="trend.id"
        class="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div class="flex items-start justify-between gap-1.5 mb-1">
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <p class="font-medium text-sm truncate">
                {{ trend.name }}
              </p>
              <UIcon
                :name="trendMeta(getTrendDirection(trend.data.values)).icon"
                :class="['size-3.5 shrink-0', trendMeta(getTrendDirection(trend.data.values)).class]"
              />
            </div>
            <UBadge
              :color="categoryBadge(trend.category).color"
              variant="subtle"
              size="xs"
            >
              {{ categoryBadge(trend.category).label }}
            </UBadge>
          </div>
          <p
            :class="[
              'text-base font-semibold tabular-nums shrink-0 px-1.5 rounded transition-colors duration-500 ease-out',
              flashingIds.has(trend.id)
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                : 'text-gray-900 dark:text-white bg-transparent'
            ]"
          >
            {{ trend.currentValue }}
            <span
              v-if="trend.unit"
              class="text-[10px] text-muted font-normal"
            >{{ trend.unit }}</span>
          </p>
        </div>
        <DashboardSparklineChart
          :data="trend.data"
          :width="130"
          :height="24"
          :show-area="true"
        />
      </div>
    </div>
  </UCard>
</template>
