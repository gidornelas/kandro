import { z } from "zod";
import { config } from "./constants.js";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  // Server
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // R2
  R2_ENDPOINT: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("nexus-uploads"),
  R2_PUBLIC_URL: z.string().optional(),
  R2_SIGNED_URL_TTL: z.coerce.number().default(900),
  // LiveKit
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_TOKEN_TTL: z.coerce.number().default(21600),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return { ...result.data, ...config };
}

export const env = loadEnv();
