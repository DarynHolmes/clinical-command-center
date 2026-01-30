# Design 

## 1. Schema Architecture: Protocols & Biomarkers

This collection shouldn't just store a name; it needs to represent a living document.

Collection: protocols
- id: (System Default)
- title: Text (The clinical study name)
- phase: Select (I, II, III, IV)
- status: Select (Draft, Active, Amended, Archived)
- version_id: Number/Text (e.g., "v2.1" — essential for the "Amendment" pain point)
- parent_protocol: Relation (Self-reference to protocols.id).


Collection: biomarkers
Scientific data is high-frequency and specific. We need strict typing here.

Collection: biomarkers
- name: Text (e.g., "HER2", "HbA1c")
- protocol_id: Relation (Link to protocols.id)
- category: Select (Safety, Efficacy, Exploratory)
- data_type: Select (Numeric, Boolean, Categorical)
- baseline_value: Number (Crucial for measuring optimization)
- target_threshold: Number
- frequency: Text (e.g., "Daily", "Per Cycle")


## 2. Implementation: TypeScript Interfaces

```ts
// types/clinical.ts

export interface Protocol {
  id: string;
  title: string;
  version_id: string;
  parent_protocol?: string; // For amendment tracking
  status: 'draft' | 'active' | 'amended';
  last_amended_at: string;
  metadata: {
    enrollment_target: number;
    therapeutic_area: string;
  };
}

export interface Biomarker {
  id: string;
  protocol_id: string;
  name: string;
  category: 'safety' | 'efficacy';
  target_threshold: number;
  current_value: number; // High-frequency data point
}

```

## 3. Real-Time Subscription Pattern (The "Alive" UI)

To make Luvida feel like a modern AI tool, the UI must react instantly to backend optimizations. Use this pattern in your setup() block:

```ts
import { onMounted, onUnmounted, ref } from 'vue';
import { pb } from '@/services/pocketbase';

const biomarkers = ref<Biomarker[]>([]);

onMounted(async () => {
  // 1. Initial Load
  biomarkers.value = await pb.collection('biomarkers').getFullList<Biomarker>();

  // 2. Real-time Subscription for "High-Frequency" updates
  pb.collection('biomarkers').subscribe('*', (e) => {
    if (e.action === 'update') {
      const index = biomarkers.value.findIndex(b => b.id === e.record.id);
      if (index !== -1) biomarkers.value[index] = e.record as unknown as Biomarker;
    }
  });
});

onUnmounted(() => pb.collection('biomarkers').unsubscribe());
```

## 4. Recommended Architecture: The Service Layer

### Using The "Repository-Lite" (Functional Service) Compromise

```ts
// @/services/api.ts
import { pb } from './pocketbase';
import type { Protocol } from '@/types/clinical';

// Simple functional export is easier to refactor later than a class
export const fetchProtocols = () => 
  pb.collection('protocols').getFullList<Protocol>({ sort: '-version_id' });

// @/composables/useProtocols.ts
import { useQuery } from '@tanstack/vue-query';
import { fetchProtocols } from '@/services/api';

export const useProtocols = () => useQuery({
  queryKey: ['protocols'],
  queryFn: fetchProtocols, // Pure, clean, and decoupled from component logic
});

```

### Functional data layer 

```ts
// services/clinical.service.ts
import { pb } from './pocketbase';
import type { ProtocolAmendment, BiomarkerTrend } from '@/types/clinical';
import { mapToAmendment, mapToTrend } from './mappers';

export const clinicalService = {
  // Fetch amendments with 'expand' to get user and protocol details
  async getRecentAmendments(): Promise<ProtocolAmendment[]> {
    const records = await pb.collection('amendments').getList(1, 10, {
      sort: '-created',
      expand: 'protocol_id,author_id',
    });
    return records.items.map(mapToAmendment);
  },

  // Real-time subscription helper for the "Alive" UI
  subscribeToBiomarkers(callback: (trend: BiomarkerTrend) => void) {
    return pb.collection('biomarkers').subscribe('*', ({ action, record }) => {
      if (action === 'update' || action === 'create') {
        callback(mapToTrend(record));
      }
    });
  }
};
```


## 5. High-Density UI Pattern

Use the destructured states to manage complex scientific workflows without the "flicker" of standard loaders.

```ts
<script setup lang="ts">
import { useProtocols } from '@/composables/useProtocols'

const { data: protocols, isLoading, isError, isFetching } = useProtocols()
</script>

<template>
  <div class="protocol-dashboard">
    <div v-if="isFetching" class="sync-indicator">Updating Trial Data...</div>

    <div v-if="isLoading">Analyzing Protocol Schema...</div>
    
    <div v-else-if="isError">
      Failed to load clinical data. Please check your connection.
    </div>

    <ProtocolTable v-else :data="protocols" />
  </div>
</template>
```

## 6. The Sync Pattern

To do this effectively, we use the QueryClient to manually update the cache whenever a PocketBase event fires. This avoids unnecessary network round-trips because the PocketBase event payload already contains the updated record.

```ts
// composables/useSyncBiomarkers.ts
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { pb } from '@/services/pocketbase';
import type { Biomarker } from '@/types/clinical';

export const useSyncBiomarkers = () => {
  const queryClient = useQueryClient();

  onMounted(() => {
    // Subscribe to all changes in the biomarkers collection
    pb.collection('biomarkers').subscribe('*', (e) => {
      const queryKey = ['biomarkers'];

      if (e.action === 'update' || e.action === 'create') {
        // Manually update the cache with the record from the event payload
        queryClient.setQueryData(queryKey, (oldData: Biomarker[] | undefined) => {
          if (!oldData) return [e.record as unknown as Biomarker];
          
          const index = oldData.findIndex(item => item.id === e.record.id);
          if (index !== -1) {
            // Replace existing item
            const newData = [...oldData];
            newData[index] = e.record as unknown as Biomarker;
            return newData;
          }
          // Append new item
          return [...oldData, e.record as unknown as Biomarker];
        });
      }

      if (e.action === 'delete') {
        queryClient.setQueryData(queryKey, (oldData: Biomarker[] | undefined) => {
          return oldData ? oldData.filter(item => item.id !== e.record.id) : [];
        });
      }
    });
  });

  onUnmounted(() => {
    pb.collection('biomarkers').unsubscribe();
  });
};
```
Why This Matters for Luvida
- Atomic Updates: Instead of refetching the entire list of 500+ biomarkers (which is expensive and slow), you surgically update the exact record that changed.
- State Consistency: If a researcher in London updates a recruitment target, the researcher in New York sees the UI update instantly without clicking "Refresh."
- Reduced Server Load: You move from a "Polling" architecture to an "Event-Driven" architecture, which is significantly more scalable as the clinical data scales.

## 7. Handling "Data-Heavy" Views

When dealing with scientific workflows, you'll likely have thousands of data points. Merely updating the cache isn't enough; you need to ensure the UI remains performant.
- Intelligent Invalidation: For complex protocol changes that affect multiple related collections, use queryClient.invalidateQueries({ queryKey: ['protocols'] }) instead of a manual update to ensure all derived data is recalculated.
- Optimistic UI: When a user edits a protocol, use Vue Query's onMutate to update the cache before the PocketBase request finishes, providing zero-latency feedback.

## The "Interview Edge" (Design Rationale)
When the hiring manager asks why you structured the data this way, give them this:

Design Rationale: "By implementing a recursive parent_protocol relation and a version_id at the schema level, I’m treating trial amendments as first-class citizens, ensuring researchers can instantly audit how design changes impact biomarker thresholds over the trial's lifecycle."

## Critical Challenge
A standard engineer would list all biomarkers in a simple table. For a Founding Engineer, I want you to think about Information Density.
