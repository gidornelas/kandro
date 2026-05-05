import type { Server as SocketServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { createMessageService } from "./messages.service.js";
import type { CreateMessageInput } from "./messages.schema.js";

export function registerMessageSocketHandlers(
  io: SocketServer,
  socket: Socket,
  prisma: PrismaClient,
  userId: string
) {
  const msgService = createMessageService(prisma);

  // chat:send — create message and broadcast to channel room
  socket.on(
    "chat:send",
    async (data: { channelId: string } & CreateMessageInput, callback) => {
      try {
        const message = await msgService.create(
          data.channelId,
          { text: data.text, attachment: data.attachment, taskCard: data.taskCard },
          userId
        );

        // Broadcast to channel room
        io.to(`channel:${data.channelId}`).emit("chat:message", message);

        if (callback) callback({ ok: true, message });
      } catch (error: unknown) {
        if (callback)
          callback({
            ok: false,
            error: error instanceof Error ? error.message : "Erro ao enviar mensagem",
          });
      }
    }
  );

  // chat:update
  socket.on(
    "chat:update",
    async (data: { messageId: string; text: string }, callback) => {
      try {
        const message = await msgService.update(
          data.messageId,
          { text: data.text },
          userId
        );
        io.to(`channel:${message.channelId}`).emit("chat:updated", message);
        if (callback) callback({ ok: true, message });
      } catch (error: unknown) {
        if (callback)
          callback({
            ok: false,
            error: error instanceof Error ? error.message : "Erro ao editar mensagem",
          });
      }
    }
  );

  // chat:delete
  socket.on(
    "chat:delete",
    async (data: { messageId: string; channelId: string }, callback) => {
      try {
        await msgService.remove(data.messageId, userId);
        io.to(`channel:${data.channelId}`).emit("chat:deleted", {
          messageId: data.messageId,
        });
        if (callback) callback({ ok: true });
      } catch (error: unknown) {
        if (callback)
          callback({
            ok: false,
            error: error instanceof Error ? error.message : "Erro ao deletar mensagem",
          });
      }
    }
  );

  // chat:reaction:toggle
  socket.on(
    "chat:reaction:toggle",
    async (data: { messageId: string; emoji: string; channelId: string }, callback) => {
      try {
        const reactions = await msgService.toggleReaction(
          data.messageId,
          data.emoji,
          userId
        );
        io.to(`channel:${data.channelId}`).emit("chat:reactions", {
          messageId: data.messageId,
          reactions,
        });
        if (callback) callback({ ok: true, reactions });
      } catch (error: unknown) {
        if (callback)
          callback({
            ok: false,
            error: error instanceof Error ? error.message : "Erro ao reagir",
          });
      }
    }
  );
}
