import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole, requireChannelAccess } from "../../middleware/authorize.js";
import { createChannelService } from "./channels.service.js";
import { createChannelSchema, updateChannelSchema } from "./channels.schema.js";

export async function channelRoutes(fastify: FastifyInstance) {
  const chService = createChannelService(fastify.prisma);

  // GET /api/workspaces/:workspaceId/channels
  fastify.get(
    "/api/workspaces/:workspaceId/channels",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      return fastify.cache.wrap(
        `ch:list:${workspaceId}`,
        30,
        () => chService.list(workspaceId),
        reply
      );
    }
  );

  // GET /api/channels/:channelId
  fastify.get(
    "/api/channels/:channelId",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request) => {
      const { channelId } = request.params as { channelId: string };
      return chService.getById(channelId);
    }
  );

  // POST /api/workspaces/:workspaceId/channels
  fastify.post(
    "/api/workspaces/:workspaceId/channels",
    { preHandler: [authenticate, requireWorkspaceRole("admin")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const input = createChannelSchema.parse(request.body);
      const channel = await chService.create(workspaceId, input, request.user.sub);
      fastify.cache.del(`ch:list:${workspaceId}`);
      return reply.status(201).send(channel);
    }
  );

  // PATCH /api/channels/:channelId
  fastify.patch(
    "/api/channels/:channelId",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      const input = updateChannelSchema.parse(request.body);
      const channel = await chService.update(channelId, input);
      // Invalidate channel list for all workspaces — use pattern or specific
      // We don't have workspaceId here, so skip invalidation (entries expire fast at 30s)
      return reply.send(channel);
    }
  );

  // DELETE /api/channels/:channelId
  fastify.delete(
    "/api/channels/:channelId",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      await chService.remove(channelId);
      return reply.status(204).send();
    }
  );
}
