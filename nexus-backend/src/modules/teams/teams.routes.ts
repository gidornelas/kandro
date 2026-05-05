import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole } from "../../middleware/authorize.js";
import { createTeamService } from "./teams.service.js";
import {
  createTeamSchema,
  updateTeamSchema,
  setPermissionSchema,
} from "./teams.schema.js";

export async function teamRoutes(fastify: FastifyInstance) {
  const teamService = createTeamService(fastify.prisma);

  // GET /api/workspaces/:workspaceId/teams
  fastify.get(
    "/api/workspaces/:workspaceId/teams",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request) => {
      const { workspaceId } = request.params as { workspaceId: string };
      return teamService.list(workspaceId);
    }
  );

  // GET /api/teams/:teamId
  fastify.get(
    "/api/teams/:teamId",
    { preHandler: [authenticate] },
    async (request) => {
      const { teamId } = request.params as { teamId: string };
      return teamService.getById(teamId);
    }
  );

  // POST /api/workspaces/:workspaceId/teams
  fastify.post(
    "/api/workspaces/:workspaceId/teams",
    { preHandler: [authenticate, requireWorkspaceRole("admin")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const input = createTeamSchema.parse(request.body);
      const team = await teamService.create(workspaceId, input);
      return reply.status(201).send(team);
    }
  );

  // PATCH /api/teams/:teamId
  fastify.patch(
    "/api/teams/:teamId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { teamId } = request.params as { teamId: string };
      const input = updateTeamSchema.parse(request.body);
      const team = await teamService.update(teamId, input);
      return reply.send(team);
    }
  );

  // DELETE /api/teams/:teamId
  fastify.delete(
    "/api/teams/:teamId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { teamId } = request.params as { teamId: string };
      await teamService.remove(teamId);
      return reply.status(204).send();
    }
  );

  // POST /api/teams/:teamId/members
  fastify.post(
    "/api/teams/:teamId/members",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { teamId } = request.params as { teamId: string };
      const { userId } = request.body as { userId: string };
      const member = await teamService.addMember(teamId, userId);
      return reply.status(201).send(member);
    }
  );

  // DELETE /api/teams/:teamId/members/:userId
  fastify.delete(
    "/api/teams/:teamId/members/:userId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { teamId, userId } = request.params as {
        teamId: string;
        userId: string;
      };
      await teamService.removeMember(teamId, userId);
      return reply.status(204).send();
    }
  );

  // POST /api/teams/:teamId/permissions
  fastify.post(
    "/api/teams/:teamId/permissions",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { teamId } = request.params as { teamId: string };
      const input = setPermissionSchema.parse(request.body);
      const perm = await teamService.setPermission(teamId, input);
      return reply.status(201).send(perm);
    }
  );

  // GET /api/permissions/resolve
  fastify.get(
    "/api/permissions/resolve",
    { preHandler: [authenticate] },
    async (request) => {
      const query = request.query as { resourceId: string };
      const level = await teamService.resolvePermission(
        request.user.sub,
        query.resourceId
      );
      return { level };
    }
  );

  // GET /api/workspaces/:workspaceId/permissions/resources/:resourceId/teams
  fastify.get(
    "/api/workspaces/:workspaceId/permissions/resources/:resourceId/teams",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request) => {
      const { workspaceId, resourceId } = request.params as {
        workspaceId: string;
        resourceId: string;
      };
      return teamService.getResourceTeams(workspaceId, resourceId);
    }
  );
}
