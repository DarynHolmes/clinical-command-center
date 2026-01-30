# The "Pulse" Pattern

When a new value arrives via WebSocket, the value's background or text should briefly "pulse" a color (Indigo or Green) and then fade back to neutral. This mimics how vitals monitors (EKGs) draw attention to changing stats.

Implementation: The useFlash Composable

sample code:

```ts
// app/composables/useFlash.ts
export function useFlash(value: Ref<number | string>) {
  const isFlashing = ref(false)

  // Watch the source value for changes
  watch(value, () => {
    isFlashing.value = true
    // Reset after 800ms (enough time to see, fast enough to clear)
    setTimeout(() => {
      isFlashing.value = false
    }, 800)
  })

  return { isFlashing }
}
```

Applying it to your Biomarker Card
Now, wrap your value display. Use a CSS transition class to make the color change smooth.

```ts

<script setup lang="ts">
// ... existing props ...
const props = defineProps<{
  data: BiomarkerTrend
}>()

// We need a ref to the specific value we want to animate
const displayValue = computed(() => props.data.currentValue)

const { isFlashing } = useFlash(displayValue)
</script>

<template>
  <UCard>
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-gray-500 font-medium">{{ data.name }}</h3>
        </div>

      <div 
        class="text-2xl font-bold transition-colors duration-500 ease-out px-2 rounded"
        :class="isFlashing 
          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'  /* Flash State */
          : 'text-gray-900 dark:text-white bg-transparent'        /* Resting State */
        "
      >
        {{ data.currentValue }} <span class="text-xs text-gray-500 font-normal">{{ data.unit }}</span>
      </div>
    </div>

    </UCard>
</template>

```
