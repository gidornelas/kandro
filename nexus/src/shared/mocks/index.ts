/**
 * Mock data for frontend development.
 * Modularized by entity.
 */

import type {
  ActivityItem,
  CardDetail,
  Channel,
  DirectMessage,
  FolderItem,
  KanbanCard,
  KanbanColumn,
  Message,
  PresenceEntry,
  Project,
  Team,
  User,
  VoiceRoom,
} from '../../shared/types/domain'

export const USERS: Record<string, User> = {
  rc: { id: 'rc', name: 'Rafael Costa', initials: 'RC', color: '#2f80ed', role: 'Lead Designer', status: 'online' },
  al: { id: 'al', name: 'Ana Lima', initials: 'AL', color: '#ec5899', role: 'UX Designer', status: 'online' },
  cm: { id: 'cm', name: 'Carlos Matos', initials: 'CM', color: '#f5a623', role: 'Product Manager', status: 'busy' },
  jl: { id: 'jl', name: 'João Lemos', initials: 'JL', color: '#4ea3d8', role: 'Dev Frontend', status: 'online' },
  ms: { id: 'ms', name: 'Marina Silva', initials: 'MS', color: '#35b779', role: 'Brand Designer', status: 'away' },
}

export const PROJECTS: Project[] = [
  { id: 'sprint12', name: 'Sprint 12', channelId: 'sprint12', status: 'Em andamento', dateRange: '14–28 Mai', memberIds: ['rc', 'al', 'cm', 'jl', 'ms'] },
  { id: 'dsv2', name: 'Design System v2', channelId: 'dsv2', status: 'Em andamento', dateRange: '01–31 Mai', memberIds: ['rc', 'al', 'ms'] },
  { id: 'onboarding', name: 'Onboarding Flow', channelId: 'onboarding', status: 'Planejado', dateRange: 'Jun 2025', memberIds: ['cm', 'al'] },
]

export const CHANNELS: Channel[] = [
  { id: 'geral', name: 'geral', icon: '#', type: 'text', badge: 5, desc: 'Canal geral da equipe' },
  { id: 'announcements', name: 'announcements', icon: '#', type: 'text', desc: 'Comunicados da workspace' },
  { id: 'sprint12', name: 'Sprint 12', icon: '◈', type: 'board', desc: 'Board do sprint atual' },
  { id: 'dsv2', name: 'Design System v2', icon: '◈', type: 'board', desc: 'Evolução do design system' },
  { id: 'onboarding', name: 'Onboarding Flow', icon: '◈', type: 'board', desc: 'Fluxo de onboarding' },
  { id: 'standup', name: 'Standup Daily', icon: '🔊', type: 'voice', live: true, participants: ['rc', 'al', 'jl'] },
  { id: 'review-room', name: 'Review Room', icon: '📅', type: 'voice', desc: 'Reunião de revisão 16:00' },
]

export const MESSAGES: Message[] = [
  {
    id: '1',
    channel: 'geral',
    user: 'cm',
    userId: 'cm',
    time: '09:14',
    createdAt: '2025-05-04T09:14:00Z',
    text: 'Bom dia! @Ana Lima pode revisar os wireframes até amanhã?',
    reactions: [{ emoji: '✅', count: 2, me: true }, { emoji: '👍', count: 1, me: false }],
  },
  {
    id: '2',
    channel: 'geral',
    user: 'jl',
    userId: 'jl',
    time: '09:30',
    createdAt: '2025-05-04T09:30:00Z',
    text: 'DataTable finalizado. Arquivo no Figma com anotações de handoff.',
    reactions: [],
    attachment: { name: 'datatable-handoff.fig', size: '8.2 MB', icon: '🎨', encrypted: true },
  },
  {
    id: '3',
    channel: 'geral',
    user: 'rc',
    userId: 'rc',
    time: '10:05',
    createdAt: '2025-05-04T10:05:00Z',
    text: 'Precisamos revisar a hierarquia tipográfica do DS. Card criado:',
    reactions: [],
    taskCard: {
      label: 'Design System v2',
      labelColor: '#2f80ed',
      title: 'Revisar hierarquia tipográfica',
      due: 'Sex 17 Mai',
      priority: 'Alta',
      priorityColor: '#cc4b4b',
    },
  },
]

export const DMS: DirectMessage[] = [
  {
    id: 'dm-al',
    userId: 'al',
    unread: 1,
    messages: [
      { id: '201', channel: 'dm-al', user: 'al', userId: 'al', time: 'Ontem 16:30', createdAt: '2025-05-03T16:30:00Z', text: 'Rafael, vi seu comentário no checkout. Podemos simplificar o step 2.', reactions: [] },
      { id: '202', channel: 'dm-al', user: 'rc', userId: 'rc', time: 'Ontem 16:45', createdAt: '2025-05-03T16:45:00Z', text: 'Concordo! Ajustamos na daily amanhã.', reactions: [{ emoji: '👍', count: 1, me: true }] },
      { id: '203', channel: 'dm-al', user: 'al', userId: 'al', time: 'Hoje 09:05', createdAt: '2025-05-04T09:05:00Z', text: 'Wireframes atualizados! 🎉', reactions: [] },
    ],
  },
  { id: 'dm-jl', userId: 'jl', unread: 0, messages: [] },
  { id: 'dm-cm', userId: 'cm', unread: 0, messages: [] },
  { id: 'dm-ms', userId: 'ms', unread: 0, messages: [] },
]

export const VOICE_ROOM: VoiceRoom = {
  id: 'standup',
  name: 'Standup Daily',
  layout: 'voice',
  active: false,
  participants: [
    { userId: 'rc', muted: false, sharing: false, cameraOn: false },
    { userId: 'al', muted: false, sharing: true, cameraOn: true },
    { userId: 'cm', muted: true, sharing: false, cameraOn: false },
    { userId: 'jl', muted: true, sharing: false, cameraOn: false },
    { userId: 'ms', muted: false, sharing: false, cameraOn: false },
  ],
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', name: 'Backlog', color: '#8e8e93' },
  { id: 'progress', name: 'Em Progresso', color: '#2f80ed' },
  { id: 'review', name: 'Em Revisão', color: '#f5a623' },
  { id: 'done', name: 'Concluído', color: '#35b779' },
]

export const KANBAN_CARDS: KanbanCard[] = [
  { id: 'c1', col: 'backlog', title: 'Definir tokens de cor para dark mode', labels: ['Design'], priority: 'Normal', priorityColor: '#8e8e93', assignees: ['rc', 'al'], due: '10 Mai', dueType: 'normal', comments: 2, attachments: 0, progress: 0, threadCount: 2 },
  { id: 'c2', col: 'backlog', title: 'Auditoria de acessibilidade', labels: ['UX'], priority: 'Alta', priorityColor: '#cc4b4b', assignees: ['al'], due: '08 Mai', dueType: 'overdue', comments: 0, attachments: 0, progress: 0, threadCount: 0 },
  { id: 'c5', col: 'progress', title: 'Redesenhar fluxo de checkout', labels: ['UX', 'Design'], priority: 'Alta', priorityColor: '#cc4b4b', assignees: ['al', 'rc'], due: '06 Mai', dueType: 'warning', comments: 8, attachments: 3, progress: 65, threadCount: 8 },
  { id: 'c6', col: 'progress', title: 'Implementar componente DataTable', labels: ['Dev'], priority: 'Alta', priorityColor: '#cc4b4b', assignees: ['jl'], due: '05 Mai', dueType: 'overdue', comments: 5, attachments: 1, progress: 80, threadCount: 5 },
  { id: 'c8', col: 'review', title: 'Revisar handoff da nova landing page', labels: ['Design', 'Dev'], priority: 'Alta', priorityColor: '#cc4b4b', assignees: ['rc', 'jl'], due: '04 Mai', dueType: 'overdue', comments: 6, attachments: 2, progress: 95, threadCount: 6 },
  { id: 'c10', col: 'done', title: '✓ Arquitetura de informação', labels: ['UX'], priority: 'Alta', priorityColor: '#cc4b4b', assignees: ['al'], due: '01 Mai', dueType: 'normal', comments: 7, attachments: 2, progress: 100, threadCount: 0 },
  { id: 'c11', col: 'done', title: '✓ Logo versão monocromática', labels: ['Design'], priority: 'Baixa', priorityColor: '#8e8e93', assignees: ['ms'], due: '30 Abr', dueType: 'normal', comments: 2, attachments: 3, progress: 100, threadCount: 0 },
]

export const TEAMS: Team[] = [
  { id: 'design', name: 'Design', color: '#2f80ed', memberIds: ['rc', 'al', 'ms'], permissions: [] },
  { id: 'produto', name: 'Produto', color: '#f5a623', memberIds: ['cm', 'jl', 'rc'], permissions: [] },
  { id: 'dev', name: 'Dev', color: '#35b779', memberIds: ['jl'], permissions: [] },
  { id: 'marketing', name: 'Marketing', color: '#ec5899', memberIds: ['ms', 'cm'], permissions: [] },
  { id: 'lideranca', name: 'Liderança', color: '#f5a623', memberIds: ['rc', 'cm'], permissions: [] },
]

export const FILES: FolderItem[] = [
  { id: 'design-assets', name: 'Design Assets', type: 'folder', icon: '📁', itemCount: 24, teamIds: ['design', 'lideranca'], restricted: false, encrypted: false, uploadedAt: 'Modificado há 2h' },
  { id: 'brand-guide', name: 'Brand Guidelines', type: 'folder', icon: '📁', itemCount: 8, teamIds: ['design', 'marketing'], restricted: false, encrypted: false, uploadedAt: 'Modificado ontem' },
  { id: 'research', name: 'Research', type: 'folder', icon: '📁', itemCount: 15, teamIds: ['produto', 'lideranca'], restricted: false, encrypted: false, uploadedAt: 'Modificado há 3 dias' },
  { id: 'specs-tecnicas', name: 'Specs Técnicas', type: 'folder', icon: '📁', itemCount: 6, teamIds: ['dev', 'lideranca'], restricted: true, encrypted: true, uploadedAt: 'Modificado há 5 dias' },
  { id: 'f1', name: 'landing-v3.fig', type: 'file', icon: '🎨', size: '12.4 MB', teamIds: ['design'], uploadedBy: 'jl', uploadedAt: 'Hoje às 09:30', restricted: false, encrypted: true },
  { id: 'f2', name: 'checkout-audit.pdf', type: 'file', icon: '📄', size: '2.3 MB', teamIds: ['design', 'produto'], uploadedBy: 'al', uploadedAt: 'Ontem às 14:15', restricted: false, encrypted: true },
]

export const ACTIVITIES: ActivityItem[] = [
  { user: 'rc', action: 'comentou em', target: 'Redesenhar checkout', targetColor: '#2f80ed', time: 'há 12 min' },
  { user: 'al', action: 'subiu', target: 'wireframes-v2.fig', targetColor: '#35b779', time: 'há 34 min' },
]

export const PRESENCE: PresenceEntry[] = [
  { userId: 'al', action: 'editando', context: 'Redesenhar checkout' },
  { userId: 'rc', action: 'revisando', context: 'Handoff landing' },
  { userId: 'jl', action: 'em voz', context: '' },
  { userId: 'cm', action: 'na thread', context: 'DataTable' },
]

export const CARD_DETAILS: Record<string, CardDetail> = {
  c5: {
    title: 'Redesenhar fluxo de checkout',
    labels: [
      { id: 'l1', name: 'UX', color: '#ec5899' },
      { id: 'l2', name: 'Design', color: '#2f80ed' },
    ],
    priority: 'Alta',
    priorityColor: '#cc4b4b',
    assignees: [{ userId: 'al', user: USERS.al }, { userId: 'rc', user: USERS.rc }],
    due: '2025-05-06T12:00:00Z',
    dueType: 'warning',
    description: 'Simplificar o checkout para reduzir fricção e aumentar conversão.',
    subtasks: [
      { id: 'st1', text: 'Revisar referências', done: true },
      { id: 'st2', text: 'Criar wireframes', done: true },
      { id: 'st3', text: 'Validar com produto', done: false },
    ],
    comments: [
      { id: 'co1', userId: 'cm', user: USERS.cm, text: 'Prioridade máxima para esta semana.' },
      { id: 'co2', userId: 'al', user: USERS.al, text: 'Fluxo já reduzido para 3 passos.' },
    ],
    files: [{ name: 'wireframes-v2.fig', size: '6.4 MB', icon: '🎨' }],
  },
}
