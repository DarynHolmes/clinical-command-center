<script setup lang="ts">
import type { AmendmentDiffItem } from '~/types/dashboard'
import {
  getChangeTypeStyle,
  hasOldValue,
  hasNewValue,
  isValueTransition
} from '~/utils/amendmentChange'

defineProps<{
  diffs: AmendmentDiffItem[]
}>()
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(diff, index) in diffs"
      :key="index"
      class="flex items-center gap-2 text-sm"
    >
      <span
        class="px-1.5 py-0.5 rounded text-xs font-medium shrink-0"
        :class="[getChangeTypeStyle(diff.changeType).bgClass, getChangeTypeStyle(diff.changeType).textClass]"
      >
        {{ getChangeTypeStyle(diff.changeType).label }}
      </span>
      <span class="text-muted truncate">{{ diff.field }}:</span>
      <span
        v-if="hasOldValue(diff.changeType)"
        class="line-through text-muted/60"
      >
        {{ diff.oldValue }}
      </span>
      <UIcon
        v-if="isValueTransition(diff.changeType)"
        name="i-lucide-arrow-right"
        class="size-3 text-muted shrink-0"
      />
      <span
        v-if="hasNewValue(diff.changeType)"
        class="font-medium"
      >
        {{ diff.newValue }}
      </span>
    </div>
  </div>
</template>
