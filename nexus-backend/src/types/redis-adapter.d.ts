declare module "@socket.io/redis-adapter" {
  import { Redis } from "ioredis";
  import type { Adapter } from "socket.io-adapter";

  export function createAdapter(
    pubClient: Redis,
    subClient: Redis,
    options?: Record<string, unknown>
  ): (nsp: unknown) => Adapter;
}
