<script setup lang="ts">
import type { ProtocolSection } from '~/types/clinical'
import {
  getChangeTypeStyle,
  hasOldValue,
  hasNewValue,
  isValueTransition
} from '~/utils/amendmentChange'

defineProps<{
  sections: ProtocolSection[]
  version: string
  isBaseline?: boolean
}>()

const emit = defineEmits<{
  scroll: [scrollTop: number]
}>()

const scrollContainer = ref<HTMLElement | null>(null)

// Handle scroll events
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  emit('scroll', target.scrollTop)
}

// Method to set scroll position from external sync
const setScrollTop = (value: number) => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = value
  }
}

// Expose for synchronized scrolling
defineExpose({
  scrollContainer,
  setScrollTop
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- Version header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div class="flex items-center gap-2">
        <UBadge
          :color="isBaseline ? 'neutral' : 'primary'"
          variant="subtle"
          size="sm"
        >
          {{ version }}
        </UBadge>
        <span
          v-if="isBaseline"
          class="text-xs text-muted"
        >
          Baseline
        </span>
        <span
          v-else
          class="text-xs text-muted"
        >
          Selected
        </span>
      </div>
    </div>

    <!-- Scrollable content -->
    <div
      ref="scrollContainer"
      class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
      @scroll="handleScroll"
    >
      <UCard
        v-for="section in sections"
        :key="section.id"
      >
        <template #header>
          <h3 class="font-medium text-sm">
            {{ section.title }}
          </h3>
        </template>

        <div class="space-y-3">
          <div
            v-for="field in section.fields"
            :key="field.key"
            class="flex items-start justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
            :class="{
              'bg-emerald-50 dark:bg-emerald-900/20 -mx-4 px-4 rounded': field.diff?.changeType === 'biomarker_added' && !isBaseline,
              'bg-rose-50 dark:bg-rose-900/20 -mx-4 px-4 rounded': field.diff?.changeType === 'biomarker_removed' && !isBaseline
            }"
          >
            <div class="flex-1 min-w-0">
              <span class="text-sm text-muted">{{ field.label }}</span>

              <!-- Show diff badge if changed -->
              <UBadge
                v-if="field.diff && !isBaseline"
                :color="getChangeTypeStyle(field.diff.changeType).color"
                variant="subtle"
                size="xs"
                class="ml-2"
              >
                {{ getChangeTypeStyle(field.diff.changeType).label }}
              </UBadge>
            </div>

            <div class="text-right">
              <!-- Baseline view: show original value -->
              <template v-if="isBaseline">
                <span
                  v-if="field.diff && hasOldValue(field.diff.changeType)"
                  class="text-sm font-medium"
                >
                  {{ field.diff.oldValue }}
                </span>
                <span
                  v-else-if="field.value !== null"
                  class="text-sm font-medium"
                >
                  {{ field.value }}{{ field.unit ? ` ${field.unit}` : '' }}
                </span>
                <span
                  v-else
                  class="text-sm text-muted"
                >
                  —
                </span>
              </template>

              <!-- Selected version view: show new value with transition -->
              <template v-else>
                <div
                  v-if="field.diff"
                  class="flex items-center gap-2 justify-end"
                >
                  <span
                    v-if="hasOldValue(field.diff.changeType) && isValueTransition(field.diff.changeType)"
                    class="text-sm text-muted line-through"
                  >
                    {{ field.diff.oldValue }}
                  </span>
                  <UIcon
                    v-if="isValueTransition(field.diff.changeType)"
                    name="i-lucide-arrow-right"
                    class="size-3 text-muted shrink-0"
                  />
                  <span
                    v-if="hasNewValue(field.diff.changeType)"
                    class="text-sm font-medium"
                    :class="getChangeTypeStyle(field.diff.changeType).textClass"
                  >
                    {{ field.diff.newValue }}
                  </span>
                  <span
                    v-else
                    class="text-sm text-muted italic"
                  >
                    Removed
                  </span>
                </div>
                <span
                  v-else-if="field.value !== null"
                  class="text-sm font-medium"
                >
                  {{ field.value }}{{ field.unit ? ` ${field.unit}` : '' }}
                </span>
                <span
                  v-else
                  class="text-sm text-muted"
                >
                  —
                </span>
              </template>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
