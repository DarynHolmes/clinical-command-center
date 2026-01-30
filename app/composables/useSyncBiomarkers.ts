// Real-time sync composable for biomarkers
import { onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'
import type { BiomarkerTrend } from '~/types/dashboard'

export function useSyncBiomarkers() {
  const queryClient = useQueryClient()
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = clinicalService.subscribeToBiomarkers((trend: BiomarkerTrend) => {
      // Update the biomarker-trends cache
      queryClient.setQueryData<BiomarkerTrend[]>(['biomarker-trends'], (oldData) => {
        if (!oldData) return [trend]

        const index = oldData.findIndex(item => item.id === trend.id)
        if (index !== -1) {
          const newData = [...oldData]
          newData[index] = trend
          return newData
        }
        return [...oldData, trend]
      })
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
}
