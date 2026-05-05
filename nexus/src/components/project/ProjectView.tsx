import { useState, useEffect, useCallback, startTransition } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { BoardView } from '../board/BoardView'
import * as cardThreadsApi from '../../api/card-threads'
import type { ThreadMessage, ThreadEvent } from '../../api/card-threads'

function ProjectTabs() {
  const { projectView, setProjectView } = useUIStore()
  const tabs = [
    { id: 'board' as const, label: '⊞ Board' },
    { id: 'timeline' as const, label: '🕐 Timeline' },
    { id: 'files' as const, label: '📁 Arquivos' },
  ]
  return (
    <div className="h-[38px] bg-[var(--s1)] border-b border-[var(--b1)] flex gap-1 px-4 flex-shrink-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setProjectView(tab.id)}
          className="px-3.5 py-2.5 text-xs font-medium border-none rounded-[var(--r-sm)] cursor-pointer font-body"
          style={{
            color: projectView === tab.id ? 'var(--t1)' : 'var(--t3)',
            background: projectView === tab.id ? 'var(--s2)' : 'transparent',
          }}
          onMouseEnter={e => { if (projectView !== tab.id) e.currentTarget.style.color = 'var(--t2)' }}
          onMouseLeave={e => { if (projectView !== tab.id) e.currentTarget.style.color = 'var(--t3)' }}
        >{tab.label}</button>
      ))}
    </div>
  )
}

function ThreadPanel() {
  const { threadOpen, threadCardId, closeThread } = useUIStore()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [events, setEvents] = useState<ThreadEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [cardTitle, setCardTitle] = useState('')

  const loadThread = useCallback(async (cardId: string) => {
    setLoading(true)
    try {
      const res = await cardThreadsApi.listThreadMessages(cardId)
      setMessages(res.messages)
      setEvents(res.events)
    } catch {
      setMessages([])
      setEvents([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (threadCardId) {
      startTransition(() => { loadThread(threadCardId); setCardTitle(threadCardId) })
    } else {
      startTransition(() => { setMessages([]); setEvents([]) })
    }
  }, [threadCardId, loadThread])

  const handleSend = async () => {
    if (!input.trim() || !threadCardId) return
    setSending(true)
    try {
      const msg = await cardThreadsApi.sendThreadMessage(threadCardId, input.trim())
      setMessages(prev => [...prev, msg])
      setInput('')
    } catch {
      // Silently fail
    }
    setSending(false)
  }

  return (
    <div className="flex-shrink-0 flex flex-col bg-[var(--s1)] overflow-hidden"
      style={{
        width: threadOpen ? 300 : 0,
        transition: 'width .28s cubic-bezier(.4,0,.2,1)',
        borderLeft: threadOpen ? '1px solid var(--b1)' : 'none',
      }}
    >
      {threadOpen && (
        <>
          <div className="h-12 border-b border-[var(--b1)] flex items-center px-3 flex-shrink-0 gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--t1)] overflow-hidden text-ellipsis whitespace-nowrap">
                {cardTitle ? `Card ${cardTitle.slice(0, 8)}` : 'Discussão geral'}
              </div>
            </div>
            <button onClick={closeThread} className="w-6 h-6 rounded-[var(--r-sm)] border-none bg-transparent text-[var(--t3)] cursor-pointer text-base flex items-center justify-center">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {loading && (
              <div className="text-center text-[11px] text-[var(--t3)] py-4">Carregando…</div>
            )}
            {!loading && events.length > 0 && (
              <>
                <Divider label="HISTÓRICO" />
                {events.map((ev, i) => (
                  <EventRow key={ev.id} event={ev} isLast={i === events.length - 1} />
                ))}
              </>
            )}
            {!loading && messages.length > 0 && (
              <>
                <Divider label={`DISCUSSÃO · ${messages.length}`} />
                {messages.map(msg => (
                  <MsgRow key={msg.id} msg={msg} />
                ))}
              </>
            )}
            {!loading && events.length === 0 && messages.length === 0 && (
              <div className="text-center text-[11px] text-[var(--t3)] py-4">
                Nenhuma atividade ainda
              </div>
            )}
          </div>

          <div className="p-2.5 border-t border-[var(--b1)] flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Escreva uma mensagem…"
              disabled={sending}
              className="w-full bg-[var(--s3)] border border-[var(--b2)] rounded-[var(--r)] px-2.5 py-2 text-xs text-[var(--t1)] font-body outline-none disabled:opacity-50"
            />
          </div>
        </>
      )}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px bg-[var(--b1)]" />
      <span className="text-[10px] font-bold text-[var(--t3)] tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-[var(--b1)]" />
    </div>
  )
}

const EVENT_ICON: Record<string, string> = {
  created: '✦', moved: '→', assigned: '👤', file: '📎', commented: '💬',
}

function EventRow({ event, isLast }: { event: ThreadEvent; isLast: boolean }) {
  return (
    <div className="flex gap-2 relative pl-2.5">
      {!isLast && (
        <div className="absolute left-[18px] top-[22px] bottom-[-10px] w-px bg-[var(--b1)]" />
      )}
      <div className="w-5 h-5 rounded-full bg-[var(--s3)] border border-[var(--b1)] flex items-center justify-center text-[9px] flex-shrink-0 z-10">
        {EVENT_ICON[event.type] || '✦'}
      </div>
      <div className="flex-1">
        <div className="text-xs text-[var(--t2)] leading-relaxed">{event.text}</div>
        <div className="text-[10px] text-[var(--t3)] mt-0.5">
          {new Date(event.timestamp).toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  )
}

function MsgRow({ msg }: { msg: ThreadMessage }) {
  return (
    <div className="flex gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
        style={{ background: msg.user?.color || 'var(--acc)' }}
      >
        {msg.user?.initials || '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-xs font-bold text-[var(--t1)]">{msg.user?.name || msg.userId}</span>
          <span className="text-[10px] text-[var(--t3)]">
            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-xs text-[var(--t2)] leading-relaxed">{msg.text}</div>
      </div>
    </div>
  )
}

export function ProjectView() {
  const { projectView } = useUIStore()
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ProjectTabs />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          {projectView === 'board' && <BoardView />}
          {projectView === 'timeline' && (
            <div className="flex-1 flex items-center justify-center text-[var(--t3)]">
              Timeline — em breve
            </div>
          )}
          {projectView === 'files' && (
            <div className="flex-1 flex items-center justify-center text-[var(--t3)]">
              Arquivos — em breve
            </div>
          )}
        </div>
        <ThreadPanel />
      </div>
    </div>
  )
}
