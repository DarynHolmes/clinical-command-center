<script setup lang="ts">
import type { ProtocolAmendment, AmendmentChangeType } from '~/types/dashboard'

defineProps<{
  amendments: ProtocolAmendment[]
}>()

const goToDetail = (amendment: ProtocolAmendment) => {
  navigateTo({
    path: `/dashboard/protocols/${amendment.protocolId}`,
    query: { v: amendment.version }
  })
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getTimelineIcon = (diffs: { changeType: AmendmentChangeType }[]) => {
  if (diffs.some(d => d.changeType === 'biomarker_removed')) return 'i-lucide-minus-circle'
  if (diffs.some(d => d.changeType === 'biomarker_added')) return 'i-lucide-plus-circle'
  if (diffs.some(d => d.changeType === 'threshold_tightened')) return 'i-lucide-shield-check'
  return 'i-lucide-file-edit'
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">
          Recent Protocol Amendments
        </h2>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          trailing-icon="i-lucide-arrow-right"
        >
          View All
        </UButton>
      </div>
    </template>

    <div
      v-if="amendments.length === 0"
      class="text-center py-8 text-muted"
    >
      No recent amendments
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div
        v-for="amendment in amendments"
        :key="amendment.id"
        class="relative pl-6 pb-6 border-l-2 border-gray-200 dark:border-gray-700 last:pb-0 cursor-pointer group"
        @click="goToDetail(amendment)"
      >
        <div
          class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center"
        >
          <UIcon
            :name="getTimelineIcon(amendment.diffs)"
            class="size-3 text-muted"
          />
        </div>

        <div class="space-y-2 rounded-lg p-2 -m-2 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-medium text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ amendment.protocolTitle }}
              </p>
              <p class="text-xs text-muted">
                {{ amendment.version }} · {{ amendment.author }}
              </p>
            </div>
            <span class="text-xs text-muted shrink-0">
              {{ formatTime(amendment.timestamp) }}
            </span>
          </div>

          <p class="text-sm text-muted">
            {{ amendment.summary }}
          </p>

          <DashboardAmendmentDiff :diffs="amendment.diffs" />
        </div>
      </div>
    </div>
  </UCard>
</template>
