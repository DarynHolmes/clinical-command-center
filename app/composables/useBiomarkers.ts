// Composable for fetching biomarkers
import { useQuery } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'

export function useBiomarkers() {
  return useQuery({
    queryKey: ['biomarkers'],
    queryFn: () => clinicalService.getBiomarkers()
  })
}

export function useBiomarkerTrends() {
  return useQuery({
    queryKey: ['biomarker-trends'],
    queryFn: () => clinicalService.getBiomarkerTrends()
  })
}

export function useBiomarkersByProtocol(protocolId: MaybeRef<string>) {
  const id = toRef(protocolId)

  return useQuery({
    queryKey: ['biomarkers', 'protocol', id],
    queryFn: () => clinicalService.getBiomarkersByProtocol(id.value),
    enabled: computed(() => !!id.value)
  })
}
