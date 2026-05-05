import { useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useSendMessage } from '../../hooks/mutations/useSendMessage'
import { useAuthStore } from '../../stores/authStore'
import { FREE_CHANNELS } from '../../data/mock'
import { Tooltip } from '../ui/tooltip'

export function MessageInput() {
  const { activeChannelId } = useUIStore()
  const sendMessage = useSendMessage()
  const authUser = useAuthStore(s => s.user)
  const [value, setValue] = useState('')

  const channel = FREE_CHANNELS.find(c => c.id === activeChannelId)
  const channelName = channel?.name || 'geral'

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || !activeChannelId || !authUser) return

    sendMessage.mutate({ channelId: activeChannelId, text: trimmed })
    setValue('')
  }

  const iconBtn = 'w-[44px] h-[44px] rounded-lg border-none bg-transparent text-[var(--text-3)] cursor-pointer flex items-center justify-center flex-shrink-0 text-sm'

  return (
    <div className="px-5 py-4 border-t border-[var(--border)] flex-shrink-0">
      <div className="flex items-end gap-2 px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl transition-all duration-200">
        <Tooltip content="Anexar arquivo">
          <button className={iconBtn} aria-label="Anexar arquivo">📎</button>
        </Tooltip>
        <Tooltip content="Criar tarefa">
          <button className={iconBtn} aria-label="Criar tarefa">⊞</button>
        </Tooltip>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder={`Mensagem #${channelName}...`}
          className="flex-1 bg-transparent border-none outline-none text-[var(--text-1)] font-body text-sm leading-relaxed min-h-5 py-0.5"
        />
        <Tooltip content="Emoji">
          <button className={iconBtn} aria-label="Emoji">😊</button>
        </Tooltip>
        <Tooltip content="Enviar">
          <button
            onClick={handleSend}
            className={`${iconBtn} bg-[var(--accent)] text-white`}
            aria-label="Enviar"
          >
            ➤
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
