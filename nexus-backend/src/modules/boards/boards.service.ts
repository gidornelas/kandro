import type { PrismaClient } from "@prisma/client";
import { NotFoundError, ConflictError } from "../../lib/errors.js";
import type {
  CreateColumnInput,
  CreateCardInput,
  MoveCardInput,
  CreateSubtaskInput,
  CreateCommentInput,
} from "./boards.schema.js";

export function createBoardService(prisma: PrismaClient) {
  // ─── Columns ────────────────────────────────────────────

  async function listColumns(channelId: string) {
    return prisma.kanbanColumn.findMany({
      where: { channelId },
      orderBy: { position: "asc" },
      include: {
        _count: { select: { cards: true } },
      },
    });
  }

  async function createColumn(
    channelId: string,
    input: CreateColumnInput,
    workspaceId: string,
    userId: string
  ) {
    const existing = await prisma.kanbanColumn.findUnique({
      where: { channelId_name: { channelId, name: input.name } },
    });
    if (existing) throw new ConflictError("Já existe uma coluna com este nome");

    const maxPos = await prisma.kanbanColumn.findFirst({
      where: { channelId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const column = await prisma.kanbanColumn.create({
      data: {
        channelId,
        name: input.name,
        color: input.color || "#9899b0",
        position: input.position ?? (maxPos?.position ?? -1) + 1,
      },
    });

    await prisma.activity.create({
      data: {
        workspaceId,
        userId,
        action: "criou coluna",
        targetId: column.id,
        targetType: "board",
        targetName: column.name,
      },
    });

    return column;
  }

  async function updateColumn(columnId: string, input: Partial<CreateColumnInput>) {
    return prisma.kanbanColumn.update({
      where: { id: columnId },
      data: input,
    });
  }

  async function deleteColumn(columnId: string) {
    const cardCount = await prisma.kanbanCard.count({
      where: { columnId },
    });
    if (cardCount > 0) {
      throw new ConflictError(
        "Não é possível deletar uma coluna com cards. Mova-os primeiro."
      );
    }
    await prisma.kanbanColumn.delete({ where: { id: columnId } });
  }

  // ─── Cards ──────────────────────────────────────────────

  async function listCards(channelId: string) {
    const columns = await prisma.kanbanColumn.findMany({
      where: { channelId },
      orderBy: { position: "asc" },
      include: {
        cards: {
          orderBy: { position: "asc" },
          include: {
            labels: true,
            assignees: {
              include: {
                user: {
                  select: { id: true, name: true, initials: true, color: true },
                },
              },
            },
            _count: {
              select: { subtasks: true, comments: true },
            },
            cardThreadMessages: { select: { id: true } },
          },
        },
      },
    });

    return columns.map((col) => ({
      ...col,
      cards: col.cards.map((card) => ({
        ...card,
        progress: calculateProgress(card),
        subtaskCount: card._count.subtasks,
        commentCount: card._count.comments,
        threadCount: card.cardThreadMessages.length,
      })),
    }));
  }

  async function getCard(cardId: string) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: {
        column: { select: { id: true, name: true, color: true } },
        labels: true,
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                initials: true,
                color: true,
              },
            },
          },
        },
        subtasks: { orderBy: { position: "asc" } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
      },
    });
    if (!card) throw new NotFoundError("Card");

    return {
      ...card,
      progress: card.subtasks.length > 0
        ? Math.round(
            (card.subtasks.filter((s) => s.done).length / card.subtasks.length) *
              100
          )
        : 0,
    };
  }

  async function createCard(
    columnId: string,
    input: CreateCardInput,
    workspaceId: string,
    userId: string
  ) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundError("Coluna");

    // Get max position for ordering
    const maxCard = await prisma.kanbanCard.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const card = await prisma.kanbanCard.create({
      data: {
        columnId,
        title: input.title,
        description: input.description,
        priority: input.priority || "Média",
        priorityColor: input.priorityColor || "#fbbf24",
        due: input.due,
        position: (maxCard?.position ?? 0) + 1,
        ...(input.labels
          ? { labels: { create: input.labels } }
          : {}),
        ...(input.assignees
          ? {
              assignees: {
                create: input.assignees.map((uid) => ({ userId: uid })),
              },
            }
          : {}),
      },
      include: {
        labels: true,
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
      },
    });

    await prisma.activity.create({
      data: {
        workspaceId,
        userId,
        action: "criou",
        targetId: card.id,
        targetType: "card",
        targetName: card.title,
        targetColor: column.color,
      },
    });

    return card;
  }

  async function updateCard(
    cardId: string,
    input: Record<string, unknown>,
    workspaceId: string,
    userId: string
  ) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundError("Card");

    const updated = await prisma.kanbanCard.update({
      where: { id: cardId },
      data: input,
      include: {
        column: { select: { id: true, name: true, color: true } },
        labels: true,
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
      },
    });

    return updated;
  }

  async function moveCard(
    cardId: string,
    input: MoveCardInput,
    workspaceId: string,
    userId: string
  ) {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundError("Card");

    const targetColumn = await prisma.kanbanColumn.findUnique({
      where: { id: input.toColumnId },
    });
    if (!targetColumn) throw new NotFoundError("Coluna de destino");

    // Transaction: reorder source and destination columns
    await prisma.$transaction(async (tx) => {
      // Shift cards in source column to fill gap
      await tx.kanbanCard.updateMany({
        where: {
          columnId: card.columnId,
          position: { gt: card.position },
        },
        data: { position: { decrement: 1 } },
      });

      // Calculate new position
      const targetCount = await tx.kanbanCard.count({
        where: { columnId: input.toColumnId },
      });
      const newPosition = input.position ?? targetCount;

      // Shift cards in target column to make room
      await tx.kanbanCard.updateMany({
        where: {
          columnId: input.toColumnId,
          position: { gte: newPosition },
        },
        data: { position: { increment: 1 } },
      });

      // Move the card
      await tx.kanbanCard.update({
        where: { id: cardId },
        data: {
          columnId: input.toColumnId,
          position: newPosition,
          progress:
            targetColumn.name === "Concluído" ||
            targetColumn.name === "Done"
              ? 100
              : card.progress,
        },
      });
    });

    await prisma.activity.create({
      data: {
        workspaceId,
        userId,
        action: "moveu",
        targetId: card.id,
        targetType: "card",
        targetName: card.title,
        targetColor: targetColumn.color,
      },
    });

    return getCard(cardId);
  }

  async function deleteCard(cardId: string) {
    await prisma.kanbanCard.delete({ where: { id: cardId } });
  }

  // ─── Labels ─────────────────────────────────────────────

  async function addLabel(cardId: string, name: string, color: string) {
    return prisma.cardLabel.create({
      data: { cardId, name, color },
    });
  }

  async function removeLabel(labelId: string) {
    await prisma.cardLabel.delete({ where: { id: labelId } });
  }

  // ─── Assignees ──────────────────────────────────────────

  async function addAssignee(cardId: string, userId: string) {
    return prisma.cardAssignee.create({
      data: { cardId, userId },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });
  }

  async function removeAssignee(cardId: string, userId: string) {
    const assignee = await prisma.cardAssignee.findUnique({
      where: { cardId_userId: { cardId, userId } },
    });
    if (assignee) {
      await prisma.cardAssignee.delete({ where: { id: assignee.id } });
    }
  }

  // ─── Subtasks ──────────────────────────────────────────

  async function listSubtasks(cardId: string) {
    return prisma.subtask.findMany({
      where: { cardId },
      orderBy: { position: "asc" },
    });
  }

  async function createSubtask(
    cardId: string,
    input: CreateSubtaskInput,
    workspaceId: string,
    userId: string
  ) {
    const maxPos = await prisma.subtask.findFirst({
      where: { cardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const subtask = await prisma.subtask.create({
      data: {
        cardId,
        text: input.text,
        position: (maxPos?.position ?? -1) + 1,
      },
    });

    return subtask;
  }

  async function updateSubtask(subtaskId: string, input: Record<string, unknown>) {
    return prisma.subtask.update({
      where: { id: subtaskId },
      data: input,
    });
  }

  async function deleteSubtask(subtaskId: string) {
    await prisma.subtask.delete({ where: { id: subtaskId } });
  }

  // ─── Comments ───────────────────────────────────────────

  async function listComments(cardId: string) {
    return prisma.cardComment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });
  }

  async function createComment(
    cardId: string,
    input: CreateCommentInput,
    workspaceId: string,
    userId: string
  ) {
    const comment = await prisma.cardComment.create({
      data: { cardId, userId, text: input.text },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
    });

    await prisma.activity.create({
      data: {
        workspaceId,
        userId,
        action: "comentou em",
        targetId: cardId,
        targetType: "card",
        targetName: `card:${cardId}`,
      },
    });

    return comment;
  }

  async function deleteComment(commentId: string) {
    await prisma.cardComment.delete({ where: { id: commentId } });
  }

  return {
    listColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    listCards,
    getCard,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    addLabel,
    removeLabel,
    addAssignee,
    removeAssignee,
    listSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    listComments,
    createComment,
    deleteComment,
  };
}

function calculateProgress(card: {
  _count: { subtasks: number; comments: number };
  subtasks?: { done: boolean }[];
}): number {
  if (card.subtasks && card.subtasks.length > 0) {
    return Math.round(
      (card.subtasks.filter((s) => s.done).length / card.subtasks.length) * 100
    );
  }
  return 0;
}
