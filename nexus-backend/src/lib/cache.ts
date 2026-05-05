import { Redis } from "ioredis";
import { env } from "../config/env.js";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!env.REDIS_URL) return null;
  redis = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
  redis.on("error", () => { /* silent */ });
  // Connect lazily — first operation triggers connect
  redis.connect().catch(() => {});
  return redis;
}

export function cacheGet<T>(
  key: string,
  ttl: number,
  factory: () => Promise<T>
): Promise<{ data: T; hit: boolean }> {
  const client = getRedis();
  if (!client) return factory().then((data) => ({ data, hit: false }));

  return client.get(key).then((cached) => {
    if (cached) {
      return { data: JSON.parse(cached) as T, hit: true };
    }
    return factory().then((data) => {
      client!.setex(key, ttl, JSON.stringify(data)).catch(() => {});
      return { data, hit: false };
    });
  });
}

export function cacheSet(key: string, value: unknown, ttl: number): void {
  const client = getRedis();
  if (!client) return;
  client.setex(key, ttl, JSON.stringify(value)).catch(() => {});
}

export function cacheDel(key: string): void {
  const client = getRedis();
  if (!client) return;
  client.del(key).catch(() => {});
}

export function cacheDelPattern(pattern: string): void {
  const client = getRedis();
  if (!client) return;
  client.keys(pattern).then((keys) => {
    if (keys.length > 0) client!.del(...keys).catch(() => {});
  });
}

export async function cacheWrap<T>(
  key: string,
  ttl: number,
  factory: () => Promise<T>,
  reply: { header?: (name: string, value: string) => void } = {}
): Promise<T> {
  const result = await cacheGet<T>(key, ttl, factory);
  if (reply.header) {
    reply.header("X-Cache", result.hit ? "HIT" : "MISS");
  }
  return result.data;
}
