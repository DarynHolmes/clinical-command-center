// Composable for fetching protocols
import { useQuery } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'

export function useProtocols() {
  return useQuery({
    queryKey: ['protocols'],
    queryFn: () => clinicalService.getProtocols()
  })
}

export function useProtocol(id: string) {
  return useQuery({
    queryKey: ['protocols', id],
    queryFn: () => clinicalService.getProtocol(id),
    enabled: !!id
  })
}
