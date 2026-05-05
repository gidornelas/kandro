import { useState, memo } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useVoiceStore } from '../../stores/voiceStore'
import { usePresenceStore } from '../../stores/presenceStore'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaces } from '../../hooks/queries/useWorkspaces'
import { PROJECTS, FREE_CHANNELS, DMS, USERS } from '../../data/mock'
import type { Project, FreeChannel, DirectMessage } from '../../types'
import { Tooltip } from '../ui/tooltip'
import { ProfileModal } from '../auth/ProfileModal'

const Section = memo(function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const { collapsedSections, toggleSection } = useUIStore()
  const collapsed = collapsedSections.has(id)
  return (
    <div className="mb-0.5">
      <button
        onClick={() => toggleSection(id)}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between px-4 py-1.5 bg-transparent border-none cursor-pointer text-[11px] font-bold uppercase tracking-wide text-[var(--t3)] font-body"
      >
        <span>{label}</span>
        <span className={`inline-block text-[10px] transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}>⌄</span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-250" style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
})

function SidebarItem({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-0 mx-2 mb-px rounded-[var(--r-sm)] cursor-pointer text-sm text-[var(--t1)] relative min-h-[44px] ${active ? 'bg-[var(--acc-s)]' : 'hover:bg-[var(--b1)]'}`}
    >
      {active && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[var(--acc)] rounded-r-sm" />
      )}
      {children}
    </div>
  )
}

const ProjectItem = memo(function ProjectItem({ project }: { project: Project }) {
  const { activeProjectId, openProject } = useUIStore()
  const active = activeProjectId === project.id
  return (
    <SidebarItem active={active} onClick={() => openProject(project.id)}>
      <span className={`text-[11px] ${active ? 'text-[var(--acc)]' : 'text-[var(--t3)]'}`}>◈</span>
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{project.name}</span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.status === 'Em andamento' ? 'var(--acc)' : 'var(--t3)' }} />
    </SidebarItem>
  )
})

const ChannelItem = memo(function ChannelItem({ channel }: { channel: FreeChannel }) {
  const { activeChannelId, openChannel } = useUIStore()
  const active = activeChannelId === channel.id
  return (
    <SidebarItem active={active} onClick={() => openChannel(channel.id)}>
      <span className="text-[11px] text-[var(--t3)] w-3.5">#</span>
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{channel.name}</span>
      {channel.unread > 0 && (
        <span className="px-1.5 py-px rounded-full bg-[var(--acc)] text-[10px] font-bold text-white flex-shrink-0">{channel.unread}</span>
      )}
    </SidebarItem>
  )
})

const VoiceRoomItem = memo(function VoiceRoomItem() {
  const { active, participants, activeSpeakerId } = useVoiceStore()
  const { connect } = useVoiceStore()

  return (
    <div className="mx-2">
      <SidebarItem active={active} onClick={() => {
        connect('standup')
        useUIStore.getState().openVoice()
      }}>
        <span className="text-[11px]">🔊</span>
        <span className="flex-1">Standup Daily</span>
        <div className="flex ml-1">
          {participants.slice(0, 3).map(p => {
            const u = USERS[p.userId]
            return (
              <div key={p.userId} className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white border-2 border-[var(--s1)] -ml-1 first:ml-0" style={{
                background: u?.color || 'var(--acc)',
                boxShadow: activeSpeakerId === p.userId ? '0 0 0 1px var(--grn)' : 'none',
              }}>{u?.initials || '?'}</div>
            )
          })}
        </div>
      </SidebarItem>
      {active && (
        <div className="pl-8 pt-0.5">
          {participants.map((p) => {
            const u = USERS[p.userId]
            if (!u) return null
            return (
              <div key={p.userId} className="flex items-center gap-1.5 h-[22px]">
                <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{
                  background: u.color,
                  boxShadow: activeSpeakerId === p.userId ? '0 0 0 2px var(--grn)' : 'none',
                }}>{u.initials}</div>
                <span className="text-[11px] text-[var(--t2)] flex-1">{u.name}</span>
                {p.sharing && <span className="text-[10px] text-[var(--acc)]">🖥</span>}
                {p.muted ? <span className="text-[10px] text-[var(--red)]">🔇</span> : <span className="text-[10px] text-[var(--t3)]">🎤</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

function MeetingItem() {
  return (
    <SidebarItem>
      <span className="text-[11px]">📅</span>
      <span className="flex-1">Review semanal</span>
      <span className="text-[10px] text-[var(--t3)]">14:00</span>
    </SidebarItem>
  )
}

const DmItem = memo(function DmItem({ dm }: { dm: DirectMessage }) {
  const { activeDmId, openDm } = useUIStore()
  const active = activeDmId === dm.id
  const u = USERS[dm.userId]
  const presenceStatus = usePresenceStore(s => s.onlineUsers.get(dm.userId)?.status)
  const status = presenceStatus || u?.status || 'offline'
  const STATUS_DOT: Record<string, string> = { online: 'var(--grn)', busy: 'var(--red)', away: 'var(--yel)', dnd: 'var(--red)', offline: 'var(--t3)' }
  if (!u) return null
  return (
    <SidebarItem active={active} onClick={() => openDm(dm.id)}>
      <div className="relative">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: u.color }}>{u.initials}</div>
        <div className="absolute -bottom-px -right-px w-[7px] h-[7px] rounded-full border-2 border-[var(--s1)]" style={{ background: STATUS_DOT[status] || 'var(--t3)' }} />
      </div>
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{u.name}</span>
      {dm.unread > 0 && (
        <span className="px-1.5 py-px rounded-full bg-[var(--acc)] text-[10px] font-bold text-white flex-shrink-0">{dm.unread}</span>
      )}
    </SidebarItem>
  )
})

function AddAction({ label }: { label: string }) {
  return (
    <div className="h-[26px] flex items-center gap-1.5 px-2 mx-2 mt-0.5 rounded-[var(--r-sm)] cursor-pointer text-xs text-[var(--t3)] hover:bg-[var(--b1)]">
      <span className="text-sm">+</span>
      <span>{label}</span>
    </div>
  )
}

function WorkspaceHeader() {
  const { data: workspaces } = useWorkspaces()
  const ws = workspaces?.[0] ?? null

  return (
    <div className="h-12 border-b border-[var(--b1)] flex items-center gap-2.5 px-4 flex-shrink-0">
      <div className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[11px] font-bold text-white" style={{ background: ws?.color || 'var(--acc)' }}>
        {ws?.initials || 'NX'}
      </div>
      <span className="text-sm font-semibold flex-1">{ws?.name || 'NEXUS'}</span>
      {(workspaces?.length ?? 0) > 0 && <span className="text-[10px] text-[var(--t3)]">⌄</span>}
    </div>
  )
}

function UserBar() {
  const { user, logout } = useAuthStore()
  const presenceStatus = usePresenceStore(s => user ? s.onlineUsers.get(user.id)?.status : undefined)
  const status = presenceStatus || user?.status || 'online'
  const STATUS_DOT: Record<string, string> = { online: 'var(--grn)', busy: 'var(--red)', away: 'var(--yel)', dnd: 'var(--red)', offline: 'var(--t3)' }
  const [profileOpen, setProfileOpen] = useState(false)

  if (!user) return null

  return (
    <>
      <div className="absolute bottom-0 left-0 w-[232px] h-11 bg-[var(--s1)] border-t border-[var(--b1)] flex items-center gap-2 px-3">
        <div className="relative cursor-pointer" onClick={() => setProfileOpen(true)}>
          <div className="w-[26px] h-[26px] rounded-full bg-[var(--acc)] flex items-center justify-center text-[10px] font-bold text-white">
            {user.name[0]}
          </div>
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[var(--s1)]" style={{ background: STATUS_DOT[status] || 'var(--grn)' }} />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setProfileOpen(true)}>
          <div className="text-xs font-semibold text-[var(--t1)]">{user.name}</div>
          <div className="text-[10px] text-[var(--t3)]">{user.role || 'Membro'}</div>
        </div>
        <Tooltip content="Sair">
          <button onClick={logout} className="bg-transparent border-none text-[var(--t3)] cursor-pointer text-xs" aria-label="Sair">
            ⚙️
          </button>
        </Tooltip>
      </div>
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}

export function Sidebar() {
  return (
    <nav className="w-[232px] bg-[var(--s1)] border-r border-[var(--b1)] flex flex-col overflow-hidden flex-shrink-0 relative">
      <WorkspaceHeader />
      <div className="flex-1 overflow-y-auto py-2 pb-11">
        <Section id="proj" label="Projetos">
          {PROJECTS.map(p => <ProjectItem key={p.id} project={p} />)}
          <AddAction label="Novo projeto" />
        </Section>
        <Section id="com" label="Comunicação">
          {FREE_CHANNELS.map(c => <ChannelItem key={c.id} channel={c} />)}
        </Section>
        <Section id="voz" label="Voz & Reuniões">
          <VoiceRoomItem />
          <MeetingItem />
        </Section>
        <Section id="dm" label="Diretos">
          {DMS.map(dm => <DmItem key={dm.id} dm={dm} />)}
          <AddAction label="Nova mensagem" />
        </Section>
      </div>
      <UserBar />
    </nav>
  )
}
