import { describe, it, expect, vi } from "vitest";
import { createChannelService } from "../channels.service.js";

function createMockPrisma() {
  return {
    channel: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    activity: {
      create: vi.fn(),
    },
  } as any;
}

describe("channels service", () => {
  it("lists channels by workspace", async () => {
    const prisma = createMockPrisma();
    const service = createChannelService(prisma);
    const mockChannels = [
      { id: "c1", name: "geral", type: "text" },
      { id: "c2", name: "board-dev", type: "board" },
    ];
    prisma.channel.findMany.mockResolvedValue(mockChannels);

    const result = await service.list("ws-1");

    expect(prisma.channel.findMany).toHaveBeenCalledWith({
      where: { workspaceId: "ws-1" },
      orderBy: { createdAt: "asc" },
    });
    expect(result).toEqual(mockChannels);
  });

  it("creates a text channel", async () => {
    const prisma = createMockPrisma();
    const service = createChannelService(prisma);
    const mockChannel = {
      id: "c-new",
      workspaceId: "ws-1",
      name: "novo-canal",
      type: "text",
      icon: "#",
      private: false,
    };
    prisma.channel.findUnique.mockResolvedValue(null);
    prisma.channel.create.mockResolvedValue({
      ...mockChannel,
      kanbanColumns: [],
    });

    const result = await service.create(
      "ws-1",
      { name: "novo-canal", type: "text" },
      "user-1"
    );

    expect(result.name).toBe("novo-canal");
    expect(result.type).toBe("text");
    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it("creates a board channel with default kanban columns", async () => {
    const prisma = createMockPrisma();
    const service = createChannelService(prisma);
    prisma.channel.findUnique.mockResolvedValue(null);
    prisma.channel.create.mockResolvedValue({
      id: "c-board",
      workspaceId: "ws-1",
      name: "sprint",
      type: "board",
      icon: "⊞",
      kanbanColumns: [
        { name: "Backlog" },
        { name: "Em Progresso" },
        { name: "Em Revisão" },
        { name: "Concluído" },
      ],
    });

    const result = await service.create("ws-1", { name: "sprint", type: "board" }, "user-1");

    expect(result.type).toBe("board");
    expect(result.kanbanColumns).toHaveLength(4);
    // Verify the create included kanban column defaults
    const createCall = prisma.channel.create.mock.calls[0][0];
    expect(createCall.data.kanbanColumns.create).toHaveLength(4);
    expect(createCall.data.kanbanColumns.create[0].name).toBe("Backlog");
  });

  it("throws ConflictError for duplicate channel name", async () => {
    const prisma = createMockPrisma();
    const service = createChannelService(prisma);
    prisma.channel.findUnique.mockResolvedValue({ id: "existing" });

    await expect(
      service.create("ws-1", { name: "duplicate", type: "text" }, "user-1")
    ).rejects.toThrow("Já existe um canal com este nome");
  });

  it("throws NotFoundError for non-existent channel", async () => {
    const prisma = createMockPrisma();
    const service = createChannelService(prisma);
    prisma.channel.findUnique.mockResolvedValue(null);

    await expect(service.getById("non-existent")).rejects.toThrow("Canal");
  });
});
