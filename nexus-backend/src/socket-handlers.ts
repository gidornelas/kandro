import type { Server as SocketServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";
import { registerMessageSocketHandlers } from "./modules/messages/messages.socket.js";
import { registerDmSocketHandlers } from "./modules/dms/dms.socket.js";
import { registerBoardSocketHandlers } from "./modules/boards/boards.socket.js";
import { registerVoiceSocketHandlers } from "./modules/voice/voice.socket.js";
import { registerPresenceHandlers } from "./modules/presence/presence.socket.js";
import { registerTeamSocketHandlers } from "./modules/teams/teams.socket.js";
import type { SocketAuthPayload, JwtPayload } from "./types/index.js";

// Extend Socket with typed auth data
interface AuthenticatedSocket extends Socket {
  data: SocketAuthPayload;
}

export function registerSocketHandlers(io: SocketServer, prisma: PrismaClient) {
  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Token não fornecido"));
    }

    try {
      const jwt = await import("jsonwebtoken");
      const payload = jwt.default.verify(token, env.JWT_SECRET) as {
        sub: string;
        email: string;
        name: string;
      };
      (socket as AuthenticatedSocket).data = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      next();
    } catch {
      next(new Error("Token inválido ou expirado"));
    }
  });

  io.on("connection", (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.data.userId;
    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Subscribe to workspace — verify membership
    socket.on("subscribe:workspace", async (workspaceId: string, callback) => {
      // Check membership via Prisma
      try {
        const member = await prisma.workspaceMember.findUnique({
          where: { workspaceId_userId: { workspaceId, userId } },
        });
        if (member) {
          socket.join(`workspace:${workspaceId}`);
        }
        if (callback) callback({ ok: !!member });
      } catch {
        if (callback) callback({ ok: false });
      }
    });

    // Unsubscribe from workspace
    socket.on("unsubscribe:workspace", (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    // Subscribe to channel — verify workspace membership
    socket.on("subscribe:channel", async (channelId: string, callback) => {
      try {
        const channel = await prisma.channel.findUnique({
          where: { id: channelId },
          include: { workspace: true },
        });
        if (!channel) {
          if (callback) callback({ ok: false });
          return;
        }
        const member = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: channel.workspaceId,
              userId,
            },
          },
        });
        if (member) {
          socket.join(`channel:${channelId}`);
        }
        if (callback) callback({ ok: !!member });
      } catch {
        if (callback) callback({ ok: false });
      }
    });

    // Unsubscribe from channel
    socket.on("unsubscribe:channel", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    // Subscribe to DM room — verify user is participant
    socket.on("subscribe:dm", async (roomId: string, callback) => {
      try {
        const room = await prisma.directMessageRoom.findUnique({
          where: { id: roomId },
        });
        const isParticipant =
          room && (room.userAId === userId || room.userBId === userId);
        if (isParticipant) {
          socket.join(`room:dm:${roomId}`);
        }
        if (callback) callback({ ok: !!isParticipant });
      } catch {
        if (callback) callback({ ok: false });
      }
    });

    // Unsubscribe from DM room
    socket.on("unsubscribe:dm", (roomId: string) => {
      socket.leave(`room:dm:${roomId}`);
    });

    // Auth: refresh token handler
    socket.on("auth:refresh", async ({ refreshToken }: { refreshToken: string }, callback) => {
      try {
        if (!refreshToken) {
          if (callback) callback({ ok: false, error: "refreshToken é obrigatório" });
          return;
        }

        // Rotate refresh token (delete old, verify it exists)
        const stored = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
          include: { user: true },
        });

        if (!stored || stored.expiresAt < new Date()) {
          if (callback) callback({ ok: false, error: "Refresh token inválido ou expirado" });
          return;
        }

        // Delete old token
        await prisma.refreshToken.delete({ where: { id: stored.id } });

        // Issue new tokens
        const payload: JwtPayload = {
          sub: stored.user.id,
          userId: stored.user.id,
          email: stored.user.email,
          name: stored.user.name,
        };

        const accessToken = jwt.sign(payload as object, env.JWT_SECRET, { expiresIn: "15m" });
        const newRefreshToken = jwt.sign(payload as object, env.JWT_SECRET, { expiresIn: "7d" });

        // Store new refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.refreshToken.create({
          data: { token: newRefreshToken, userId: stored.user.id, expiresAt },
        });

        if (callback) callback({ ok: true, accessToken, refreshToken: newRefreshToken });
      } catch {
        if (callback) callback({ ok: false, error: "Erro ao renovar token" });
      }
    });

    // Register module handlers
    registerMessageSocketHandlers(io, socket, prisma, userId);
    registerDmSocketHandlers(io, socket, prisma, userId);
    registerBoardSocketHandlers(io, socket, prisma, userId);
    registerVoiceSocketHandlers(io, socket, prisma, userId);
    registerPresenceHandlers(io, socket, userId);
    registerTeamSocketHandlers(io, socket, prisma, userId);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] User ${userId} disconnected (${socket.id})`);
    });
  });
}
