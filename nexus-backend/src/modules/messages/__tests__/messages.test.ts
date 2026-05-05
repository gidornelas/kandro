import { describe, it, expect, vi } from "vitest";
import { createMessageService } from "../messages.service.js";

function createMockPrisma() {
  return {
    message: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reaction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  } as any;
}

describe("messages service", () => {
  it("lists messages with pagination", async () => {
    const prisma = createMockPrisma();
    const service = createMessageService(prisma);
    const mockMessages = [
      { id: "m1", text: "Hello", channelId: "ch-1", userId: "u1", user: { id: "u1", name: "User" }, reactions: [], attachment: null, taskCard: null },
      { id: "m2", text: "World", channelId: "ch-1", userId: "u2", user: { id: "u2", name: "User2" }, reactions: [], attachment: null, taskCard: null },
    ];
    prisma.message.findMany.mockResolvedValue(mockMessages);

    const result = await service.listByChannel("ch-1", { limit: "50" });

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { channelId: "ch-1" },
        orderBy: { createdAt: "desc" },
      })
    );
    expect(result.data).toHaveLength(2);
  });

  it("creates a message", async () => {
    const prisma = createMockPrisma();
    const service = createMessageService(prisma);
    const mockMessage = {
      id: "m-new",
      channelId: "ch-1",
      userId: "u1",
      text: "Hello World",
      user: { id: "u1", name: "Test", initials: "T", color: "#000" },
      reactions: [],
      attachment: null,
      taskCard: null,
    };
    prisma.message.create.mockResolvedValue(mockMessage);

    const result = await service.create("ch-1", { text: "Hello World" }, "u1");

    expect(result.text).toBe("Hello World");
    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          channelId: "ch-1",
          userId: "u1",
          text: "Hello World",
        }),
      })
    );
  });

  it("creates a message with attachment", async () => {
    const prisma = createMockPrisma();
    const service = createMessageService(prisma);
    prisma.message.create.mockResolvedValue({
      id: "m-attach",
      channelId: "ch-1",
      userId: "u1",
      text: "With file",
      user: { id: "u1", name: "Test", initials: "T", color: "#000" },
      reactions: [],
      attachment: { name: "test.pdf", size: 1024000, icon: "📄", encrypted: false },
      taskCard: null,
    });

    const result = await service.create("ch-1", {
      text: "With file",
      attachment: { name: "test.pdf", size: 1024000, icon: "📄", encrypted: false },
    }, "u1");

    expect(result.attachment).toBeDefined();
    expect(result.attachment!.size).toBe(1024000);
  });

  it("only allows message owner to edit", async () => {
    const prisma = createMockPrisma();
    const service = createMessageService(prisma);
    prisma.message.findUnique.mockResolvedValue({
      id: "m1",
      userId: "u1",
      text: "Original",
    });

    await expect(
      service.update("m1", { text: "Hacked" }, "u2")
    ).rejects.toThrow("Você só pode editar suas próprias mensagens");
  });

  it("toggles a reaction (add then remove)", async () => {
    const prisma = createMockPrisma();
    const service = createMessageService(prisma);

    // First call: reaction doesn't exist → create
    prisma.reaction.findUnique.mockResolvedValue(null);
    prisma.reaction.create.mockResolvedValue({ id: "r1", messageId: "m1", userId: "u1", emoji: "👍" });
    prisma.reaction.findMany.mockResolvedValue([
      { id: "r1", messageId: "m1", userId: "u1", emoji: "👍", user: { id: "u1" } },
    ]);

    const result = await service.toggleReaction("m1", "👍", "u1");
    expect(result).toHaveLength(1);
    expect(prisma.reaction.create).toHaveBeenCalled();

    // Second call: reaction exists → delete it
    prisma.reaction.findUnique.mockResolvedValue({ id: "r1", messageId: "m1", userId: "u1", emoji: "👍" });
    prisma.reaction.findMany.mockResolvedValue([]);

    const result2 = await service.toggleReaction("m1", "👍", "u1");
    expect(result2).toHaveLength(0);
    expect(prisma.reaction.delete).toHaveBeenCalled();
  });
});
