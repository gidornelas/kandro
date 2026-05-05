import jwt from "jsonwebtoken";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import type { JwtPayload } from "../types/index.js";

declare module "fastify" {
  interface FastifyInstance {
    jwtSign(payload: JwtPayload): string;
    jwtSignRefresh(payload: JwtPayload): string;
    jwtVerify(token: string): JwtPayload;
  }
}

// Parse TTL strings like "15m" or "7d" to seconds
function parseTTL(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const val = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return val;
    case "m": return val * 60;
    case "h": return val * 3600;
    case "d": return val * 86400;
    default: return val;
  }
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  const accessTTL = parseTTL(env.JWT_ACCESS_TTL);
  const refreshTTL = parseTTL(env.JWT_REFRESH_TTL);

  fastify.decorate("jwtSign", (payload: JwtPayload): string => {
    return jwt.sign(payload as object, env.JWT_SECRET, {
      expiresIn: accessTTL,
    });
  });

  fastify.decorate("jwtSignRefresh", (payload: JwtPayload): string => {
    return jwt.sign(payload as object, env.JWT_SECRET, {
      expiresIn: refreshTTL,
    });
  });

  fastify.decorate("jwtVerify", (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  });
});
