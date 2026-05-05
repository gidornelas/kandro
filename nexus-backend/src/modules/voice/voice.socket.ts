import type { Server as SocketServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { createVoiceService } from "./voice.service.js";

export function registerVoiceSocketHandlers(
  io: SocketServer,
  socket: Socket,
  prisma: PrismaClient,
  userId: string
) {
  const voiceService = createVoiceService(prisma);

  // voice:join
  socket.on(
    "voice:join",
    async (data: { channelId: string }, callback) => {
      try {
        const result = await voiceService.joinChannel(data.channelId, userId);
        socket.join(`voice:${data.channelId}`);
        io.to(`channel:${data.channelId}`).emit("voice:participant:joined", {
          userId,
          timestamp: new Date().toISOString(),
        });
        if (callback) callback({ ok: true, ...result });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // voice:leave
  socket.on(
    "voice:leave",
    async (data: { channelId: string }, callback) => {
      try {
        await voiceService.leaveChannel(data.channelId, userId);
        socket.leave(`voice:${data.channelId}`);
        io.to(`channel:${data.channelId}`).emit("voice:participant:left", {
          userId,
          timestamp: new Date().toISOString(),
        });
        if (callback) callback({ ok: true });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // voice:update — mute, camera, screen share
  socket.on(
    "voice:update",
    async (data: { channelId: string; muted?: boolean; cameraOn?: boolean; sharing?: boolean }) => {
      try {
        const result = await voiceService.updateParticipant(data.channelId, userId, {
          muted: data.muted,
          cameraOn: data.cameraOn,
          sharing: data.sharing,
        });
        io.to(`channel:${data.channelId}`).emit("voice:participant:changed", result);
      } catch {
        // silently fail for socket relay
      }
    }
  );
}
