import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { createAuthService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  updateStatusSchema,
  updateProfileSchema,
} from "./auth.schema.js";

export async function authRoutes(fastify: FastifyInstance) {
  const authService = createAuthService(fastify.prisma);

  // POST /api/auth/register
  fastify.post(
    "/api/auth/register",
    {
      config: {
        rateLimit: { max: 3, timeWindow: 60_000 },
      },
    },
    async (request, reply) => {
      const input = registerSchema.parse(request.body);
      const user = await authService.register(input);

      const tokens = authService.generateTokens(
        fastify.jwtSign,
        fastify.jwtSignRefresh,
        user
      );
      await authService.storeRefreshToken(user.id, tokens.refreshToken);

      return reply.status(201).send({
        user,
        ...tokens,
      });
    }
  );

  // POST /api/auth/login
  fastify.post(
    "/api/auth/login",
    {
      config: {
        rateLimit: { max: 5, timeWindow: 60_000 },
      },
    },
    async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const user = await authService.login(input);

      const tokens = authService.generateTokens(
        fastify.jwtSign,
        fastify.jwtSignRefresh,
        user
      );
      await authService.storeRefreshToken(user.id, tokens.refreshToken);

      return reply.send({
        user,
        ...tokens,
      });
    }
  );

  // POST /api/auth/refresh
  fastify.post(
    "/api/auth/refresh",
    {
      config: {
        rateLimit: { max: 10, timeWindow: 60_000 },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body as { refreshToken: string };
      if (!refreshToken) {
        return reply.status(400).send({ error: "refreshToken é obrigatório" });
      }

      const user = await authService.rotateRefreshToken(refreshToken);
      const tokens = authService.generateTokens(
        fastify.jwtSign,
        fastify.jwtSignRefresh,
        user
      );
      await authService.storeRefreshToken(user.id, tokens.refreshToken);

      return reply.send(tokens);
    }
  );

  // GET /api/auth/me
  fastify.get(
    "/api/auth/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      return fastify.cache.wrap(
        `user:${userId}`,
        120,
        () => authService.getProfile(userId),
        reply
      );
    }
  );

  // PATCH /api/auth/me
  fastify.patch(
    "/api/auth/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const input = updateProfileSchema.parse(request.body);
      const result = await authService.updateProfile(request.user.sub, input);
      fastify.cache.del(`user:${request.user.sub}`);
      return reply.send(result);
    }
  );

  // PUT /api/auth/status
  fastify.put(
    "/api/auth/status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const input = updateStatusSchema.parse(request.body);
      const result = await authService.updateStatus(request.user.sub, input);
      return reply.send(result);
    }
  );
}
