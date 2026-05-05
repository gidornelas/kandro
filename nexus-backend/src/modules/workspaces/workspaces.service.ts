import type { PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundError, ConflictError } from "../../lib/errors.js";
import type { CreateWorkspaceInput, UpdateWorkspaceInput, AddMemberInput } from "./workspaces.schema.js";

export function createWorkspaceService(prisma: PrismaClient) {
  async function list(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
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
      role: member.role,
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

    await prisma.workspaceMember.delete({ where: { id: member.id } });
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
    listMembers,
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
