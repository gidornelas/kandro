import { memo } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { PROJECTS, FREE_CHANNELS, USERS, DMS } from '../../data/mock'

const ContextHeader = memo(function ContextHeader() {
  const { mainMode, activeProjectId, activeChannelId, activeDmId, openThread } = useUIStore()

  const project = activeProjectId ? PROJECTS.find(p => p.id === activeProjectId) : null
  const channel = activeChannelId ? FREE_CHANNELS.find(c => c.id === activeChannelId) : null
  const dmUser = activeDmId ? USERS[DMS.find(d => d.id === activeDmId)?.userId ?? ''] : null

  const sep = <div className="w-px h-4 bg-[var(--b2)] flex-shrink-0" />
  const hBtn = 'min-h-[44px] px-2.5 rounded-[var(--r-sm)] border border-[var(--b2)] bg-[var(--s2)] text-[var(--t2)] text-xs font-body cursor-pointer flex items-center gap-1 flex-shrink-0 whitespace-nowrap'

  if (mainMode === 'voice') return null

  return (
    <div className="h-12 bg-[var(--s1)] border-b border-[var(--b1)] flex items-center px-4 gap-2.5 flex-shrink-0">
      {mainMode === 'project' && project && (
        <>
          <span className="text-sm text-[var(--acc)]">◈</span>
          <span className="text-[15px] font-bold font-display">{project.name}</span>
          <span className="px-2 py-0.5 rounded bg-[var(--s3)] text-[var(--t2)] text-[11px] font-semibold">{project.status}</span>
          {sep}
          <span className="text-xs text-[var(--t3)]">{project.dateRange} · {project.memberIds.length} membros</span>
          <div className="flex-1" />
          <button onClick={() => openThread(null)} className={hBtn}>💬 Discussão</button>
          <button className={hBtn}>🕐 Timeline</button>
          <button className={hBtn}>📁 Arquivos</button>
          <button className={hBtn}>⊞ Revisão</button>
          <button className={`${hBtn} bg-[var(--acc)] text-white`}>+ Tarefa</button>
        </>
      )}

      {mainMode === 'channel' && channel && (
        <>
          <span className="text-[15px] font-bold font-display"># {channel.name}</span>
          {sep}
          <span className="text-xs text-[var(--t3)]">Canal de comunicação da equipe</span>
          <div className="flex-1" />
          <button className={hBtn} aria-label="Buscar">🔍</button>
          <button className={hBtn} aria-label="Fixar">📌</button>
        </>
      )}

      {mainMode === 'dm' && dmUser && (
        <>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: dmUser.color }}>{dmUser.initials}</div>
          <span className="text-[15px] font-bold font-display">{dmUser.name}</span>
          <div className="w-2 h-2 rounded-full" style={{ background: dmUser.status === 'online' ? 'var(--grn)' : 'var(--t3)' }} />
          <span className="text-xs text-[var(--t3)]">{dmUser.status === 'online' ? 'Online' : 'Offline'}</span>
          {sep}
          <span className="text-xs text-[var(--t3)]">{dmUser.role}</span>
          <div className="flex-1" />
          <button className={hBtn}>📹 Chamada</button>
        </>
      )}
    </div>
  )
})

export { ContextHeader }
