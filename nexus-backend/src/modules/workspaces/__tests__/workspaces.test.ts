import { describe, it, expect, vi } from "vitest";
import { createWorkspaceService } from "../workspaces.service.js";

function createMockPrisma() {
  const mockCreate = vi.fn();
  const mockFindMany = vi.fn();
  const mockFindUnique = vi.fn();

  return {
    workspace: { create: mockCreate, findMany: mockFindMany },
    workspaceMember: { findUnique: mockFindUnique, findMany: mockFindMany },
    user: { findUnique: mockFindUnique },
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
});
