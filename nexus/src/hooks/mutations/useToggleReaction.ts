import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as messagesApi from '../../api/messages'

export function useToggleReaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messagesApi.toggleReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['dm-messages'] })
    },
  })
}
