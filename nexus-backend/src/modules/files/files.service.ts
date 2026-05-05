import { v4 as uuid } from "uuid";
import type { PrismaClient } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "../../lib/errors.js";
import { parsePagination, paginate } from "../../lib/pagination.js";
import type { CreateFolderInput } from "./files.schema.js";

export function createFileService(prisma: PrismaClient) {
  async function listFolder(
    workspaceId: string,
    parentId: string | null,
    userId: string,
    query?: { cursor?: string; limit?: string }
  ) {
    const { cursor, limit } = parsePagination(query ?? {});

    const files = await prisma.fileNode.findMany({
      where: {
        workspaceId,
        parentId: parentId,
      },
      include: {
        teams: {
          include: { team: { select: { id: true, name: true, color: true } } },
        },
        uploadedBy: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Get all file team IDs for batch access check
    const fileTeamIds = files.flatMap((f) => f.teams.map((t) => t.team.id));
    const uniqueFileTeamIds = [...new Set(fileTeamIds)];

    // Single batch query for user's teams
    const userTeams = await prisma.team.findMany({
      where: {
        workspaceId,
        members: { some: { userId } },
      },
      select: { id: true },
    });
    const userTeamIdSet = new Set(userTeams.map((t) => t.id));

    // Batch query: get direct children count for all folders at once
    const folderIds = files.filter((f) => f.type === "folder").map((f) => f.id);
    let folderCounts: Map<string, number> = new Map();
    if (folderIds.length > 0) {
      const counts = await prisma.fileNode.groupBy({
        by: ["parentId"],
        where: { parentId: { in: folderIds } },
        _count: { id: true },
      });
      folderCounts = new Map(
        counts.map((c) => [c.parentId!, c._count.id])
      );
    }

    // Resolve access level for each file
    const result = files.map((file) => {
      const fileTeamIds = file.teams.map((t) => t.team.id);
      const hasAccess =
        fileTeamIds.some((id) => userTeamIdSet.has(id)) ||
        file.uploadedById === userId;

      // If no teams assigned, everyone has access
      const isRestricted = fileTeamIds.length > 0 && !hasAccess;

      // Compute itemCount for folders (direct children count)
      const itemCount = file.type === "folder"
        ? (folderCounts.get(file.id) ?? 0)
        : undefined;

      return {
        id: file.id,
        name: file.name,
        type: file.type,
        icon: file.icon,
        size: file.size,
        mimeType: file.mimeType,
        teamIds: fileTeamIds,
        teams: file.teams.map((t) => t.team),
        uploadedBy: file.uploadedBy?.id,
        uploadedByName: file.uploadedBy?.name,
        uploadedAt: file.createdAt,
        restricted: isRestricted,
        encrypted: file.encrypted,
        itemCount,
      };
    });

    // Post-filter cursor pagination (after access resolution)
    const paginated = paginate(result, limit);
    return paginated;
  }

  async function createFolder(
    workspaceId: string,
    input: CreateFolderInput,
    userId: string
  ) {
    return prisma.fileNode.create({
      data: {
        workspaceId,
        parentId: input.parentId || null,
        name: input.name,
        type: "folder",
        icon: "📁",
        uploadedById: userId,
      },
    });
  }

  async function uploadFile(
    workspaceId: string,
    parentId: string | null,
    file: {
      name: string;
      buffer: Buffer;
      mimeType: string;
      size: number;
    },
    userId: string
  ) {
    const ext = file.name.split(".").pop() || "";
    const storageKey = `workspaces/${workspaceId}/${uuid()}-${file.name}`;

    // Store in R2 (handled by caller via r2 plugin)
    const fileNode = await prisma.fileNode.create({
      data: {
        workspaceId,
        parentId: parentId,
        name: file.name,
        type: "file",
        icon: getFileIcon(file.mimeType, ext),
        mimeType: file.mimeType,
        size: file.size,
        storageKey,
        uploadedById: userId,
        encrypted: false,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });

    return { ...fileNode, storageKey };
  }

  async function getFileInfo(fileId: string) {
    const file = await prisma.fileNode.findUnique({
      where: { id: fileId },
      include: {
        teams: {
          include: { team: { select: { id: true, name: true, color: true } } },
        },
        uploadedBy: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });
    if (!file) throw new NotFoundError("Arquivo");
    return file;
  }

  async function checkFileAccess(
    fileId: string,
    userId: string,
    workspaceId: string
  ) {
    const file = await prisma.fileNode.findUnique({
      where: { id: fileId },
      include: { teams: true },
    });
    if (!file) throw new NotFoundError("Arquivo");
    if (file.uploadedById === userId) return;

    const fileTeamIds = file.teams.map((t) => t.teamId);
    if (fileTeamIds.length === 0) return; // public file

    const userTeams = await prisma.team.findMany({
      where: {
        workspaceId,
        members: { some: { userId } },
      },
      select: { id: true },
    });

    const hasAccess = userTeams.some((ut) => fileTeamIds.includes(ut.id));
    if (!hasAccess) throw new ForbiddenError("Acesso negado ao arquivo");
  }

  async function setFileTeams(
    fileId: string,
    teamIds: string[]
  ) {
    // Remove existing team associations
    await prisma.fileNodeTeam.deleteMany({ where: { fileNodeId: fileId } });

    // Add new ones
    if (teamIds.length > 0) {
      await prisma.fileNodeTeam.createMany({
        data: teamIds.map((teamId) => ({ fileNodeId: fileId, teamId })),
      });
    }
  }

  async function deleteFile(fileId: string): Promise<string[]> {
    const file = await prisma.fileNode.findUnique({
      where: { id: fileId },
    });
    if (!file) throw new NotFoundError("Arquivo");

    const keys: string[] = [];

    // If folder, delete children recursively and collect all storageKeys
    if (file.type === "folder") {
      const children = await prisma.fileNode.findMany({
        where: { parentId: fileId },
      });
      for (const child of children) {
        const childKeys = await deleteFile(child.id);
        keys.push(...childKeys);
      }
    }

    await prisma.fileNode.delete({ where: { id: fileId } });
    if (file.storageKey) keys.push(file.storageKey);
    return keys;
  }

  async function getFileTree(workspaceId: string) {
    const files = await prisma.fileNode.findMany({
      where: { workspaceId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      include: {
        teams: {
          include: { team: { select: { id: true, name: true, color: true } } },
        },
        uploadedBy: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });

    return buildTree(files);
  }

  return {
    listFolder,
    createFolder,
    uploadFile,
    getFileInfo,
    checkFileAccess,
    setFileTeams,
    deleteFile,
    getFileTree,
  };
}

function getFileIcon(mimeType: string, ext: string): string {
  if (ext === "fig" || mimeType.includes("figma")) return "🎨";
  if (ext === "pdf") return "📄";
  if (["zip", "rar", "gz"].includes(ext)) return "📦";
  if (["jpg", "png", "svg", "webp"].includes(ext)) return "🖼️";
  if (["mp4", "mov", "webm"].includes(ext)) return "🎬";
  if (["md", "doc", "docx"].includes(ext)) return "📝";
  if (["xls", "csv"].includes(ext)) return "📊";
  return "📄";
}

function buildTree(
  nodes: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  const roots: Array<Record<string, unknown>> = [];

  for (const node of nodes) {
    map.set(node.id as string, { ...node, children: [] });
  }

  for (const node of nodes) {
    const mapped = map.get(node.id as string)!;
    if (node.parentId && map.has(node.parentId as string)) {
      (map.get(node.parentId as string)!.children as Array<Record<string, unknown>>).push(mapped);
    } else {
      roots.push(mapped);
    }
  }

  return roots;
}
