<script setup lang="ts">
import type { SparklineData } from '~/types/dashboard'

const props = withDefaults(defineProps<{
  data: SparklineData
  width?: number
  height?: number
  showArea?: boolean
  strokeWidth?: number
}>(), {
  width: 120,
  height: 32,
  showArea: false,
  strokeWidth: 1.5
})

const padding = 2

const pathData = computed(() => {
  const { values, threshold } = props.data
  if (values.length < 2) return { line: '', area: '', thresholdY: null }

  const min = Math.min(...values, threshold ?? Infinity)
  const max = Math.max(...values, threshold ?? -Infinity)
  const range = max - min || 1

  const xStep = (props.width - padding * 2) / (values.length - 1)
  const yScale = (props.height - padding * 2) / range

  const points = values.map((v, i) => ({
    x: padding + i * xStep,
    y: props.height - padding - (v - min) * yScale
  }))

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const lastPoint = points[points.length - 1]!
  const area = props.showArea
    ? `${line} L ${lastPoint.x.toFixed(1)} ${props.height - padding} L ${padding} ${props.height - padding} Z`
    : ''

  const thresholdY = threshold !== undefined
    ? props.height - padding - (threshold - min) * yScale
    : null

  return { line, area, thresholdY }
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    class="overflow-visible"
  >
    <!-- Threshold reference line -->
    <line
      v-if="pathData.thresholdY !== null"
      :x1="padding"
      :x2="width - padding"
      :y1="pathData.thresholdY"
      :y2="pathData.thresholdY"
      class="stroke-amber-500/60 dark:stroke-amber-400/60"
      stroke-dasharray="3,2"
      stroke-width="1.5"
    />
    <!-- Threshold label -->
    <text
      v-if="pathData.thresholdY !== null"
      :x="width - padding"
      :y="pathData.thresholdY - 2"
      class="fill-amber-600 dark:fill-amber-400 text-[8px]"
      text-anchor="end"
    >
      target
    </text>

    <!-- Area fill -->
    <path
      v-if="showArea && pathData.area"
      :d="pathData.area"
      class="fill-indigo-500/10 dark:fill-indigo-400/10"
    />

    <!-- Line -->
    <path
      :d="pathData.line"
      fill="none"
      class="stroke-indigo-500 dark:stroke-indigo-400"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
