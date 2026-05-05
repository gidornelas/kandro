import { describe, it, expect, vi } from "vitest";
import { createBoardService } from "../boards.service.js";

function createMockPrisma() {
  return {
    kanbanColumn: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    kanbanCard: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    cardLabel: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    cardAssignee: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    subtask: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    cardComment: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    activity: {
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: any) => any) => {
      const tx = {
        kanbanCard: {
          updateMany: vi.fn(),
          count: vi.fn(),
          update: vi.fn(),
        },
      };
      return fn(tx);
    }),
  } as any;
}

describe("boards service — columns", () => {
  it("lists columns ordered by position with card count", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    const mockColumns = [
      { id: "col1", name: "Backlog", position: 0, _count: { cards: 3 } },
      { id: "col2", name: "Em Progresso", position: 1, _count: { cards: 5 } },
    ];
    prisma.kanbanColumn.findMany.mockResolvedValue(mockColumns);

    const result = await service.listColumns("ch-1");

    expect(prisma.kanbanColumn.findMany).toHaveBeenCalledWith({
      where: { channelId: "ch-1" },
      orderBy: { position: "asc" },
      include: { _count: { select: { cards: true } } },
    });
    expect(result).toEqual(mockColumns);
  });

  it("creates a column with next position", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanColumn.findUnique.mockResolvedValue(null);
    prisma.kanbanColumn.findFirst.mockResolvedValue({ position: 2 });
    prisma.kanbanColumn.create.mockResolvedValue({
      id: "col-new",
      channelId: "ch-1",
      name: "Testes",
      color: "#9899b0",
      position: 3,
    });

    const result = await service.createColumn("ch-1", { name: "Testes" }, "ws-1", "u1");

    expect(result.name).toBe("Testes");
    expect(result.position).toBe(3);
    expect(prisma.activity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId: "ws-1",
          userId: "u1",
          action: "criou coluna",
        }),
      })
    );
  });

  it("throws ConflictError when creating duplicate column name", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanColumn.findUnique.mockResolvedValue({ id: "existing" });

    await expect(
      service.createColumn("ch-1", { name: "Duplicate" }, "ws-1", "u1")
    ).rejects.toThrow("Já existe uma coluna com este nome");
  });

  it("updates a column", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanColumn.update.mockResolvedValue({
      id: "col1",
      name: "Updated",
      color: "#ff0000",
    });

    const result = await service.updateColumn("col1", { name: "Updated", color: "#ff0000" });

    expect(result.name).toBe("Updated");
    expect(prisma.kanbanColumn.update).toHaveBeenCalledWith({
      where: { id: "col1" },
      data: { name: "Updated", color: "#ff0000" },
    });
  });

  it("throws ConflictError when deleting column with cards", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanCard.count.mockResolvedValue(5);

    await expect(service.deleteColumn("col1")).rejects.toThrow(
      "Não é possível deletar uma coluna com cards"
    );
  });

  it("deletes an empty column", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanCard.count.mockResolvedValue(0);
    prisma.kanbanColumn.delete.mockResolvedValue({});

    await service.deleteColumn("col1");

    expect(prisma.kanbanColumn.delete).toHaveBeenCalledWith({ where: { id: "col1" } });
  });
});

describe("boards service — cards", () => {
  it("lists cards with progress and counts", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    const mockColumns = [
      {
        id: "col1",
        channelId: "ch-1",
        name: "Backlog",
        color: "#9899b0",
        position: 0,
        cards: [
          {
            id: "card1",
            columnId: "col1",
            title: "Task 1",
            position: 0,
            labels: [],
            assignees: [],
            _count: { subtasks: 2, comments: 1 },
            cardThreadMessages: [{ id: "tm1" }, { id: "tm2" }],
            subtasks: [{ done: true }, { done: false }],
          },
        ],
      },
    ];
    prisma.kanbanColumn.findMany.mockResolvedValue(mockColumns);

    const result = await service.listCards("ch-1");

    expect(result[0].cards[0].progress).toBe(50);
    expect(result[0].cards[0].subtaskCount).toBe(2);
    expect(result[0].cards[0].commentCount).toBe(1);
    expect(result[0].cards[0].threadCount).toBe(2);
  });

  it("gets a card with progress calculation", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    const mockCard = {
      id: "card1",
      title: "Test Card",
      column: { id: "col1", name: "Backlog", color: "#9899b0" },
      labels: [],
      assignees: [],
      subtasks: [
        { id: "s1", text: "Sub 1", done: true, position: 0 },
        { id: "s2", text: "Sub 2", done: false, position: 1 },
      ],
      comments: [],
    };
    prisma.kanbanCard.findUnique.mockResolvedValue(mockCard);

    const result = await service.getCard("card1");

    expect(result.progress).toBe(50);
    expect(result.column.name).toBe("Backlog");
  });

  it("throws NotFoundError for non-existent card", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanCard.findUnique.mockResolvedValue(null);

    await expect(service.getCard("nonexistent")).rejects.toThrow("Card");
  });

  it("creates a card with labels and assignees", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanColumn.findUnique.mockResolvedValue({ id: "col1", name: "Backlog" });
    prisma.kanbanCard.findFirst.mockResolvedValue({ position: 5 });
    prisma.kanbanCard.create.mockResolvedValue({
      id: "card-new",
      columnId: "col1",
      title: "New Card",
      labels: [{ name: "bug", color: "#ff0000" }],
      assignees: [{ user: { id: "u1", name: "User 1" } }],
    });

    const result = await service.createCard(
      "col1",
      { title: "New Card", labels: [{ name: "bug", color: "#ff0000" }], assignees: ["u1"] },
      "ws-1",
      "u1"
    );

    expect(result.title).toBe("New Card");
    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it("updates a card", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanCard.findUnique.mockResolvedValue({ id: "card1", column: {} });
    prisma.kanbanCard.update.mockResolvedValue({
      id: "card1",
      title: "Updated Title",
      column: {},
      labels: [],
      assignees: [],
    });

    const result = await service.updateCard("card1", { title: "Updated Title" }, "ws-1", "u1");

    expect(result.title).toBe("Updated Title");
  });

  it("moves a card between columns using transaction", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanCard.findUnique
      .mockResolvedValueOnce({ id: "card1", columnId: "col1", position: 0, title: "Card", column: { name: "Backlog" }, progress: 0 })
      .mockResolvedValueOnce({
        id: "card1",
        columnId: "col2",
        position: 3,
        title: "Card",
        progress: 100,
        column: { id: "col2", name: "Concluído", color: "#00ff00" },
        labels: [],
        assignees: [],
        subtasks: [],
        comments: [],
        _count: { subtasks: 0, comments: 0 },
        cardThreadMessages: [],
      });
    prisma.kanbanColumn.findUnique.mockResolvedValue({ id: "col2", name: "Concluído", color: "#00ff00" });

    const mockTx = {
      kanbanCard: {
        updateMany: vi.fn(),
        count: vi.fn().mockResolvedValue(3),
        update: vi.fn(),
      },
    };
    prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

    await service.moveCard("card1", { toColumnId: "col2" }, "ws-1", "u1");

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it("deletes a card", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.kanbanCard.delete.mockResolvedValue({});

    await service.deleteCard("card1");

    expect(prisma.kanbanCard.delete).toHaveBeenCalledWith({ where: { id: "card1" } });
  });
});

describe("boards service — labels & assignees", () => {
  it("adds a label", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardLabel.create.mockResolvedValue({
      id: "l1",
      cardId: "card1",
      name: "bug",
      color: "#ff0000",
    });

    const result = await service.addLabel("card1", "bug", "#ff0000");

    expect(result.name).toBe("bug");
  });

  it("removes a label", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardLabel.delete.mockResolvedValue({});

    await service.removeLabel("l1");

    expect(prisma.cardLabel.delete).toHaveBeenCalledWith({ where: { id: "l1" } });
  });

  it("adds an assignee", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardAssignee.create.mockResolvedValue({
      id: "a1",
      cardId: "card1",
      userId: "u1",
      user: { id: "u1", name: "User", initials: "U", color: "#000" },
    });

    const result = await service.addAssignee("card1", "u1");

    expect(result.userId).toBe("u1");
  });

  it("removes an assignee", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardAssignee.findUnique.mockResolvedValue({ id: "a1", cardId: "card1", userId: "u1" });
    prisma.cardAssignee.delete.mockResolvedValue({});

    await service.removeAssignee("card1", "u1");

    expect(prisma.cardAssignee.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });

  it("handles removing non-existent assignee gracefully", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardAssignee.findUnique.mockResolvedValue(null);

    await service.removeAssignee("card1", "nonexistent");

    expect(prisma.cardAssignee.delete).not.toHaveBeenCalled();
  });
});

describe("boards service — subtasks", () => {
  it("lists subtasks ordered by position", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.subtask.findMany.mockResolvedValue([
      { id: "s1", text: "Sub 1", done: false, position: 0 },
    ]);

    const result = await service.listSubtasks("card1");

    expect(result).toHaveLength(1);
  });

  it("creates a subtask", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.subtask.findFirst.mockResolvedValue({ position: 2 });
    prisma.subtask.create.mockResolvedValue({
      id: "s-new",
      cardId: "card1",
      text: "New subtask",
      done: false,
      position: 3,
    });

    const result = await service.createSubtask("card1", { text: "New subtask" }, "ws-1", "u1");

    expect(result.text).toBe("New subtask");
    expect(result.position).toBe(3);
  });

  it("updates a subtask", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.subtask.update.mockResolvedValue({
      id: "s1",
      text: "Updated",
      done: true,
    });

    const result = await service.updateSubtask("s1", { done: true });

    expect(result.done).toBe(true);
  });

  it("deletes a subtask", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.subtask.delete.mockResolvedValue({});

    await service.deleteSubtask("s1");

    expect(prisma.subtask.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
  });
});

describe("boards service — comments", () => {
  it("lists comments with user info in desc order", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardComment.findMany.mockResolvedValue([
      { id: "c1", text: "Comment", user: { id: "u1", name: "User" } },
    ]);

    const result = await service.listComments("card1");

    expect(prisma.cardComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cardId: "card1" },
        orderBy: { createdAt: "desc" },
      })
    );
    expect(result).toHaveLength(1);
  });

  it("creates a comment", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardComment.create.mockResolvedValue({
      id: "c-new",
      cardId: "card1",
      userId: "u1",
      text: "Nice work",
      user: { id: "u1", name: "User", initials: "U", color: "#000" },
    });

    const result = await service.createComment("card1", { text: "Nice work" }, "ws-1", "u1");

    expect(result.text).toBe("Nice work");
    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it("deletes a comment", async () => {
    const prisma = createMockPrisma();
    const service = createBoardService(prisma);
    prisma.cardComment.delete.mockResolvedValue({});

    await service.deleteComment("c1");

    expect(prisma.cardComment.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
