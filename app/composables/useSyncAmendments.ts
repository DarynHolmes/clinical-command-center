// Real-time sync composable for protocol amendments
import { onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'
import type { ProtocolAmendment } from '~/types/dashboard'

export function useSyncAmendments(limit = 10) {
  const queryClient = useQueryClient()
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = clinicalService.subscribeToAmendments((amendment: ProtocolAmendment, action: string) => {
      // Update the amendments cache
      queryClient.setQueryData<ProtocolAmendment[]>(['amendments', 'recent', limit], (oldData) => {
        if (!oldData) return [amendment]

        if (action === 'create') {
          // Add new amendment at the beginning, maintain limit
          const newData = [amendment, ...oldData]
          return newData.slice(0, limit)
        }

        // For updates, find and replace
        const index = oldData.findIndex(item => item.id === amendment.id)
        if (index !== -1) {
          const newData = [...oldData]
          newData[index] = amendment
          return newData
        }

        return oldData
      })
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
}
