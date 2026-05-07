import { describe, it, expect, vi } from "vitest";
import { createTeamService } from "../teams.service.js";

function createMockPrisma() {
  return {
    team: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teamMember: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    teamPermission: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  } as any;
}

describe("teams service", () => {
  it("lists teams with members, permissions, and count", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    const mockTeams = [
      {
        id: "team1",
        name: "Design",
        color: "#ff0000",
        members: [{ user: { id: "u1", name: "Alice" } }],
        permissions: [{ resourceId: "ch1", actions: ["view", "edit"] }],
        _count: { members: 1 },
      },
    ];
    prisma.team.findMany.mockResolvedValue(mockTeams);

    const result = await service.list("ws-1");

    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { workspaceId: "ws-1" } })
    );
    expect(result).toEqual(mockTeams);
  });

  it("gets team by id with includes", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    const mockTeam = {
      id: "team1",
      name: "Design",
      members: [],
      permissions: [],
    };
    prisma.team.findUnique.mockResolvedValue(mockTeam);

    const result = await service.getById("team1");

    expect(result).toEqual(mockTeam);
  });

  it("throws NotFoundError for non-existent team", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.findUnique.mockResolvedValue(null);

    await expect(service.getById("nonexistent")).rejects.toThrow("Equipe");
  });

  it("creates a team", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    const mockTeam = {
      id: "team-new",
      name: "Dev Team",
      color: "#7c6af7",
      members: [],
      permissions: [],
    };
    prisma.team.create.mockResolvedValue(mockTeam);

    const result = await service.create("ws-1", { name: "Dev Team" });

    expect(result.name).toBe("Dev Team");
  });

  it("updates a team", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.update.mockResolvedValue({
      id: "team1",
      name: "Updated Team",
      color: "#00ff00",
      members: [],
      permissions: [],
    });

    const result = await service.update("team1", { name: "Updated Team", color: "#00ff00" });

    expect(result.name).toBe("Updated Team");
  });

  it("removes a team", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.delete.mockResolvedValue({});

    await service.remove("team1");

    expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id: "team1" } });
  });

  it("adds a member using upsert", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.findUnique.mockResolvedValue({ id: "team1" });
    prisma.teamMember.upsert.mockResolvedValue({
      teamId: "team1",
      userId: "u1",
      user: { id: "u1", name: "Alice", initials: "A", color: "#000" },
    });

    const result = await service.addMember("team1", "u1");

    expect(result.userId).toBe("u1");
    expect(prisma.teamMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId_userId: { teamId: "team1", userId: "u1" } },
        create: { teamId: "team1", userId: "u1" },
      })
    );
  });

  it("throws NotFoundError when adding member to non-existent team", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.findUnique.mockResolvedValue(null);

    await expect(service.addMember("nonexistent", "u1")).rejects.toThrow("Equipe");
  });

  it("removes a member", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.teamMember.findUnique.mockResolvedValue({ id: "tm1", teamId: "team1", userId: "u1" });
    prisma.teamMember.delete.mockResolvedValue({});

    await service.removeMember("team1", "u1");

    expect(prisma.teamMember.delete).toHaveBeenCalledWith({ where: { id: "tm1" } });
  });

  it("handles removing non-existent member gracefully", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.teamMember.findUnique.mockResolvedValue(null);

    await service.removeMember("team1", "nonexistent");

    expect(prisma.teamMember.delete).not.toHaveBeenCalled();
  });

  it("sets permission with upsert for explicit actions", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.teamPermission.upsert.mockResolvedValue({
      id: "p1",
      teamId: "team1",
      resourceId: "ch1",
      resourceType: "channel",
      actions: ["view", "edit"],
    });

    const result = await service.setPermission("team1", {
      resourceId: "ch1",
      resourceType: "channel",
      actions: ["edit", "view", "edit"],
    });

    expect(result.actions).toEqual(["view", "edit"]);
    expect(prisma.teamPermission.upsert).toHaveBeenCalled();
  });

  it("deletes permission when actions are empty", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.teamPermission.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.setPermission("team1", {
      resourceId: "ch1",
      resourceType: "channel",
      actions: [],
    });

    expect(result).toBeNull();
    expect(prisma.teamPermission.deleteMany).toHaveBeenCalledWith({
      where: { teamId: "team1", resourceId: "ch1", resourceType: "channel" },
    });
  });

  it("resolves permission to merged actions across teams", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.findMany.mockResolvedValue([
      { permissions: [{ actions: ["view", "comment"] }] },
      { permissions: [{ actions: ["edit", "manage"] }] },
    ]);

    const result = await service.resolvePermission("u1", "ch1");

    expect(result).toEqual(["view", "comment", "edit", "manage"]);
  });

  it("resolves permission to empty actions when no teams match", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.findMany.mockResolvedValue([]);

    const result = await service.resolvePermission("u1", "ch1");

    expect(result).toEqual([]);
  });

  it("gets resource teams", async () => {
    const prisma = createMockPrisma();
    const service = createTeamService(prisma);
    prisma.team.findMany.mockResolvedValue([
      { id: "team1", name: "Design", color: "#ff0000" },
    ]);

    const result = await service.getResourceTeams("ws-1", "ch1");

    expect(result).toHaveLength(1);
  });
});
