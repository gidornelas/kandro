import { AccessToken, WebhookReceiver } from "livekit-server-sdk";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import type { JwtPayload } from "../types/index.js";

declare module "fastify" {
  interface FastifyInstance {
    livekit: {
      generateToken(
        user: JwtPayload,
        roomName: string,
        canPublish?: boolean,
        canSubscribe?: boolean
      ): Promise<string>;
      verifyWebhook(
        body: string,
        authHeader: string
      ): boolean;
    };
  }
}

export default fp(async function livekitPlugin(fastify: FastifyInstance) {
  if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    fastify.decorate("livekit", {
      generateToken() {
        throw new AppError(500, "LiveKit não configurado");
      },
      verifyWebhook() {
        return false;
      },
    });
    return;
  }

  fastify.decorate("livekit", {
    async generateToken(
      user: JwtPayload,
      roomName: string,
      canPublish = true,
      canSubscribe = true
    ): Promise<string> {
      const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: user.sub,
        name: user.name,
        ttl: env.LIVEKIT_TOKEN_TTL,
      });
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish,
        canSubscribe,
      });
      return at.toJwt();
    },

    verifyWebhook(body: string, authHeader: string): boolean {
      try {
        const receiver = new WebhookReceiver(
          env.LIVEKIT_API_KEY!,
          env.LIVEKIT_API_SECRET!
        );
        receiver.receive(body, authHeader);
        return true;
      } catch {
        return false;
      }
    },
  });
});
