import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as messagesApi from '../../api/messages'

export function useEditMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, text }: { messageId: string; text: string }) =>
      messagesApi.update(messageId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['dm-messages'] })
    },
  })
}
