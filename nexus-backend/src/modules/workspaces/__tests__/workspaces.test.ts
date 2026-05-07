import { describe, it, expect, vi } from "vitest";
import { createWorkspaceService } from "../workspaces.service.js";

function createMockPrisma() {
  const mockCreate = vi.fn();
  const mockDelete = vi.fn();
  const mockWorkspaceFindMany = vi.fn();
  const mockWorkspaceMemberFindMany = vi.fn();
  const mockWorkspaceMemberFindUnique = vi.fn();
  const mockUserFindMany = vi.fn();
  const mockUserFindUnique = vi.fn();
  const mockTransaction = vi.fn();

  return {
    workspace: { create: mockCreate, findMany: mockWorkspaceFindMany },
    workspaceMember: { findUnique: mockWorkspaceMemberFindUnique, findMany: mockWorkspaceMemberFindMany, delete: mockDelete },
    channel: { create: mockCreate },
    teamMember: { deleteMany: mockDelete },
    user: { findUnique: mockUserFindUnique, findMany: mockUserFindMany },
    $transaction: mockTransaction,
  } as any;
}

describe("workspace service", () => {
  it("creates a workspace with initials and owner member", async () => {
    const prisma = createMockPrisma();
    const service = createWorkspaceService(prisma as any);

    const mockWorkspace = {
      id: "ws-1",
      name: "My Workspace",
      initials: "MW",
      color: "#7c6af7",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.workspace.create.mockResolvedValue(mockWorkspace);

    const result = await service.create(
      { name: "My Workspace" },
      "user-123"
    );

    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: {
        name: "My Workspace",
        initials: "MW",
        color: "#7c6af7",
        members: {
          create: {
            userId: "user-123",
            role: "owner",
          },
        },
      },
    });
    expect(result).toEqual(mockWorkspace);
  });

  it("creates a workspace with custom initials and color", async () => {
    const prisma = createMockPrisma();
    const service = createWorkspaceService(prisma as any);

    prisma.workspace.create.mockResolvedValue({
      id: "ws-2",
      name: "Design Team",
      initials: "DT",
      color: "#ff5733",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create(
      { name: "Design Team", initials: "DT", color: "#ff5733" },
      "user-456"
    );

    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: {
        name: "Design Team",
        initials: "DT",
        color: "#ff5733",
        members: {
          create: {
            userId: "user-456",
            role: "owner",
          },
        },
      },
    });
    expect(result.initials).toBe("DT");
    expect(result.color).toBe("#ff5733");
  });

  it("bootstraps a default workspace and general channel when the user has none", async () => {
    const prisma = createMockPrisma();
    const service = createWorkspaceService(prisma as any);

    prisma.workspaceMember.findMany.mockResolvedValue([]);
    prisma.user.findUnique.mockResolvedValue({
      id: "user-789",
      name: "Ana Lima",
      initials: "AL",
      color: "#2f80ed",
    });
    prisma.workspace.create.mockResolvedValue({
      id: "ws-bootstrap",
      name: "Workspace de Ana",
      initials: "AL",
      color: "#2f80ed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma));

    const result = await service.list("user-789");

    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: {
        name: "Workspace de Ana",
        initials: "AL",
        color: "#2f80ed",
        members: {
          create: {
            userId: "user-789",
            role: "owner",
          },
        },
      },
    });
    expect(prisma.channel.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "ws-bootstrap",
        name: "geral",
        icon: "#",
        type: "text",
        description: "Canal principal do workspace",
      },
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: "ws-bootstrap",
        role: "owner",
      }),
    ]);
  });

  it("searches member candidates by email or display name and excludes existing members", async () => {
    const prisma = createMockPrisma();
    const service = createWorkspaceService(prisma as any);

    prisma.workspaceMember.findUnique.mockResolvedValue({
      workspaceId: "ws-1",
      userId: "admin-1",
      role: "admin",
    });
    prisma.workspaceMember.findMany.mockResolvedValueOnce([{ userId: "user-1" }]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: "user-2",
        name: "Ana Lima",
        email: "ana@example.com",
        initials: "AL",
        color: "#2f80ed",
        status: "online",
      },
    ]);

    const result = await service.searchMemberCandidates("ws-1", { q: "ana" }, "admin-1");

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: { notIn: ["user-1"] },
        OR: [
          { email: { contains: "ana", mode: "insensitive" } },
          { name: { contains: "ana", mode: "insensitive" } },
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
    expect(result).toEqual([
      expect.objectContaining({
        id: "user-2",
        email: "ana@example.com",
      }),
    ]);
  });

  it("prevents removing the workspace owner", async () => {
    const prisma = createMockPrisma();
    const service = createWorkspaceService(prisma as any);

    prisma.workspaceMember.findUnique
      .mockResolvedValueOnce({
        workspaceId: "ws-1",
        userId: "admin-1",
        role: "admin",
      })
      .mockResolvedValueOnce({
        id: "member-owner",
        workspaceId: "ws-1",
        userId: "owner-1",
        role: "owner",
      });

    await expect(service.removeMember("ws-1", "owner-1", "admin-1")).rejects.toThrow(
      "Owner não pode ser removido do workspace"
    );
    expect(prisma.workspaceMember.delete).not.toHaveBeenCalled();
  });
});
