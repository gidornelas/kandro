import { Redis } from "ioredis";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    cache: {
      get<T>(key: string, ttl: number, factory: () => Promise<T>, reply?: { header: (name: string, value: string) => void }): Promise<{ data: T; hit: boolean }>;
      set(key: string, value: unknown, ttl: number): void;
      del(key: string): void;
      delPattern(pattern: string): void;
      wrap<T>(key: string, ttl: number, factory: () => Promise<T>, reply?: { header: (name: string, value: string) => void }): Promise<T>;
    };
  }
}

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;
  if (!env.REDIS_URL) return null;
  redisInstance = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
  redisInstance.on("error", () => { /* silent */ });
  redisInstance.connect().catch(() => {});
  return redisInstance;
}

export default fp(async function cachePlugin(fastify: FastifyInstance) {
  const client = getRedis();

  const cache = {
    async get<T>(
      key: string,
      ttl: number,
      factory: () => Promise<T>,
      reply?: { header: (name: string, value: string) => void }
    ): Promise<{ data: T; hit: boolean }> {
      if (!client) {
        const data = await factory();
        return { data, hit: false };
      }
      const cached = await client.get(key);
      if (cached) {
        reply?.header("X-Cache", "HIT");
        return { data: JSON.parse(cached) as T, hit: true };
      }
      const data = await factory();
      client.setex(key, ttl, JSON.stringify(data)).catch(() => {});
      reply?.header("X-Cache", "MISS");
      return { data, hit: false };
    },

    set(key: string, value: unknown, ttl: number): void {
      client?.setex(key, ttl, JSON.stringify(value)).catch(() => {});
    },

    del(key: string): void {
      client?.del(key).catch(() => {});
    },

    delPattern(pattern: string): void {
      client?.keys(pattern).then((keys) => {
        if (keys.length > 0) client!.del(...keys).catch(() => {});
      }).catch(() => {});
    },

    async wrap<T>(
      key: string,
      ttl: number,
      factory: () => Promise<T>,
      reply?: { header: (name: string, value: string) => void }
    ): Promise<T> {
      const result = await this.get<T>(key, ttl, factory, reply);
      return result.data;
    },
  };

  fastify.decorate("cache", cache);

  // Cleanup on close
  fastify.addHook("onClose", async () => {
    if (redisInstance) {
      await redisInstance.quit();
    }
  });
});
