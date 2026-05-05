import type { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";

type RoleCheck = "owner" | "admin" | "member";

export function requireWorkspaceRole(minRole: RoleCheck) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const { workspaceId } = request.params as { workspaceId?: string };
    const wid = workspaceId || (request.query as Record<string, string>)?.workspaceId;
    if (!wid) return;

    const prisma = request.server.prisma;
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: wid,
          userId: request.user.sub,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError("Você não é membro deste workspace");
    }

    const roleOrder: Record<string, number> = { member: 0, admin: 1, owner: 2 };
    if (roleOrder[member.role] < roleOrder[minRole]) {
      throw new ForbiddenError(
        `Requires role ${minRole}, but you are ${member.role}`
      );
    }
  };
}

export async function requireChannelAccess(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const { channelId } = request.params as { channelId?: string };
  const cid = channelId || (request.query as Record<string, string>)?.channelId;
  if (!cid) return;

  const prisma = request.server.prisma;
  const channel = await prisma.channel.findUnique({
    where: { id: cid },
    include: { workspace: true },
  });

  if (!channel) return;

  // DM rooms don't have a direct channel — handled differently
  if (channel.type === 'dm') return;

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: channel.workspaceId,
        userId: request.user.sub,
      },
    },
  });

  if (!member) {
    throw new ForbiddenError("Acesso negado a este canal");
  }

  if (channel.private) {
    // For private channels, verify membership via team permissions
    const teams = await prisma.team.findMany({
      where: {
        workspaceId: channel.workspaceId,
        members: { some: { userId: request.user.sub } },
        permissions: {
          some: {
            resourceId: channel.id,
            resourceType: "channel",
            level: { in: ["view", "edit"] },
          },
        },
      },
    });

    if (teams.length === 0 && member.role === "member") {
      throw new ForbiddenError("Você não tem acesso a este canal privado");
    }
  }
}

/**
 * Middleware: ensure user is a member of the workspace that owns the card.
 * Resolves: card -> column -> channel -> workspace membership.
 */
export async function requireCardAccess(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const { cardId } = request.params as { cardId?: string };
  if (!cardId) return;

  const prisma = request.server.prisma;
  const card = await prisma.kanbanCard.findUnique({
    where: { id: cardId },
    include: { column: { include: { channel: true } } },
  });
  if (!card) throw new NotFoundError("Card");

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: card.column.channel.workspaceId,
        userId: request.user.sub,
      },
    },
  });

  if (!member) {
    throw new ForbiddenError("Você não tem acesso a este card");
  }
}

/**
 * Middleware: ensure user is a member of the workspace that owns the column.
 * Resolves: column -> channel -> workspace membership.
 */
export async function requireColumnAccess(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const { columnId } = request.params as { columnId?: string };
  if (!columnId) return;

  const prisma = request.server.prisma;
  const column = await prisma.kanbanColumn.findUnique({
    where: { id: columnId },
    include: { channel: true },
  });
  if (!column) throw new NotFoundError("Coluna");

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: column.channel.workspaceId,
        userId: request.user.sub,
      },
    },
  });

  if (!member) {
    throw new ForbiddenError("Você não tem acesso a esta coluna");
  }
}
