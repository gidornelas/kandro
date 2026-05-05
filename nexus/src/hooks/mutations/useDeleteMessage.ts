import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as messagesApi from '../../api/messages'

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => messagesApi.remove(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['dm-messages'] })
    },
  })
}
