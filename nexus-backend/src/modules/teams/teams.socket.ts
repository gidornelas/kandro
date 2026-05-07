import type { Server as SocketServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { createTeamService } from "./teams.service.js";

export function registerTeamSocketHandlers(
  io: SocketServer,
  socket: Socket,
  prisma: PrismaClient,
  userId: string
) {
  const teamService = createTeamService(prisma);

  // team:create
  socket.on(
    "team:create",
    async (data: { workspaceId: string; name: string; color?: string }, callback) => {
      try {
        const team = await teamService.create(data.workspaceId, {
          name: data.name,
          color: data.color,
        });

        io.to(`workspace:${data.workspaceId}`).emit("team:created", team);
        if (callback) callback({ ok: true, team });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // team:update
  socket.on(
    "team:update",
    async (data: { teamId: string; name?: string; color?: string; workspaceId: string }, callback) => {
      try {
        const team = await teamService.update(data.teamId, {
          name: data.name,
          color: data.color,
        });

        io.to(`workspace:${data.workspaceId}`).emit("team:updated", team);
        if (callback) callback({ ok: true, team });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // team:delete
  socket.on(
    "team:delete",
    async (data: { teamId: string; workspaceId: string }, callback) => {
      try {
        await teamService.remove(data.teamId);

        io.to(`workspace:${data.workspaceId}`).emit("team:deleted", {
          teamId: data.teamId,
        });
        if (callback) callback({ ok: true });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // team:member:add
  socket.on(
    "team:member:add",
    async (data: { teamId: string; memberId: string; workspaceId: string }, callback) => {
      try {
        const member = await teamService.addMember(data.teamId, data.memberId);

        io.to(`workspace:${data.workspaceId}`).emit("team:member:added", {
          teamId: data.teamId,
          member,
        });
        if (callback) callback({ ok: true, member });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // team:member:remove
  socket.on(
    "team:member:remove",
    async (data: { teamId: string; memberId: string; workspaceId: string }, callback) => {
      try {
        await teamService.removeMember(data.teamId, data.memberId);

        io.to(`workspace:${data.workspaceId}`).emit("team:member:removed", {
          teamId: data.teamId,
          userId: data.memberId,
        });
        if (callback) callback({ ok: true });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // team:permission:set
  socket.on(
    "team:permission:set",
    async (data: { teamId: string; workspaceId: string; resourceId: string; resourceType: string; actions: string[] }, callback) => {
      try {
        const permission = await teamService.setPermission(data.teamId, {
          resourceId: data.resourceId,
          resourceType: data.resourceType as "channel" | "board" | "folder" | "doc" | "voice_room" | "settings" | "member_list" | "integration" | "announcement",
          actions: data.actions as Array<"view" | "post" | "comment" | "edit" | "manage" | "admin">,
        });

        io.to(`workspace:${data.workspaceId}`).emit("team:permission:set", {
          teamId: data.teamId,
          resourceId: data.resourceId,
          resourceType: data.resourceType,
          actions: data.actions,
          permission,
        });
        if (callback) callback({ ok: true, permission });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );
}
