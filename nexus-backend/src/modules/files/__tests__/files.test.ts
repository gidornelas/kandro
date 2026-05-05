import { describe, it, expect, vi } from "vitest";
import { createFileService } from "../files.service.js";

function createMockPrisma() {
  return {
    fileNode: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    fileNodeTeam: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
    },
  } as any;
}

describe("files service", () => {
  it("lists folder contents with access resolution", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    const mockFiles = [
      {
        id: "f1",
        name: "doc.pdf",
        type: "file",
        icon: "📄",
        mimeType: "application/pdf",
        size: 1024,
        storageKey: "key1",
        parentId: null,
        encrypted: false,
        createdAt: new Date(),
        teams: [],
        uploadedBy: { id: "u1", name: "User", initials: "U", color: "#000" },
        uploadedById: "u1",
      },
      {
        id: "f2",
        name: "Folder",
        type: "folder",
        icon: "📁",
        mimeType: null,
        size: null,
        storageKey: null,
        parentId: null,
        encrypted: false,
        createdAt: new Date(),
        teams: [{ team: { id: "t1", name: "Design", color: "#ff0000" } }],
        uploadedBy: null,
        uploadedById: null,
      },
    ];
    prisma.fileNode.findMany.mockResolvedValue(mockFiles);
    prisma.team.findMany.mockResolvedValue([{ id: "t1" }]);
    prisma.fileNode.groupBy.mockResolvedValue([{ parentId: "f2", _count: { id: 3 } }]);
    prisma.fileNode.count.mockResolvedValue(3);

    const result = await service.listFolder("ws-1", null, "u1");

    expect(result.data).toHaveLength(2);
    expect(result.data[0].restricted).toBe(false); // uploaded by user
    expect(result.data[1].restricted).toBe(false); // user is in team t1
  });

  it("marks file as restricted when user has no access", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findMany.mockResolvedValue([
      {
        id: "f1",
        name: "restricted.doc",
        type: "file",
        storageKey: "key1",
        parentId: null,
        encrypted: false,
        createdAt: new Date(),
        teams: [{ team: { id: "t_other", name: "Other", color: "#000" } }],
        uploadedBy: null,
        uploadedById: null,
        mimeType: null,
        size: null,
        icon: "📄",
      },
    ]);
    prisma.team.findMany.mockResolvedValue([{ id: "t1" }]); // user is in t1, not t_other
    prisma.fileNode.groupBy.mockResolvedValue([]);
    prisma.fileNode.count.mockResolvedValue(0);

    const result = await service.listFolder("ws-1", null, "u1");

    expect(result.data[0].restricted).toBe(true);
  });

  it("creates a folder", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    const mockFolder = {
      id: "folder-new",
      workspaceId: "ws-1",
      parentId: null,
      name: "New Folder",
      type: "folder",
      icon: "📁",
      uploadedById: "u1",
    };
    prisma.fileNode.create.mockResolvedValue(mockFolder);

    const result = await service.createFolder("ws-1", { name: "New Folder" }, "u1");

    expect(result.name).toBe("New Folder");
    expect(result.icon).toBe("📁");
  });

  it("uploads a file with icon selection and storageKey", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.create.mockImplementation(async ({ data }: any) => ({
      id: "file-new",
      ...data,
      uploadedBy: { id: "u1", name: "User", initials: "U", color: "#000" },
    }));

    const result = await service.uploadFile(
      "ws-1",
      null,
      { name: "design.fig", buffer: Buffer.from("test"), mimeType: "application/figma", size: 100 },
      "u1"
    );

    expect(result.name).toBe("design.fig");
    expect(result.icon).toBe("🎨");
    expect(result.storageKey).toMatch(/^workspaces\/ws-1\//);
  });

  it("gets file info with teams and uploader", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    const mockFile = {
      id: "f1",
      name: "doc.pdf",
      type: "file",
      teams: [{ team: { id: "t1", name: "Design", color: "#ff0000" } }],
      uploadedBy: { id: "u1", name: "User", initials: "U", color: "#000" },
    };
    prisma.fileNode.findUnique.mockResolvedValue(mockFile);

    const result = await service.getFileInfo("f1");

    expect(result.name).toBe("doc.pdf");
  });

  it("throws NotFoundError for non-existent file", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue(null);

    await expect(service.getFileInfo("nonexistent")).rejects.toThrow("Arquivo");
  });

  it("passes access check for file owner", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue({
      id: "f1",
      uploadedById: "u1",
      teams: [{ teamId: "t_other" }],
    });

    await expect(service.checkFileAccess("f1", "u1", "ws-1")).resolves.toBeUndefined();
  });

  it("passes access check for public file (no teams)", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue({
      id: "f1",
      uploadedById: "other",
      teams: [],
    });

    await expect(service.checkFileAccess("f1", "u1", "ws-1")).resolves.toBeUndefined();
  });

  it("passes access check when user is in same team as file", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue({
      id: "f1",
      uploadedById: "other",
      teams: [{ teamId: "t1" }],
    });
    prisma.team.findMany.mockResolvedValue([{ id: "t1" }]);

    await expect(service.checkFileAccess("f1", "u1", "ws-1")).resolves.toBeUndefined();
  });

  it("throws ForbiddenError when user lacks access", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue({
      id: "f1",
      uploadedById: "other",
      teams: [{ teamId: "t_other" }],
    });
    prisma.team.findMany.mockResolvedValue([{ id: "t1" }]);

    await expect(service.checkFileAccess("f1", "u1", "ws-1")).rejects.toThrow("Acesso negado");
  });

  it("sets file teams (clear + add)", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNodeTeam.deleteMany.mockResolvedValue({ count: 2 });
    prisma.fileNodeTeam.createMany.mockResolvedValue({ count: 2 });

    await service.setFileTeams("f1", ["t1", "t2"]);

    expect(prisma.fileNodeTeam.deleteMany).toHaveBeenCalledWith({
      where: { fileNodeId: "f1" },
    });
    expect(prisma.fileNodeTeam.createMany).toHaveBeenCalledWith({
      data: [
        { fileNodeId: "f1", teamId: "t1" },
        { fileNodeId: "f1", teamId: "t2" },
      ],
    });
  });

  it("deletes a file and returns its storage key", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue({
      id: "f1",
      type: "file",
      storageKey: "workspaces/ws-1/file.pdf",
    });
    prisma.fileNode.delete.mockResolvedValue({});

    const keys = await service.deleteFile("f1");

    expect(keys).toEqual(["workspaces/ws-1/file.pdf"]);
  });

  it("deletes a folder recursively and collects all storage keys", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findUnique.mockResolvedValue({
      id: "folder1",
      type: "folder",
      storageKey: null,
    });
    prisma.fileNode.findMany.mockResolvedValue([
      { id: "child1", type: "file", storageKey: "key1" },
    ]);

    // Second call from recursion
    prisma.fileNode.delete.mockResolvedValue({});

    // We need to handle recursion carefully
    prisma.fileNode.findUnique.mockResolvedValueOnce({
      id: "folder1",
      type: "folder",
      storageKey: null,
    })
    .mockResolvedValueOnce({
      id: "child1",
      type: "file",
      storageKey: "key1",
    });

    // For delete calls
    prisma.fileNode.delete.mockResolvedValue({});

    const keys = await service.deleteFile("folder1");

    expect(keys).toContain("key1");
  });

  it("gets file tree (buildTree)", async () => {
    const prisma = createMockPrisma();
    const service = createFileService(prisma);
    prisma.fileNode.findMany.mockResolvedValue([
      { id: "root1", parentId: null, name: "root", type: "folder", teams: [], uploadedBy: null },
      { id: "child1", parentId: "root1", name: "child.txt", type: "file", teams: [], uploadedBy: null },
    ]);

    const tree = await service.getFileTree("ws-1");

    expect(tree).toHaveLength(1);
    expect(tree[0]).toHaveProperty("children");
  });
});
