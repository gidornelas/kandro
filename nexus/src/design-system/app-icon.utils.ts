import {
  HiMiniArrowLeftOnRectangle,
  HiMiniArrowUpTray,
  HiMiniBars3,
  HiMiniBars3BottomLeft,
  HiMiniBars3BottomRight,
  HiMiniBold,
  HiMiniCalendarDays,
  HiMiniChatBubbleLeftEllipsis,
  HiMiniChatBubbleLeftRight,
  HiMiniChevronDown,
  HiMiniCheckCircle,
  HiMiniClipboardDocumentList,
  HiMiniCog6Tooth,
  HiMiniComputerDesktop,
  HiMiniDocument,
  HiMiniDocumentText,
  HiMiniExclamationTriangle,
  HiMiniFolder,
  HiMiniLockClosed,
  HiMiniMicrophone,
  HiMiniNumberedList,
  HiMiniPaintBrush,
  HiMiniPaperAirplane,
  HiMiniPaperClip,
  HiMiniPlus,
  HiMiniStrikethrough,
  HiMiniSpeakerWave,
  HiMiniSpeakerXMark,
  HiMiniSquares2X2,
  HiMiniTrash,
  HiMiniUnderline,
  HiMiniUserCircle,
  HiMiniVideoCamera,
  HiMiniVideoCameraSlash,
  HiMiniViewColumns,
  HiMiniViewfinderCircle,
  HiMiniXMark,
  HiMiniItalic,
  HiMiniListBullet,
} from 'react-icons/hi2'

export const appIcons = {
  activity: HiMiniChatBubbleLeftEllipsis,
  alignCenter: HiMiniBars3,
  alignLeft: HiMiniBars3BottomLeft,
  alignRight: HiMiniBars3BottomRight,
  attachment: HiMiniPaperClip,
  board: HiMiniSquares2X2,
  bold: HiMiniBold,
  calendar: HiMiniCalendarDays,
  camera: HiMiniVideoCamera,
  cameraOff: HiMiniVideoCameraSlash,
  channel: HiMiniChatBubbleLeftRight,
  chat: HiMiniChatBubbleLeftEllipsis,
  chevronDown: HiMiniChevronDown,
  checklist: HiMiniCheckCircle,
  description: HiMiniDocumentText,
  dm: HiMiniUserCircle,
  file: HiMiniDocument,
  folder: HiMiniFolder,
  grid: HiMiniSquares2X2,
  italic: HiMiniItalic,
  lock: HiMiniLockClosed,
  list: HiMiniListBullet,
  logout: HiMiniArrowLeftOnRectangle,
  mic: HiMiniMicrophone,
  micOff: HiMiniSpeakerXMark,
  numberedList: HiMiniNumberedList,
  paint: HiMiniPaintBrush,
  project: HiMiniViewColumns,
  plus: HiMiniPlus,
  save: HiMiniClipboardDocumentList,
  screen: HiMiniComputerDesktop,
  send: HiMiniPaperAirplane,
  settings: HiMiniCog6Tooth,
  spotlight: HiMiniViewfinderCircle,
  strike: HiMiniStrikethrough,
  trash: HiMiniTrash,
  underline: HiMiniUnderline,
  upload: HiMiniArrowUpTray,
  voice: HiMiniSpeakerWave,
  warning: HiMiniExclamationTriangle,
  xmark: HiMiniXMark,
} as const

export type AppIconName = keyof typeof appIcons

export function getChannelIconName(type?: 'text' | 'board' | 'voice'): AppIconName {
  if (type === 'board') return 'project'
  if (type === 'voice') return 'voice'
  return 'channel'
}

export function getFileIconName(icon?: string, type?: string): AppIconName {
  if (type === 'folder') return 'folder'
  if (icon === '🎨') return 'paint'
  if (icon === '📎') return 'attachment'
  if (icon === '📄') return 'file'
  if (icon === '📁') return 'folder'
  return 'file'
}
