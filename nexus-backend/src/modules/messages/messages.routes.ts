import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireChannelAccess } from "../../middleware/authorize.js";
import { createMessageService } from "./messages.service.js";
import {
  createMessageSchema,
  updateMessageSchema,
  toggleReactionSchema,
} from "./messages.schema.js";

export async function messageRoutes(fastify: FastifyInstance) {
  const msgService = createMessageService(fastify.prisma);

  // GET /api/channels/:channelId/messages
  fastify.get(
    "/api/channels/:channelId/messages",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request) => {
      const { channelId } = request.params as { channelId: string };
      const query = request.query as { cursor?: string; limit?: string };
      return msgService.listByChannel(channelId, query);
    }
  );

  // POST /api/channels/:channelId/messages
  fastify.post(
    "/api/channels/:channelId/messages",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      const input = createMessageSchema.parse(request.body);
      const message = await msgService.create(channelId, input, request.user.sub);
      return reply.status(201).send(message);
    }
  );

  // PATCH /api/messages/:messageId
  fastify.patch(
    "/api/messages/:messageId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { messageId } = request.params as { messageId: string };
      const input = updateMessageSchema.parse(request.body);
      const message = await msgService.update(messageId, input, request.user.sub);
      return reply.send(message);
    }
  );

  // DELETE /api/messages/:messageId
  fastify.delete(
    "/api/messages/:messageId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { messageId } = request.params as { messageId: string };
      await msgService.remove(messageId, request.user.sub);
      return reply.status(204).send();
    }
  );

  // POST /api/messages/:messageId/reactions
  fastify.post(
    "/api/messages/:messageId/reactions",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { messageId } = request.params as { messageId: string };
      const { emoji } = toggleReactionSchema.parse(request.body);
      const reactions = await msgService.toggleReaction(
        messageId,
        emoji,
        request.user.sub
      );
      return reply.send({ reactions });
    }
  );
}
