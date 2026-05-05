import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole } from "../../middleware/authorize.js";
import { createActivityService } from "./activities.service.js";

export async function activityRoutes(fastify: FastifyInstance) {
  const activityService = createActivityService(fastify.prisma);

  // GET /api/workspaces/:workspaceId/activities
  fastify.get(
    "/api/workspaces/:workspaceId/activities",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const query = request.query as { cursor?: string; limit?: string };
      return activityService.list(workspaceId, query);
    }
  );
}
