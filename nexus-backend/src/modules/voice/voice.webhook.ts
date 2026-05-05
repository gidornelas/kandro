import type { FastifyInstance } from "fastify";
import { createVoiceService } from "./voice.service.js";
import { livekitWebhookSchema } from "./voice.schema.js";

export async function voiceWebhookRoutes(fastify: FastifyInstance) {
  const voiceService = createVoiceService(fastify.prisma);

  // POST /api/webhooks/livekit
  fastify.post(
    "/api/webhooks/livekit",
    async (request, reply) => {
      const authHeader = request.headers.authorization || "";
      const rawBody = request.body;

      if (!fastify.livekit.verifyWebhook(JSON.stringify(rawBody), authHeader)) {
        return reply.status(401).send({ error: "Invalid webhook signature" });
      }

      const body = livekitWebhookSchema.parse(rawBody);
      const roomName = body.room.name;
      const channelId = roomName.replace("channel-", "");
      const io = fastify.io;

      switch (body.event) {
        case "room_started":
          console.log(`[LiveKit] Room started: ${roomName}`);
          break;

        case "room_finished":
          await voiceService.endSessionByRoom(roomName);
          io.to(`channel:${channelId}`).emit("voice:room:ended", {
            channelId,
          });
          break;

        case "participant_joined":
          io.to(`channel:${channelId}`).emit("voice:participant:joined", {
            userId: body.participant?.identity,
            timestamp: new Date().toISOString(),
          });
          break;

        case "participant_left": {
          await voiceService.removeParticipantByRoom(
            roomName,
            body.participant?.identity || ""
          );
          io.to(`channel:${channelId}`).emit("voice:participant:left", {
            userId: body.participant?.identity,
            timestamp: new Date().toISOString(),
          });

          // End session if no participants left
          const session = await voiceService.getSession(channelId);
          if (!session || session.participants.length === 0) {
            await voiceService.endSessionByRoom(roomName);
            io.to(`channel:${channelId}`).emit("voice:room:ended", {
              channelId,
            });
          }
          break;
        }

        case "track_published":
        case "track_unpublished":
          // Could relay these for UI indicators
          break;

        case "active_speaker_changed":
          io.to(`channel:${channelId}`).emit("voice:speaking", {
            userId: body.participant?.identity,
            speaking: true,
          });
          break;
      }

      return reply.send({ received: true });
    }
  );
}
