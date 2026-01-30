# The "Side-by-Side" Protocol Comparison

This view transforms the dashboard's "Recent Amendments" feed from a simple notification list into a deep-dive analysis tool.

- Version Pinning: Allow the user to "pin" a baseline version (e.g., v1.0) on the left and select any subsequent amendment (e.g., v2.3) on the right to see the cumulative delta.
- Synchronized Scrolling: As the researcher scrolls through the "Inclusion Criteria," both versions should move together to ensure they never lose context between the two documents.
- Delta Highlighting: Use your existing getChangeTypeStyle logic to subtly highlight the background of rows that contain changes, making it impossible to miss a "Tightened" threshold or a "Removed" safety marker.


## Implementation: The Detail Route

Structure the "pages/dashboard/protocols/[id].vue" to fetch the full protocol history using TanStack Query.

Sample code:
```ts
<template>
  <UDashboardPanel>
    <UDashboardNavbar :title="protocol?.title">
      <template #right>
        <USelectMenu v-model="compareVersion" :options="versionOptions" label="Compare with..." />
      </template>
    </UDashboardNavbar>

    <UDashboardPanelContent>
      <div class="grid grid-cols-2 gap-8 divide-x divide-gray-200 dark:divide-gray-800">
        <ProtocolVersionView :data="baselineData" />
        
        <ProtocolVersionView :data="currentData" :is-comparison="true" />
      </div>
    </UDashboardPanelContent>
  </UDashboardPanel>
</template>
```

## Service Layer Update

Sample code:
```ts
// app/services/clinical.service.ts
async getProtocolWithHistory(id: string) {
  return await pb.collection('protocols').getOne(id, {
    expand: 'amendments_via_protocol,biomarkers',
    sort: '-created'
  });
}
```

## Protocol Detail view

This view is the "drill-down" destination where a researcher analyzes the specific impact of an amendment within the context of the entire protocol.


### The Comparison Architecture
A "founding-level" diff isn't just a list of changes; it's a side-by-side reconstruction of the protocol document.

- Version Pinning: The left panel remains fixed on the "Baseline" (v1.0), while the right panel updates as the user selects different amendment versions (e.g., v1.4, v2.3).
- Synchronized Scrolling: When a researcher scrolls through "Inclusion Criteria" in the left panel, the right panel follows, ensuring they never lose track of which parameter they are comparing.
- Semantic Highlights: Every changed row uses the colors from your CHANGE_TYPE_STYLES to signal the nature of the change (Indigo for Tightened, Amber for Loosened).

### The ProtocolVersionView Component

This component renders the document body and intelligently highlights changes using the utility functions you already wrote.

Sample code, adjust as needed 

```ts

<template>
  <div class="space-y-6 p-4">
    <div v-for="section in protocolSections" :key="section.id" class="space-y-3">
      <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">
        {{ section.title }}
      </h3>
      
      <div v-for="item in section.items" :key="item.key" 
           :class="[
             'p-3 rounded-lg border transition-colors',
             getDiff(item.key) ? 'bg-indigo-50/50 border-indigo-100' : 'border-transparent'
           ]">
        <div class="flex justify-between items-start">
          <span class="text-sm font-medium">{{ item.label }}</span>
          
          <UBadge v-if="getDiff(item.key)" 
                  :color="getChangeTypeStyle(getDiff(item.key).type).color" 
                  variant="subtle" size="xs">
            {{ getChangeTypeStyle(getDiff(item.key).type).label }}
          </UBadge>
        </div>

        <div class="mt-1 flex items-center gap-2 text-sm">
          <span v-if="getDiff(item.key) && hasOldValue(getDiff(item.key).type)" 
                class="text-gray-400 line-through">
            {{ getDiff(item.key).oldValue }} {{ item.unit }}
          </span>
          
          <UIcon v-if="getDiff(item.key) && isValueTransition(getDiff(item.key).type)" 
                 name="i-heroicons-arrow-right" class="w-3 h-3 text-gray-400" />
          
          <span :class="getDiff(item.key) ? 'font-bold text-indigo-600' : 'text-gray-600'">
            {{ item.currentValue }} {{ item.unit }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getChangeTypeStyle, isValueTransition, hasOldValue } from '~/utils/protocol-diff'

const props = defineProps<{
  sections: any[],
  activeDiffs?: any[] // The diff array from the selected amendment
}>()

const getDiff = (key: string) => props.activeDiffs?.find(d => d.field === key)
</script>
```

## Routing: Navigating from Dashboard to Detail

Update the "Recent Amendments" feed so that clicking an item takes you directly to this comparison.

Sample code

```ts
<template>
  <UCard @click="navigateTo(`/dashboard/protocols/${amendment.protocolId}?v=${amendment.version}`)" 
         class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
    </UCard>
</template>
```

## Cognitive Stability vs. Real-time Accuracy

If a researcher is in the middle of a deep-dive analysis (e.g., comparing v1.0 to v2.3) and a new version (v2.4) is published, abruptly changing the data they are currently reading is a UX failure. It breaks their concentration and could lead to incorrect conclusions.

### The "Observer" Pattern: Non-Disruptive Sync


Instead of a "hard refresh" of the current view, you should use an Observer Pattern:

- Background Fetch: Keep the useSyncAmendments hook active to update the underlying cache.
- The "New Version Available" Banner: Display a subtle, floating notification at the top of the comparison tool: "A newer version (v2.4) of this protocol was just published by Dr. Patel. [View Changes]".
- Opt-in Update: The UI only updates the comparison logic once the user explicitly clicks the banner. This preserves the "Single Source of Truth" while protecting the researcher's active work state.

### Implementation: Targeted Invalidation

You can handle this by combining your existing real-time logic with a "stale" state indicator.

```ts
// app/composables/useProtocolSync.ts
export function useProtocolSync(protocolId: string) {
  const hasUpdates = ref(false)
  const newVersionTag = ref('')

  onMounted(() => {
    // Listen specifically for amendments to THIS protocol
    pb.collection('amendments').subscribe('*', (e) => {
      if (e.action === 'create' && e.record.protocol === protocolId) {
        hasUpdates.value = true
        newVersionTag.value = e.record.version_tag
        
        // Founding Move: Inform the user without interrupting them
        useToast().add({
          title: 'Update Available',
          description: `New version ${e.record.version_tag} is now available.`,
          actions: [{ label: 'Refresh View', click: () => window.location.reload() }]
        })
      }
    })
  })
}
```


## The Interaction Flow

The user navigates to the dynamic pages/dashboard/protocols/[id].vue route through these primary entry points:

- From the Amendment Feed: Clicking on any card in the "Recent Protocol Amendments" list. Because you've added a protocolId to your ProtocolAmendment interface, you can programmatically route them.
- From the Protocol List: Selecting a specific trial from the (currently placeholder) "Protocols" page.
- Via Real-time Toast: Clicking the "Jump to Diff" action on a real-time notification when a new amendment is published. (todo)

### Implementation: The Nuxt MapsTo Logic

To handle this cleanly in your Vue components, you use the MapsTo utility. This ensures the SPA (Single Page Application) transition is smooth and preserves the application state.

sample code:

```ts
<script setup lang="ts">
const props = defineProps<{
  amendment: ProtocolAmendment
}>()

function goToDetail() {
  // Navigates to e.g., /dashboard/protocols/cl9b7...
  // Optional: Pass the version as a query param to auto-select it
  navigateTo({
    path: `/dashboard/protocols/${props.amendment.protocolId}`,
    query: { v: props.amendment.version }
  })
}
</script>

<template>
  <UCard @click="goToDetail" class="cursor-pointer hover:border-primary-500 transition-colors">
    </UCard>
</template>
```

## Deep Linking
By using a dynamic route like /dashboard/protocols/[id], you've enabled Deep Linking.

- Collaboration: A researcher can copy the URL and Slack it to a colleague, who will land on the exact same comparison.
- State Persistence: If the user refreshes the page, the Nuxt router uses the [id] from the URL to re-fetch the correct protocol data from PocketBase.
