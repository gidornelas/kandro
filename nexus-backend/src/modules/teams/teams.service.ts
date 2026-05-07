import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../lib/errors.js";
import type { CreateTeamInput, SetPermissionInput } from "./teams.schema.js";

const ACTION_ORDER = ["view", "post", "comment", "edit", "manage", "admin"] as const;

function normalizeActions(actions: string[]) {
  return ACTION_ORDER.filter((action) => actions.includes(action));
}

export function createTeamService(prisma: PrismaClient) {
  async function list(workspaceId: string) {
    return prisma.team.findMany({
      where: { workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
        permissions: true,
        _count: { select: { members: true } },
      },
    });
  }

  async function getById(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
        permissions: true,
      },
    });
    if (!team) throw new NotFoundError("Equipe");
    return team;
  }

  async function create(workspaceId: string, input: CreateTeamInput) {
    return prisma.team.create({
      data: {
        workspaceId,
        name: input.name,
        color: input.color || "#7c6af7",
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
        permissions: true,
      },
    });
  }

  async function update(teamId: string, input: Partial<CreateTeamInput>) {
    return prisma.team.update({
      where: { id: teamId },
      data: input,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
        permissions: true,
      },
    });
  }

  async function remove(teamId: string) {
    await prisma.team.delete({ where: { id: teamId } });
  }

  async function addMember(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundError("Equipe");

    return prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId },
      update: {},
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });
  }

  async function removeMember(teamId: string, userId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (member) {
      await prisma.teamMember.delete({ where: { id: member.id } });
    }
  }

  async function setPermission(
    teamId: string,
    input: SetPermissionInput
  ) {
    const actions = normalizeActions(input.actions);

    if (actions.length === 0) {
      await prisma.teamPermission.deleteMany({
        where: {
          teamId,
          resourceId: input.resourceId,
          resourceType: input.resourceType,
        },
      });
      return null;
    }

    return prisma.teamPermission.upsert({
      where: {
        teamId_resourceId_resourceType: {
          teamId,
          resourceId: input.resourceId,
          resourceType: input.resourceType,
        },
      },
      create: {
        teamId,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
        actions,
      },
      update: {
        actions,
      },
    });
  }

  async function resolvePermission(
    userId: string,
    resourceId: string,
    resourceType?: string
  ): Promise<string[]> {
    const teams = await prisma.team.findMany({
      where: {
        members: { some: { userId } },
        permissions: {
          some: {
            resourceId,
            ...(resourceType ? { resourceType } : {}),
            actions: { isEmpty: false },
          },
        },
      },
      select: {
        permissions: {
          where: { resourceId, ...(resourceType ? { resourceType } : {}) },
          select: { actions: true },
        },
      },
    });

    const actions = new Set<string>();
    for (const team of teams) {
      for (const perm of team.permissions) {
        for (const action of perm.actions) actions.add(action);
      }
    }

    return normalizeActions([...actions]);
  }

  async function getResourceTeams(workspaceId: string, resourceId: string) {
    return prisma.team.findMany({
      where: {
        workspaceId,
        permissions: {
          some: {
            resourceId,
            actions: { isEmpty: false },
          },
        },
      },
      select: { id: true, name: true, color: true },
    });
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
    addMember,
    removeMember,
    setPermission,
    resolvePermission,
    getResourceTeams,
  };
}
