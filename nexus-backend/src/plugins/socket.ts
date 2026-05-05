import { Server as SocketServer } from "socket.io";
import { Redis } from "ioredis";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    io: SocketServer;
  }
}

// Dynamic import for Redis adapter (optional dependency)
async function setupRedisAdapter(io: SocketServer) {
  if (!env.REDIS_URL) return;
  try {
    const { createAdapter } = await import("@socket.io/redis-adapter");
    const pubClient = new Redis(env.REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Socket.io Redis adapter connected");
  } catch {
    console.warn("⚠️ Redis adapter not available, socket rooms are in-memory only");
  }
}

export default fp(async function socketPlugin(fastify: FastifyInstance) {
  const io = new SocketServer(fastify.server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Redis adapter for multi-instance support
  await setupRedisAdapter(io);

  fastify.decorate("io", io);

  fastify.addHook("onClose", async () => {
    io.close();
  });
});
