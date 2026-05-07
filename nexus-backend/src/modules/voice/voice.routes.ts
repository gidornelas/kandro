import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireChannelAccess } from "../../middleware/authorize.js";
import { createVoiceService } from "./voice.service.js";
import { joinVoiceSchema, updateParticipantSchema } from "./voice.schema.js";
import { ValidationError } from "../../lib/errors.js";
import { env } from "../../config/env.js";

export async function voiceRoutes(fastify: FastifyInstance) {
  const voiceService = createVoiceService(fastify.prisma);

  // GET /api/channels/:channelId/voice/session
  fastify.get(
    "/api/channels/:channelId/voice/session",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request) => {
      const { channelId } = request.params as { channelId: string };
      const session = await voiceService.getSession(channelId);
      return session || { active: false, participants: [] };
    }
  );

  // POST /api/channels/:channelId/voice/join
  fastify.post(
    "/api/channels/:channelId/voice/join",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      const result = await voiceService.joinChannel(channelId, request.user.sub);
      return reply.send(result);
    }
  );

  // POST /api/channels/:channelId/voice/leave
  fastify.post(
    "/api/channels/:channelId/voice/leave",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      await voiceService.leaveChannel(channelId, request.user.sub);
      return reply.send({ ok: true });
    }
  );

  // PATCH /api/channels/:channelId/voice/participant
  fastify.patch(
    "/api/channels/:channelId/voice/participant",
    { preHandler: [authenticate, requireChannelAccess] },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      const input = updateParticipantSchema.parse(request.body);
      const result = await voiceService.updateParticipant(
        channelId,
        request.user.sub,
        input
      );
      return reply.send(result);
    }
  );

  // POST /api/channels/:channelId/voice/token
  fastify.post(
    "/api/channels/:channelId/voice/token",
    { preHandler: [authenticate, requireChannelAccess], config: { rateLimit: { max: 5, timeWindow: 60_000 } } },
    async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      const roomName = `channel-${channelId}`;
      if (!env.LIVEKIT_URL) {
        throw new ValidationError("LiveKit URL não configurada");
      }

      const token = await fastify.livekit.generateToken(
        request.user,
        roomName,
        true,
        true
      );

      // Ensure session exists
      await voiceService.joinChannel(channelId, request.user.sub);

      return reply.send({
        token,
        room: roomName,
        url: env.LIVEKIT_URL,
      });
    }
  );
}
