import type { Server as SocketServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { DmsService } from "./dms.service.js";

export function registerDmSocketHandlers(
  io: SocketServer,
  socket: Socket,
  prisma: PrismaClient,
  userId: string
) {
  const dmService = new DmsService(prisma);

  // dm:send — create DM message and broadcast to DM room
  socket.on(
    "dm:send",
    async (data: { roomId: string; text: string }, callback) => {
      try {
        const message = await dmService.sendMessage(data.roomId, userId, {
          text: data.text,
        });

        // Broadcast to DM room
        io.to(`room:dm:${data.roomId}`).emit("dm:message", message);

        if (callback) callback({ ok: true, message });
      } catch (error: unknown) {
        if (callback)
          callback({
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Erro ao enviar mensagem DM",
          });
      }
    }
  );

  // dm:typing — broadcast typing indicator to DM room
  socket.on("dm:typing", (data: { roomId: string }) => {
    socket.to(`room:dm:${data.roomId}`).emit("dm:typing", {
      userId,
      roomId: data.roomId,
    });
  });
}
