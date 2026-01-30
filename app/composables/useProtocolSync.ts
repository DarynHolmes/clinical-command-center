import { ref, onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { clinicalService } from '~/services/clinical.service'
import type { ProtocolAmendment, ProtocolWithHistory } from '~/types/clinical'

export function useProtocolSync(protocolId: MaybeRef<string>) {
  const id = toRef(protocolId)
  const queryClient = useQueryClient()
  const toast = useToast()

  const hasUpdates = ref(false)
  const newVersionTag = ref<string | null>(null)

  let unsubscribe: (() => void) | null = null

  const refreshView = () => {
    queryClient.invalidateQueries({
      queryKey: ['protocols', id.value, 'history']
    })
    hasUpdates.value = false
    newVersionTag.value = null
  }

  onMounted(() => {
    if (!id.value) return

    unsubscribe = clinicalService.subscribeToProtocolAmendments(
      id.value,
      (amendment: ProtocolAmendment, action: string) => {
        if (action === 'create') {
          hasUpdates.value = true
          newVersionTag.value = amendment.version

          toast.add({
            title: 'Update Available',
            description: `New version ${amendment.version} is now available.`,
            icon: 'i-lucide-bell',
            color: 'primary',
            actions: [
              {
                label: 'Refresh View',
                onClick: refreshView
              }
            ]
          })
        }

        // For updates, silently update the cache
        if (action === 'update') {
          queryClient.setQueryData<ProtocolWithHistory>(
            ['protocols', id.value, 'history'],
            (oldData) => {
              if (!oldData) return oldData

              const updatedAmendments = oldData.amendments.map(a =>
                a.id === amendment.id ? amendment : a
              )

              return {
                ...oldData,
                amendments: updatedAmendments
              }
            }
          )
        }
      }
    )
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    hasUpdates: readonly(hasUpdates),
    newVersionTag: readonly(newVersionTag),
    refreshView
  }
}
