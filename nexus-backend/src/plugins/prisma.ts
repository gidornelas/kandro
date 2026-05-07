import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["warn", "error"],
});

export default fp(async function prismaPlugin(fastify: FastifyInstance) {
  await prisma.$connect();

  if (process.env.NODE_ENV !== "test") {
    const [schemaState] = await prisma.$queryRaw<{ refresh_tokens: string | null; users: string | null }[]>`
      SELECT
        to_regclass('public.users')::text AS users,
        to_regclass('public.refresh_tokens')::text AS refresh_tokens
    `;

    if (!schemaState?.users || !schemaState?.refresh_tokens) {
      throw new Error("Database schema is not initialized. Run prisma migrate deploy before starting the app.");
    }
  }

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
