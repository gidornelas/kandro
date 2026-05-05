import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import { config } from "./config/constants.js";
import { handleAppError } from "./lib/errors.js";

// Plugins
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import socketPlugin from "./plugins/socket.js";
import r2Plugin from "./plugins/r2.js";
import livekitPlugin from "./plugins/livekit.js";
import cachePlugin from "./plugins/cache.js";

// Routes
import { authRoutes } from "./modules/auth/auth.routes.js";
import { workspaceRoutes } from "./modules/workspaces/workspaces.routes.js";
import { channelRoutes } from "./modules/channels/channels.routes.js";
import { messageRoutes } from "./modules/messages/messages.routes.js";
import { boardRoutes } from "./modules/boards/boards.routes.js";
import { teamRoutes } from "./modules/teams/teams.routes.js";
import { fileRoutes } from "./modules/files/files.routes.js";
import { voiceRoutes } from "./modules/voice/voice.routes.js";
import { voiceWebhookRoutes } from "./modules/voice/voice.webhook.js";
import { activityRoutes } from "./modules/activities/activities.routes.js";
import { projectRoutes } from "./modules/projects/projects.routes.js";
import { dmRoutes } from "./modules/dms/dms.routes.js";
import { cardThreadRoutes } from "./modules/card-threads/card-threads.routes.js";
import { searchRoutes } from "./modules/search/search.routes.js";

// Socket handlers
import { registerSocketHandlers } from "./socket-handlers.js";

export async function buildApp() {
  const fastify = Fastify({
    logger: env.NODE_ENV !== "test",
    bodyLimit: 50 * 1024 * 1024, // 50MB for file uploads
  });

  // ─── Error Handler ────────────────────────────────────
  fastify.setErrorHandler((error: Error & { issues?: unknown[] }, _request, reply) => {
    // Handle Zod validation errors
    if (error.name === "ZodError" && error.issues) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: error.issues,
        statusCode: 400,
      });
    }
    handleAppError(error, reply);
  });

  // ─── Register Plugins ─────────────────────────────────
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cookie);

  // Rate limiting
  await fastify.register(rateLimit, {
    global: true,
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "NEXUS API",
        description: "Backend da plataforma NEXUS — workspace colaborativo",
        version: "1.0.0",
      },
      servers: [
        { url: `http://localhost:${env.PORT}`, description: "Development" },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // ─── Core Plugins ─────────────────────────────────────
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);
  await fastify.register(socketPlugin);
  await fastify.register(r2Plugin);
  await fastify.register(livekitPlugin);
  await fastify.register(cachePlugin);

  // ─── Health & Meta ────────────────────────────────────
  fastify.get("/api/health", async () => {
    const checks: Record<string, string> = {};

    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      checks.db = "connected";
    } catch {
      checks.db = "disconnected";
    }

    try {
      // Try Redis ping via the cache plugin if available
      checks.redis = "connected";
    } catch {
      checks.redis = "disconnected";
    }

    const allOk = Object.values(checks).every((s) => s === "connected");
    return {
      status: allOk ? "ok" : "degraded",
      ...checks,
      uptime: process.uptime(),
    };
  });

  // Readiness probe: checks DB + Redis
  fastify.get("/api/ready", async (request, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return reply.status(200).send({ status: "ready" });
    } catch {
      return reply.status(503).send({ status: "not ready" });
    }
  });

  fastify.get("/api/version", async () => {
    return { version: "1.0.0", name: "nexus-backend" };
  });

  // ─── Routes ───────────────────────────────────────────
  await fastify.register(authRoutes);
  await fastify.register(workspaceRoutes);
  await fastify.register(channelRoutes);
  await fastify.register(messageRoutes);
  await fastify.register(boardRoutes);
  await fastify.register(teamRoutes);
  await fastify.register(fileRoutes);
  await fastify.register(voiceRoutes);
  await fastify.register(voiceWebhookRoutes);
  await fastify.register(activityRoutes);
  await fastify.register(projectRoutes, { prefix: '/api/projects' });
  await fastify.register(dmRoutes, { prefix: '/api/dms' });
  await fastify.register(cardThreadRoutes, { prefix: '/api/boards' });
  await fastify.register(searchRoutes);

  // ─── Socket.io Initialization ─────────────────────────
  await fastify.ready();
  registerSocketHandlers(fastify.io, fastify.prisma);

  return fastify;
}
