<script setup lang="ts">
import type { StatCardData } from '~/types/dashboard'
import { useBiomarkerTrends } from '~/composables/useBiomarkers'
import { useRecentAmendments } from '~/composables/useAmendments'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Fetch data from PocketBase
const { data: biomarkerTrends, isPending: trendsLoading, error: trendsError } = useBiomarkerTrends()
const { data: recentAmendments, isPending: amendmentsLoading, error: amendmentsError } = useRecentAmendments()

// Section 1: TOP - Status & Targets (Clinical-focused KPIs)
// These remain static for now - would connect to aggregated data endpoints
const stats: StatCardData[] = [
  {
    label: 'Enrollment Velocity',
    value: '12.4/week',
    icon: 'i-lucide-trending-up',
    trend: { direction: 'up', percentage: 8.2 }
  },
  {
    label: 'Protocol Health',
    value: '94%',
    icon: 'i-lucide-heart-pulse',
    trend: { direction: 'up', percentage: 2.1 }
  },
  {
    label: 'Active Amendments',
    value: '3',
    icon: 'i-lucide-file-diff',
    trend: { direction: 'neutral', percentage: 0 }
  },
  {
    label: 'Data Freshness',
    value: '2m ago',
    icon: 'i-lucide-clock'
  }
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold">
        Trial Dashboard
      </h1>
      <p class="text-muted mt-1">
        Real-time clinical trial monitoring and biomarker tracking
      </p>
    </div>

    <!-- Section 1: TOP - Status & Targets -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        v-for="stat in stats"
        :key="stat.label"
        :stat="stat"
      />
    </div>

    <!-- Section 2: MIDDLE - Biomarker Trends -->
    <UAlert
      v-if="trendsError"
      color="rose"
      icon="i-lucide-alert-circle"
      title="Failed to load biomarker data"
      :description="trendsError.message"
    />
    <UCard v-else-if="trendsLoading">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Biomarker Trends
          </h2>
          <USkeleton class="h-5 w-20" />
        </div>
      </template>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <div
          v-for="i in 8"
          :key="i"
          class="px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <div class="flex items-start justify-between gap-1.5 mb-1">
            <div class="space-y-1">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-12" />
            </div>
            <USkeleton class="h-5 w-10" />
          </div>
          <USkeleton class="h-6 w-full mt-1" />
        </div>
      </div>
    </UCard>
    <DashboardTrendSection
      v-else
      :trends="biomarkerTrends ?? []"
    />

    <!-- Section 3: BOTTOM - Recent Amendments -->
    <UAlert
      v-if="amendmentsError"
      color="rose"
      icon="i-lucide-alert-circle"
      title="Failed to load amendments"
      :description="amendmentsError.message"
    />
    <UCard v-else-if="amendmentsLoading">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Recent Protocol Amendments
          </h2>
          <USkeleton class="h-6 w-20" />
        </div>
      </template>
      <div class="space-y-6">
        <div
          v-for="i in 3"
          :key="i"
          class="relative pl-6 pb-6 border-l-2 border-gray-200 dark:border-gray-700 last:pb-0"
        >
          <div class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700" />
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-1">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>
              <USkeleton class="h-3 w-12" />
            </div>
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-8 w-full" />
          </div>
        </div>
      </div>
    </UCard>
    <DashboardAmendmentFeed
      v-else
      :amendments="recentAmendments ?? []"
    />
  </div>
</template>
