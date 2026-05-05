import { env } from "./config/env.js";
import { buildApp } from "./app.js";

async function main() {
  app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 NEXUS Backend running at http://${env.HOST}:${env.PORT}`);
    console.log(`📚 API docs at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

let app: Awaited<ReturnType<typeof buildApp>> | null = null;

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  if (app) {
    await app.close();
    console.log("✅ Fastify server closed");
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main();
