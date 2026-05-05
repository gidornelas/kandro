import type { Server as SocketServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import { createBoardService } from "./boards.service.js";

export function registerBoardSocketHandlers(
  io: SocketServer,
  socket: Socket,
  prisma: PrismaClient,
  userId: string
) {
  const boardService = createBoardService(prisma);

  // board:card:create
  socket.on(
    "board:card:create",
    async (data: { columnId: string; channelId: string; title: string; labels?: { name: string; color: string }[]; assignees?: string[]; priority?: string; due?: string; description?: string }, callback) => {
      try {
        const column = await prisma.kanbanColumn.findUnique({
          where: { id: data.columnId },
          include: { channel: true },
        });
        if (!column) throw new Error("Column not found");

        const card = await boardService.createCard(
          data.columnId,
          {
            title: data.title,
            labels: data.labels,
            assignees: data.assignees,
            priority: data.priority,
            due: data.due,
            description: data.description,
          },
          column.channel.workspaceId,
          userId
        );

        io.to(`channel:${data.channelId}`).emit("board:card:created", card);
        if (callback) callback({ ok: true, card });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // board:card:update
  socket.on(
    "board:card:update",
    async (data: { cardId: string; channelId: string; title?: string; priority?: string; due?: string; description?: string }, callback) => {
      try {
        const card = await prisma.kanbanCard.findUnique({
          where: { id: data.cardId },
          include: { column: { include: { channel: true } } },
        });
        if (!card) throw new Error("Card not found");

        const updated = await boardService.updateCard(
          data.cardId,
          {
            title: data.title,
            priority: data.priority,
            due: data.due,
            description: data.description,
          },
          card.column.channel.workspaceId,
          userId
        );

        io.to(`channel:${data.channelId}`).emit("board:card:updated", updated);
        if (callback) callback({ ok: true, card: updated });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // board:card:move
  socket.on(
    "board:card:move",
    async (data: { cardId: string; toColumnId: string; channelId: string; position?: number }, callback) => {
      try {
        const card = await prisma.kanbanCard.findUnique({
          where: { id: data.cardId },
          include: { column: { include: { channel: true } } },
        });
        if (!card) throw new Error("Card not found");

        const moved = await boardService.moveCard(
          data.cardId,
          { toColumnId: data.toColumnId, position: data.position },
          card.column.channel.workspaceId,
          userId
        );

        io.to(`channel:${data.channelId}`).emit("board:card:moved", moved);
        if (callback) callback({ ok: true, card: moved });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // board:card:delete
  socket.on(
    "board:card:delete",
    async (data: { cardId: string; channelId: string }, callback) => {
      try {
        await boardService.deleteCard(data.cardId);
        io.to(`channel:${data.channelId}`).emit("board:card:deleted", {
          cardId: data.cardId,
        });
        if (callback) callback({ ok: true });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // board:column:create
  socket.on(
    "board:column:create",
    async (data: { channelId: string; name: string; color?: string }, callback) => {
      try {
        const channel = await prisma.channel.findUnique({ where: { id: data.channelId } });
        if (!channel) throw new Error("Channel not found");

        const column = await boardService.createColumn(
          data.channelId,
          { name: data.name, color: data.color },
          channel.workspaceId,
          userId
        );

        io.to(`channel:${data.channelId}`).emit("board:column:created", column);
        if (callback) callback({ ok: true, column });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // board:column:update
  socket.on(
    "board:column:update",
    async (data: { columnId: string; channelId: string; name?: string; color?: string }, callback) => {
      try {
        const column = await boardService.updateColumn(data.columnId, data);
        io.to(`channel:${data.channelId}`).emit("board:column:updated", column);
        if (callback) callback({ ok: true, column });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );

  // board:column:delete
  socket.on(
    "board:column:delete",
    async (data: { columnId: string; channelId: string }, callback) => {
      try {
        await boardService.deleteColumn(data.columnId);
        io.to(`channel:${data.channelId}`).emit("board:column:deleted", {
          columnId: data.columnId,
        });
        if (callback) callback({ ok: true });
      } catch (error: unknown) {
        if (callback) callback({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  );
}
