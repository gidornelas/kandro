export interface AuthUser {
  id: string
  email: string
  name: string
  image: string | null
  initials: string
  color: string
  status: StatusType
  role: string
}

export type StatusType = 'online' | 'busy' | 'away' | 'dnd' | 'offline'
export type PermissionLevel = 'none' | 'view' | 'edit'
export type ResourceType = 'channel' | 'board' | 'folder' | 'doc'
export type MainMode = 'project' | 'channel' | 'dm' | 'voice'
export type VoiceLayout = 'voice' | 'grid' | 'spotlight' | 'screen'
export type DueType = 'normal' | 'warning' | 'overdue'
export type View = 'chat' | 'board' | 'files' | 'docs'
export type ModalType = 'taskDetail' | 'createTask' | 'addColumn' | null
export type ContextMode = MainMode

export interface User {
  id: string
  name: string
  initials: string
  color: string
  role: string
  status: StatusType
}

export interface Project {
  id: string
  name: string
  channelId: string
  status: string
  dateRange: string
  memberIds: string[]
}

export interface FreeChannel {
  id: string
  name: string
  unread: number
}

export interface DirectMessage {
  id: string
  userId: string
  messages: Message[]
  unread: number
}

export interface VoiceRoom {
  id: string
  name: string
  participants: VoiceParticipant[]
  layout: VoiceLayout
  active: boolean
}

export interface VoiceParticipant {
  userId: string
  muted: boolean
  sharing: boolean
  cameraOn: boolean
}

export interface Reaction {
  emoji: string
  count: number
  me: boolean
}

export interface Attachment {
  name: string
  size: string
  icon: string
  encrypted: boolean
}

export interface TaskRef {
  label: string
  labelColor: string
  title: string
  due: string
  priority: string
  priorityColor: string
}

export interface Message {
  id: string
  channel: string
  user: string
  userId: string
  time: string
  createdAt: string
  text: string
  reactions: Reaction[]
  attachment?: Attachment
  taskRef?: TaskRef
  taskCard?: TaskRef
}

export interface Workspace {
  id: string
  name: string
  initials: string
  color: string
  badge?: number
}

export interface Channel {
  id: string
  name: string
  icon: string
  type: 'text' | 'board' | 'voice'
  badge?: number
  private?: boolean
  desc?: string
  live?: boolean
  participants?: string[]
}

export interface Subtask {
  id?: string
  text: string
  done: boolean
}

export interface Comment {
  id?: string
  user?: string
  userId?: string
  text: string
  userMeta?: User
}

export interface FileItem {
  name: string
  size: string
  icon: string
}

export interface CardDetail {
  title: string
  labels: { id?: string; name: string; color: string }[]
  priority: string
  priorityColor: string
  assignees: { user?: User; userId: string }[]
  due: string
  dueType: DueType
  description?: string
  desc?: string
  subtasks: Subtask[]
  comments: { id: string; user?: User; userId: string; text: string }[]
  files: FileItem[]
}

export interface ActivityItem {
  user: string
  action: string
  target: string
  targetColor: string
  time: string
}

export interface KanbanColumn {
  id: string
  name: string
  color: string
  isTerminal?: boolean
}

export interface KanbanCard {
  id: string
  col: string
  title: string
  labels: string[]
  priority: string
  priorityColor: string
  assignees: string[]
  due: string
  dueType: DueType
  comments: number
  attachments: number
  progress: number
  threadCount: number
}

export interface TimelineEvent {
  id: string
  type: 'created' | 'moved' | 'assigned' | 'file' | 'commented'
  userId: string
  text: string
  timestamp: string
}

export interface CardThread {
  cardId: string
  events: TimelineEvent[]
  messages: Message[]
}

export interface PresenceEntry {
  userId: string
  action: string
  context: string
}

export interface TeamPermission {
  resourceId: string
  resourceType: ResourceType
  level: PermissionLevel
}

export interface Team {
  id: string
  name: string
  color: string
  memberIds: string[]
  permissions: TeamPermission[]
}

export interface FolderItem {
  id: string
  name: string
  type: 'folder' | 'file'
  icon: string
  size?: string
  itemCount?: number
  teamIds: string[]
  uploadedBy?: string
  uploadedAt?: string
  restricted: boolean
  encrypted: boolean
}
