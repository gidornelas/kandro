import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";

declare module "fastify" {
  interface FastifyInstance {
    r2: {
      upload(
        key: string,
        body: Buffer,
        mimeType: string
      ): Promise<void>;
      getSignedUrl(key: string): Promise<string>;
      list(prefix: string): Promise<string[]>;
      delete(key: string): Promise<void>;
    };
  }
}

function createR2Plugin() {
  if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    console.warn("⚠️ R2 not configured — file upload will fail at runtime");
    return undefined;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return client;
}

export default fp(async function r2Plugin(fastify: FastifyInstance) {
  const client = createR2Plugin();
  if (!client) {
    fastify.decorate("r2", {
      async upload() {
        throw new AppError(500, "R2 não configurado");
      },
      async getSignedUrl() {
        throw new AppError(500, "R2 não configurado");
      },
      async list() {
        throw new AppError(500, "R2 não configurado");
      },
      async delete() {
        throw new AppError(500, "R2 não configurado");
      },
    });
    return;
  }

  const bucket = env.R2_BUCKET;
  const ttl = env.R2_SIGNED_URL_TTL;

  fastify.decorate("r2", {
    async upload(key: string, body: Buffer, mimeType: string) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: mimeType,
        })
      );
    },

    async getSignedUrl(key: string): Promise<string> {
      return getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: ttl }
      );
    },

    async list(prefix: string): Promise<string[]> {
      const response = await client.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
      );
      return (response.Contents || []).map((o) => o.Key || "");
    },

    async delete(key: string) {
      await client.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: key })
      );
    },
  });
});
