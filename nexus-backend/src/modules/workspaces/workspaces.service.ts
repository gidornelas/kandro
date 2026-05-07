import type { PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundError, ConflictError } from "../../lib/errors.js";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AddMemberInput,
  SearchMemberCandidatesInput,
} from "./workspaces.schema.js";

export function createWorkspaceService(prisma: PrismaClient) {
  async function list(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    });
    if (memberships.length > 0) {
      return memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
      }));
    }

    return [await bootstrapWorkspace(prisma, userId)];
  }

  async function getById(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      include: { workspace: true },
    });
    if (!member) throw new NotFoundError("Workspace");
    return { ...member.workspace, role: member.role };
  }

  async function create(input: CreateWorkspaceInput, userId: string) {
    const initials =
      input.initials ||
      input.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const workspace = await prisma.workspace.create({
      data: {
        name: input.name,
        initials,
        color: input.color || "#7c6af7",
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    return workspace;
  }

  async function update(
    workspaceId: string,
    input: UpdateWorkspaceInput,
    userId: string
  ) {
    await checkRole(prisma, workspaceId, userId, "admin");
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: input,
    });
    return workspace;
  }

  async function remove(workspaceId: string, userId: string) {
    await checkRole(prisma, workspaceId, userId, "owner");
    await prisma.workspace.delete({ where: { id: workspaceId } });
  }

  async function addMember(
    workspaceId: string,
    input: AddMemberInput,
    userId: string
  ) {
    await checkRole(prisma, workspaceId, userId, "admin");

    const userToAdd = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!userToAdd) throw new NotFoundError("Usuário com este email");

    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: userToAdd.id },
      },
    });
    if (existing) throw new ConflictError("Usuário já é membro");

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToAdd.id,
        role: input.role,
      },
      include: { user: true },
    });

    return {
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      initials: member.user.initials,
      color: member.user.color,
      role: member.role,
      status: member.user.status,
      joinedAt: member.joinedAt,
    };
  }

  async function removeMember(
    workspaceId: string,
    targetUserId: string,
    userId: string
  ) {
    await checkRole(prisma, workspaceId, userId, "admin");
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: targetUserId },
      },
    });
    if (!member) throw new NotFoundError("Membro");
    if (member.role === "owner") {
      throw new ForbiddenError("Owner não pode ser removido do workspace");
    }

    await prisma.teamMember.deleteMany({
      where: {
        userId: targetUserId,
        team: { workspaceId },
      },
    });
    await prisma.workspaceMember.delete({ where: { id: member.id } });
  }

  async function searchMemberCandidates(
    workspaceId: string,
    query: SearchMemberCandidatesInput,
    userId: string
  ) {
    await checkRole(prisma, workspaceId, userId, "admin");

    const existingMemberIds = (
      await prisma.workspaceMember.findMany({
        where: { workspaceId },
        select: { userId: true },
      })
    ).map((member) => member.userId);

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: existingMemberIds },
        OR: [
          { email: { contains: query.q, mode: "insensitive" } },
          { name: { contains: query.q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
        color: true,
        status: true,
      },
      take: 8,
      orderBy: { name: "asc" },
    });

    return candidates;
  }

  async function listMembers(workspaceId: string, userId: string) {
    await checkRole(prisma, workspaceId, userId, "member");
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      initials: m.user.initials,
      color: m.user.color,
      role: m.role,
      status: m.user.status,
      joinedAt: m.joinedAt,
    }));
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
    addMember,
    removeMember,
    searchMemberCandidates,
    listMembers,
  };
}

async function bootstrapWorkspace(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new NotFoundError("Usuário");

  const firstName = user.name.trim().split(" ")[0] || "Meu";
  const workspace = await prisma.$transaction(async (tx) => {
    const createdWorkspace = await tx.workspace.create({
      data: {
        name: `Workspace de ${firstName}`,
        initials: user.initials || firstName.slice(0, 2).toUpperCase(),
        color: user.color || "#7c6af7",
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    await tx.channel.create({
      data: {
        workspaceId: createdWorkspace.id,
        name: "geral",
        icon: "#",
        type: "text",
        description: "Canal principal do workspace",
      },
    });

    return createdWorkspace;
  });

  return {
    ...workspace,
    role: "owner",
  };
}

async function checkRole(
  prisma: PrismaClient,
  workspaceId: string,
  userId: string,
  minRole: string
) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new NotFoundError("Workspace");

  const roleOrder: Record<string, number> = { member: 0, admin: 1, owner: 2 };
  if (roleOrder[member.role] < roleOrder[minRole]) {
    throw new ForbiddenError(
      `Permissão insuficiente. Necessário: ${minRole}`
    );
  }
}
