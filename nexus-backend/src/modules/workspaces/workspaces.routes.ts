import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { createWorkspaceService } from "./workspaces.service.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "./workspaces.schema.js";

export async function workspaceRoutes(fastify: FastifyInstance) {
  const wsService = createWorkspaceService(fastify.prisma);

  // GET /api/workspaces
  fastify.get(
    "/api/workspaces",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      return fastify.cache.wrap(
        `ws:list:${userId}`,
        60,
        () => wsService.list(userId),
        reply
      );
    }
  );

  // GET /api/workspaces/:workspaceId
  fastify.get(
    "/api/workspaces/:workspaceId",
    { preHandler: [authenticate] },
    async (request) => {
      const { workspaceId } = request.params as { workspaceId: string };
      return wsService.getById(workspaceId, request.user.sub);
    }
  );

  // POST /api/workspaces
  fastify.post(
    "/api/workspaces",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const input = createWorkspaceSchema.parse(request.body);
      const workspace = await wsService.create(input, request.user.sub);
      fastify.cache.del(`ws:list:${request.user.sub}`);
      return reply.status(201).send(workspace);
    }
  );

  // PATCH /api/workspaces/:workspaceId
  fastify.patch(
    "/api/workspaces/:workspaceId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const input = updateWorkspaceSchema.parse(request.body);
      const workspace = await wsService.update(workspaceId, input, request.user.sub);
      fastify.cache.del(`ws:list:${request.user.sub}`);
      return reply.send(workspace);
    }
  );

  // DELETE /api/workspaces/:workspaceId
  fastify.delete(
    "/api/workspaces/:workspaceId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      await wsService.remove(workspaceId, request.user.sub);
      fastify.cache.del(`ws:list:${request.user.sub}`);
      return reply.status(204).send();
    }
  );

  // POST /api/workspaces/:workspaceId/members
  fastify.post(
    "/api/workspaces/:workspaceId/members",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const input = addMemberSchema.parse(request.body);
      const member = await wsService.addMember(workspaceId, input, request.user.sub);
      fastify.cache.del(`ws:list:${request.user.sub}`);
      return reply.status(201).send(member);
    }
  );

  // GET /api/workspaces/:workspaceId/members
  fastify.get(
    "/api/workspaces/:workspaceId/members",
    { preHandler: [authenticate] },
    async (request) => {
      const { workspaceId } = request.params as { workspaceId: string };
      return wsService.listMembers(workspaceId, request.user.sub);
    }
  );

  // DELETE /api/workspaces/:workspaceId/members/:userId
  fastify.delete(
    "/api/workspaces/:workspaceId/members/:userId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { workspaceId, userId } = request.params as {
        workspaceId: string;
        userId: string;
      };
      await wsService.removeMember(workspaceId, userId, request.user.sub);
      fastify.cache.del(`ws:list:${request.user.sub}`);
      return reply.status(204).send();
    }
  );
}
