<script setup lang="ts">
import { useProtocolWithHistory } from '~/composables/useProtocolWithHistory'
import { useProtocolSync } from '~/composables/useProtocolSync'
import { useBiomarkersByProtocol } from '~/composables/useBiomarkers'
import { computeCumulativeDiffs, buildProtocolSections, getVersionOptions } from '~/utils/protocolDiff'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const protocolId = computed(() => route.params.id as string)

// Fetch protocol with history and biomarkers
const {
  data: protocolHistory,
  isPending: historyLoading,
  error: historyError,
  refetch: refetchHistory
} = useProtocolWithHistory(protocolId)

const {
  data: biomarkers,
  isPending: biomarkersLoading
} = useBiomarkersByProtocol(protocolId)

// Real-time sync
const { hasUpdates, newVersionTag, refreshView } = useProtocolSync(protocolId)

// Version selection from query param or default to latest
const selectedVersion = ref<string | undefined>(undefined)

// Initialize selected version from query param or latest amendment
watch(
  [() => route.query.v, protocolHistory],
  ([queryVersion, history]) => {
    if (queryVersion && typeof queryVersion === 'string') {
      selectedVersion.value = queryVersion
    } else if (history?.amendments.length) {
      // Default to latest version
      const lastAmendment = history.amendments[history.amendments.length - 1]
      if (lastAmendment) {
        selectedVersion.value = lastAmendment.version
      }
    }
  },
  { immediate: true }
)

// Update URL when version changes
watch(selectedVersion, (version) => {
  if (version && version !== route.query.v) {
    router.replace({
      query: { ...route.query, v: version }
    })
  }
})

// Version options for dropdown
const versionOptions = computed(() => {
  if (!protocolHistory.value?.amendments.length) return []
  return getVersionOptions(protocolHistory.value.amendments)
})

// Compute cumulative diffs for selected version
const cumulativeDiffs = computed(() => {
  if (!protocolHistory.value?.amendments.length || !selectedVersion.value) return []
  return computeCumulativeDiffs(
    protocolHistory.value.amendments,
    selectedVersion.value
  )
})

// Compute sections for baseline (same diffs, VersionView shows oldValue)
const baselineSections = computed(() => {
  if (!protocolHistory.value?.protocol || !biomarkers.value) return []
  return buildProtocolSections(
    protocolHistory.value.protocol,
    biomarkers.value,
    cumulativeDiffs.value
  )
})

// Compute sections for selected version (same diffs, VersionView shows newValue)
const selectedSections = computed(() => {
  if (!protocolHistory.value?.protocol || !biomarkers.value) return []
  return buildProtocolSections(
    protocolHistory.value.protocol,
    biomarkers.value,
    cumulativeDiffs.value
  )
})

// Synchronized scrolling
const leftPanel = ref<{ setScrollTop: (v: number) => void } | null>(null)
const rightPanel = ref<{ setScrollTop: (v: number) => void } | null>(null)
const isScrolling = ref(false)

const handleLeftScroll = (scrollTop: number) => {
  if (isScrolling.value) return
  isScrolling.value = true
  rightPanel.value?.setScrollTop(scrollTop)
  requestAnimationFrame(() => {
    isScrolling.value = false
  })
}

const handleRightScroll = (scrollTop: number) => {
  if (isScrolling.value) return
  isScrolling.value = true
  leftPanel.value?.setScrollTop(scrollTop)
  requestAnimationFrame(() => {
    isScrolling.value = false
  })
}

// Loading state
const isLoading = computed(() => historyLoading.value || biomarkersLoading.value)

// Protocol title
const protocolTitle = computed(() => protocolHistory.value?.protocol.title ?? 'Protocol')
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-arrow-left"
            size="sm"
            to="/dashboard"
          />
          <div class="min-w-0">
            <h1 class="text-lg font-semibold truncate">
              {{ protocolTitle }}
            </h1>
            <p class="text-sm text-muted">
              Protocol Version Comparison
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- New version banner -->
          <UBadge
            v-if="hasUpdates"
            color="primary"
            variant="subtle"
            class="cursor-pointer"
            @click="refreshView"
          >
            <UIcon
              name="i-lucide-bell"
              class="size-3 mr-1"
            />
            {{ newVersionTag }} available
          </UBadge>

          <!-- Version selector -->
          <USelectMenu
            v-if="versionOptions.length"
            v-model="selectedVersion"
            :items="versionOptions"
            value-key="value"
            class="w-64"
            placeholder="Select version"
          >
            <template #leading>
              <UIcon
                name="i-lucide-git-branch"
                class="size-4 text-muted"
              />
            </template>
          </USelectMenu>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-if="historyError"
      class="flex-1 flex items-center justify-center p-6"
    >
      <UAlert
        color="rose"
        icon="i-lucide-alert-circle"
        title="Unable to load protocol"
        :description="historyError.message"
        class="max-w-md"
      >
        <template #actions>
          <UButton
            color="rose"
            variant="soft"
            size="sm"
            @click="refetchHistory()"
          >
            Retry
          </UButton>
          <UButton
            variant="ghost"
            size="sm"
            to="/dashboard"
          >
            Back to Dashboard
          </UButton>
        </template>
      </UAlert>
    </div>

    <!-- Loading state -->
    <div
      v-else-if="isLoading"
      class="flex-1 grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700"
    >
      <div class="p-4 space-y-4">
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <USkeleton class="h-5 w-20" />
        </div>
        <UCard
          v-for="i in 3"
          :key="i"
        >
          <template #header>
            <USkeleton class="h-4 w-32" />
          </template>
          <div class="space-y-3">
            <div
              v-for="j in 4"
              :key="j"
              class="flex justify-between py-2"
            >
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-4 w-16" />
            </div>
          </div>
        </UCard>
      </div>
      <div class="p-4 space-y-4">
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <USkeleton class="h-5 w-20" />
        </div>
        <UCard
          v-for="i in 3"
          :key="i"
        >
          <template #header>
            <USkeleton class="h-4 w-32" />
          </template>
          <div class="space-y-3">
            <div
              v-for="j in 4"
              :key="j"
              class="flex justify-between py-2"
            >
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-4 w-16" />
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- No amendments state -->
    <div
      v-else-if="!protocolHistory?.amendments.length"
      class="flex-1 flex items-center justify-center p-6"
    >
      <div class="text-center">
        <UIcon
          name="i-lucide-file-diff"
          class="size-12 text-muted mb-4"
        />
        <h2 class="text-lg font-medium mb-2">
          No Versions to Compare
        </h2>
        <p class="text-muted max-w-md">
          This protocol hasn't been amended yet. When changes are made, you'll be able to compare versions here.
        </p>
        <UButton
          class="mt-4"
          variant="soft"
          to="/dashboard"
        >
          Back to Dashboard
        </UButton>
      </div>
    </div>

    <!-- Side-by-side comparison -->
    <div
      v-else
      class="flex-1 min-h-0 grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 overflow-hidden"
    >
      <!-- Left panel: Baseline (v1.0) -->
      <ProtocolVersionView
        ref="leftPanel"
        :sections="baselineSections"
        version="v1.0"
        :is-baseline="true"
        @scroll="handleLeftScroll"
      />

      <!-- Right panel: Selected version -->
      <ProtocolVersionView
        ref="rightPanel"
        :sections="selectedSections"
        :version="selectedVersion ?? 'v1.0'"
        :is-baseline="false"
        @scroll="handleRightScroll"
      />
    </div>
  </div>
</template>
