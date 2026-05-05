import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transformMessage } from '../../stores/dataStore'
import { useAuthStore } from '../../stores/authStore'
import * as messagesApi from '../../api/messages'

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ channelId, text }: { channelId: string; text: string }) =>
      messagesApi.create(channelId, text),
    onMutate: async ({ channelId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] })
      const previousData = queryClient.getQueryData(['messages', channelId])
      const currentUserId = useAuthStore.getState().user?.id ?? ''
      const optimisticMessage = transformMessage({
        id: `optimistic-${Date.now()}`,
        channelId,
        userId: currentUserId,
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: currentUserId,
          name: useAuthStore.getState().user?.name ?? '',
          initials: useAuthStore.getState().user?.initials ?? '',
          color: useAuthStore.getState().user?.color ?? '',
        },
        reactions: [],
        attachment: null,
        taskCard: null,
      }, currentUserId)

      queryClient.setQueryData(['messages', channelId], (old: typeof optimisticMessage[] | null) => {
        return old ? [...old, optimisticMessage] : [optimisticMessage]
      })
      return { previousData }
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['messages', variables.channelId], context.previousData)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.channelId] })
    },
  })
}
