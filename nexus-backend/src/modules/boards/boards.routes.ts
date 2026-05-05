import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireChannelAccess, requireCardAccess, requireColumnAccess } from "../../middleware/authorize.js";
import { createBoardService } from "./boards.service.js";
import {
  createColumnSchema,
  updateColumnSchema,
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
  createCommentSchema,
  addLabelSchema,
  addAssigneeSchema,
} from "./boards.schema.js";

export async function boardRoutes(fastify: FastifyInstance) {
  const boardService = createBoardService(fastify.prisma);

  // ─── Columns ────────────────────────────────────────────

  // GET /api/channels/:channelId/columns
  fastify.get(
    "/api/channels/:channelId/columns",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request) => {
      const { channelId } = request.params as { channelId: string };
      return boardService.listColumns(channelId);
    }
  );

  // POST /api/channels/:channelId/columns
  fastify.post(
    "/api/channels/:channelId/columns",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      const input = createColumnSchema.parse(request.body);
      const channel = await fastify.prisma.channel.findUnique({
        where: { id: channelId },
      });
      const column = await boardService.createColumn(
        channelId,
        input,
        channel!.workspaceId,
        request.user.sub
      );
      return reply.status(201).send(column);
    }
  );

  // PATCH /api/columns/:columnId
  fastify.patch(
    "/api/columns/:columnId",
    { preHandler: [authenticate, requireColumnAccess] },
    async (request, reply) => {
      const { columnId } = request.params as { columnId: string };
      const input = updateColumnSchema.parse(request.body);
      const column = await boardService.updateColumn(columnId, input);
      return reply.send(column);
    }
  );

  // DELETE /api/columns/:columnId
  fastify.delete(
    "/api/columns/:columnId",
    { preHandler: [authenticate, requireColumnAccess] },
    async (request, reply) => {
      const { columnId } = request.params as { columnId: string };
      await boardService.deleteColumn(columnId);
      return reply.status(204).send();
    }
  );

  // ─── Cards ──────────────────────────────────────────────

  // GET /api/channels/:channelId/cards
  fastify.get(
    "/api/channels/:channelId/cards",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request) => {
      const { channelId } = request.params as { channelId: string };
      return boardService.listCards(channelId);
    }
  );

  // GET /api/cards/:cardId
  fastify.get(
    "/api/cards/:cardId",
    { preHandler: [authenticate, requireCardAccess] },
    async (request) => {
      const { cardId } = request.params as { cardId: string };
      return boardService.getCard(cardId);
    }
  );

  // POST /api/columns/:columnId/cards
  fastify.post(
    "/api/columns/:columnId/cards",
    { preHandler: [authenticate, requireColumnAccess] },
    async (request, reply) => {
      const { columnId } = request.params as { columnId: string };
      const input = createCardSchema.parse(request.body);
      const column = await fastify.prisma.kanbanColumn.findUnique({
        where: { id: columnId },
        include: { channel: true },
      });
      const card = await boardService.createCard(
        columnId,
        input,
        column!.channel.workspaceId,
        request.user.sub
      );
      return reply.status(201).send(card);
    }
  );

  // PATCH /api/cards/:cardId
  fastify.patch(
    "/api/cards/:cardId",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      const input = updateCardSchema.parse(request.body);
      const card = await fastify.prisma.kanbanCard.findUnique({
        where: { id: cardId },
        include: { column: { include: { channel: true } } },
      });
      const updated = await boardService.updateCard(
        cardId,
        input,
        card!.column.channel.workspaceId,
        request.user.sub
      );
      return reply.send(updated);
    }
  );

  // PATCH /api/cards/:cardId/move
  fastify.patch(
    "/api/cards/:cardId/move",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      const input = moveCardSchema.parse(request.body);
      const card = await fastify.prisma.kanbanCard.findUnique({
        where: { id: cardId },
        include: { column: { include: { channel: true } } },
      });
      const moved = await boardService.moveCard(
        cardId,
        input,
        card!.column.channel.workspaceId,
        request.user.sub
      );
      return reply.send(moved);
    }
  );

  // DELETE /api/cards/:cardId
  fastify.delete(
    "/api/cards/:cardId",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      await boardService.deleteCard(cardId);
      return reply.status(204).send();
    }
  );

  // ─── Labels ─────────────────────────────────────────────

  // POST /api/cards/:cardId/labels
  fastify.post(
    "/api/cards/:cardId/labels",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      const { name, color } = addLabelSchema.parse(request.body);
      const label = await boardService.addLabel(cardId, name, color);
      return reply.status(201).send(label);
    }
  );

  // DELETE /api/labels/:labelId
  fastify.delete(
    "/api/labels/:labelId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { labelId } = request.params as { labelId: string };
      await boardService.removeLabel(labelId);
      return reply.status(204).send();
    }
  );

  // ─── Assignees ──────────────────────────────────────────

  // POST /api/cards/:cardId/assignees
  fastify.post(
    "/api/cards/:cardId/assignees",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      const { userId } = addAssigneeSchema.parse(request.body);
      const assignee = await boardService.addAssignee(cardId, userId);
      return reply.status(201).send(assignee);
    }
  );

  // DELETE /api/cards/:cardId/assignees/:userId
  fastify.delete(
    "/api/cards/:cardId/assignees/:userId",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId, userId } = request.params as {
        cardId: string;
        userId: string;
      };
      await boardService.removeAssignee(cardId, userId);
      return reply.status(204).send();
    }
  );

  // ─── Subtasks ───────────────────────────────────────────

  // GET /api/cards/:cardId/subtasks
  fastify.get(
    "/api/cards/:cardId/subtasks",
    { preHandler: [authenticate, requireCardAccess] },
    async (request) => {
      const { cardId } = request.params as { cardId: string };
      return boardService.listSubtasks(cardId);
    }
  );

  // POST /api/cards/:cardId/subtasks
  fastify.post(
    "/api/cards/:cardId/subtasks",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      const input = createSubtaskSchema.parse(request.body);
      const card = await fastify.prisma.kanbanCard.findUnique({
        where: { id: cardId },
        include: { column: { include: { channel: true } } },
      });
      const subtask = await boardService.createSubtask(
        cardId,
        input,
        card!.column.channel.workspaceId,
        request.user.sub
      );
      return reply.status(201).send(subtask);
    }
  );

  // PATCH /api/subtasks/:subtaskId
  fastify.patch(
    "/api/subtasks/:subtaskId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { subtaskId } = request.params as { subtaskId: string };
      const input = updateSubtaskSchema.parse(request.body);
      const subtask = await boardService.updateSubtask(subtaskId, input);
      return reply.send(subtask);
    }
  );

  // DELETE /api/subtasks/:subtaskId
  fastify.delete(
    "/api/subtasks/:subtaskId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { subtaskId } = request.params as { subtaskId: string };
      await boardService.deleteSubtask(subtaskId);
      return reply.status(204).send();
    }
  );

  // ─── Comments ───────────────────────────────────────────

  // GET /api/cards/:cardId/comments
  fastify.get(
    "/api/cards/:cardId/comments",
    { preHandler: [authenticate, requireCardAccess] },
    async (request) => {
      const { cardId } = request.params as { cardId: string };
      return boardService.listComments(cardId);
    }
  );

  // POST /api/cards/:cardId/comments
  fastify.post(
    "/api/cards/:cardId/comments",
    { preHandler: [authenticate, requireCardAccess] },
    async (request, reply) => {
      const { cardId } = request.params as { cardId: string };
      const input = createCommentSchema.parse(request.body);
      const card = await fastify.prisma.kanbanCard.findUnique({
        where: { id: cardId },
        include: { column: { include: { channel: true } } },
      });
      const comment = await boardService.createComment(
        cardId,
        input,
        card!.column.channel.workspaceId,
        request.user.sub
      );
      return reply.status(201).send(comment);
    }
  );

  // DELETE /api/comments/:commentId
  fastify.delete(
    "/api/comments/:commentId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { commentId } = request.params as { commentId: string };
      await boardService.deleteComment(commentId);
      return reply.status(204).send();
    }
  );
}
