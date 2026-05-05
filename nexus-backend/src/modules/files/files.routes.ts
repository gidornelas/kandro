import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole } from "../../middleware/authorize.js";
import { createFileService } from "./files.service.js";
import { createFolderSchema, addFileTeamSchema } from "./files.schema.js";
import { ValidationError } from "../../lib/errors.js";
import { optimizeImage, generateThumbnail } from "../../lib/image.js";

export async function fileRoutes(fastify: FastifyInstance) {
  const fileService = createFileService(fastify.prisma);

  // GET /api/workspaces/:workspaceId/files
  fastify.get(
    "/api/workspaces/:workspaceId/files",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const query = request.query as { parentId?: string; cursor?: string; limit?: string };
      return fileService.listFolder(
        workspaceId,
        query.parentId || null,
        request.user.sub,
        { cursor: query.cursor, limit: query.limit }
      );
    }
  );

  // GET /api/workspaces/:workspaceId/files/tree
  fastify.get(
    "/api/workspaces/:workspaceId/files/tree",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request) => {
      const { workspaceId } = request.params as { workspaceId: string };
      return fileService.getFileTree(workspaceId);
    }
  );

  // POST /api/workspaces/:workspaceId/files/folder
  fastify.post(
    "/api/workspaces/:workspaceId/files/folder",
    { preHandler: [authenticate, requireWorkspaceRole("member")] },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const input = createFolderSchema.parse(request.body);
      const folder = await fileService.createFolder(
        workspaceId,
        input,
        request.user.sub
      );
      return reply.status(201).send(folder);
    }
  );

  const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/json",
  "application/zip",
]);

  // POST /api/workspaces/:workspaceId/files/upload
  fastify.post(
    "/api/workspaces/:workspaceId/files/upload",
    { preHandler: [authenticate, requireWorkspaceRole("member")], config: { rateLimit: { max: 10, timeWindow: 60_000 } } },
    async (request, reply) => {
      const { workspaceId } = request.params as { workspaceId: string };
      const query = request.query as { parentId?: string };

      const data = await request.file();
      if (!data) throw new ValidationError("Arquivo não enviado");

      if (
        !data.mimetype.startsWith("image/") &&
        !ALLOWED_MIME_TYPES.has(data.mimetype)
      ) {
        throw new ValidationError("Tipo de arquivo não permitido");
      }

      const buffer = await data.toBuffer();
      let uploadBuffer = buffer;
      let uploadMime = data.mimetype;
      let uploadName = data.filename;

      // Optimize images: resize + convert to WebP
      if (data.mimetype.startsWith("image/")) {
        try {
          const optimized = await optimizeImage(buffer, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 80,
            format: "webp",
          });
          uploadBuffer = optimized.buffer;
          uploadMime = optimized.mimeType;
          // Change extension to .webp
          const baseName = data.filename.replace(/\.[^.]+$/, "");
          uploadName = `${baseName}.webp`;

          // Also generate a thumbnail
          const thumb = await generateThumbnail(buffer);
          const thumbKey = `workspaces/${workspaceId}/thumb_${uploadName}`;
          await fastify.r2.upload(thumbKey, thumb.buffer, thumb.mimeType);
        } catch {
          // If optimization fails, fall back to original
          fastify.log.warn("Image optimization failed, using original");
        }
      }

      const file = await fileService.uploadFile(
        workspaceId,
        query.parentId || null,
        {
          name: uploadName,
          buffer: uploadBuffer,
          mimeType: uploadMime,
          size: uploadBuffer.length,
        },
        request.user.sub
      );

      // Upload to R2
      await fastify.r2.upload(file.storageKey!, uploadBuffer, uploadMime);

      // Log activity
      await fastify.prisma.activity.create({
        data: {
          workspaceId,
          userId: request.user.sub,
          action: "anexou",
          targetId: file.id,
          targetType: "file",
          targetName: file.name,
        },
      });

      return reply.status(201).send({
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        icon: file.icon,
      });
    }
  );

  // GET /api/files/:fileId/download
  fastify.get(
    "/api/files/:fileId/download",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { fileId } = request.params as { fileId: string };
      const file = await fileService.getFileInfo(fileId);

      const url = await fastify.r2.getSignedUrl(file.storageKey!);
      return reply.redirect(url);
    }
  );

  // GET /api/files/:fileId
  fastify.get(
    "/api/files/:fileId",
    { preHandler: [authenticate] },
    async (request) => {
      const { fileId } = request.params as { fileId: string };
      const file = await fileService.getFileInfo(fileId);

      // Generate signed URL if file
      let downloadUrl: string | null = null;
      if (file.type === "file" && file.storageKey) {
        downloadUrl = await fastify.r2.getSignedUrl(file.storageKey);
      }

      return { ...file, downloadUrl };
    }
  );

  // POST /api/files/:fileId/teams
  fastify.post(
    "/api/files/:fileId/teams",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { fileId } = request.params as { fileId: string };
      const { teamIds } = addFileTeamSchema.parse(request.body);
      await fileService.setFileTeams(fileId, teamIds);
      return reply.send({ ok: true });
    }
  );

  // DELETE /api/files/:fileId
  fastify.delete(
    "/api/files/:fileId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { fileId } = request.params as { fileId: string };
      const storageKeys = await fileService.deleteFile(fileId);
      for (const key of storageKeys) {
        if (key) {
          try {
            await fastify.r2.delete(key);
          } catch (err) {
            fastify.log.error({ storageKey: key, err }, "Falha ao deletar arquivo do R2");
          }
        }
      }
      return reply.status(204).send();
    }
  );
}
