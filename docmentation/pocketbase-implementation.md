
# Pocketbase Implementation




## The "Bridge" to PocketBase 

Don't let PocketBase's raw structure leak into the components. Use a clean mapping function in the service layer. Decouple the UI components from the raw database schema. Ensures the backend can evolve and change over time.

Example code:

```ts
// services/mappers.ts
import type { ProtocolAmendment } from '@/types/clinical'

export const mapRecordToAmendment = (record: any): ProtocolAmendment => ({
  id: record.id,
  protocolId: record.protocol,
  protocolTitle: record.expand?.protocol?.title || 'Unknown Study',
  version: record.version_tag,
  timestamp: record.created,
  author: record.expand?.user?.name || 'System',
  summary: record.change_description,
  diffs: record.metadata?.diffs || [] // Transforming JSON metadata to your UI diffs
})
```

## 
