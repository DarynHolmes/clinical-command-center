import { useQuery } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'

export function useProtocolWithHistory(id: MaybeRef<string>) {
  const protocolId = toRef(id)

  return useQuery({
    queryKey: ['protocols', protocolId, 'history'],
    queryFn: () => clinicalService.getProtocolWithHistory(protocolId.value),
    enabled: computed(() => !!protocolId.value)
  })
}
