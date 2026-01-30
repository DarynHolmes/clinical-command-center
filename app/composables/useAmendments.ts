// Composable for fetching amendments
import { useQuery } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'

export function useRecentAmendments(limit = 10) {
  return useQuery({
    queryKey: ['amendments', 'recent', limit],
    queryFn: () => clinicalService.getRecentAmendments(limit)
  })
}
