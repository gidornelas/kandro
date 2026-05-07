import type { FastifyRequest } from "fastify";

// ─── Auth ─────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  name: string;
  jti?: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

// ─── Socket Auth ──────────────────────────────────────────

export interface SocketAuthPayload {
  userId: string;
  email: string;
  name: string;
}

// ─── Shared DTOs ──────────────────────────────────────────

export interface CreateMessageDto {
  text: string;
  attachment?: {
    name: string;
    size: number;
    icon: string;
    encrypted: boolean;
  };
  taskCard?: {
    label: string;
    labelColor: string;
    title: string;
    due?: string;
    priority: string;
    priorityColor: string;
  };
}

export interface MoveCardDto {
  toColumnId: string;
  position?: number;
}

export type PermissionAction = "view" | "post" | "comment" | "edit" | "manage" | "admin";
export type ResourceType = "channel" | "board" | "folder" | "doc" | "voice_room" | "settings" | "member_list" | "integration" | "announcement";

// ─── Voice ────────────────────────────────────────────────

export interface VoiceParticipantDto {
  userId: string;
  muted: boolean;
  cameraOn: boolean;
  sharing: boolean;
}

// ─── Presence ─────────────────────────────────────────────

export interface PresenceUpdate {
  userId: string;
  status: "online" | "busy" | "away" | "dnd" | "offline";
}

// ─── Pagination ───────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
