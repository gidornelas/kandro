import type { PrismaClient } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "../../lib/errors.js";
import { parsePagination, paginate } from "../../lib/pagination.js";
import type { CreateMessageInput, UpdateMessageInput } from "./messages.schema.js";

export function createMessageService(prisma: PrismaClient) {
  async function listByChannel(
    channelId: string,
    query: { cursor?: string; limit?: string }
  ) {
    const { cursor, limit } = parsePagination(query);

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
        reactions: {
          include: {
            user: { select: { id: true } },
          },
        },
        attachment: true,
        taskCard: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
    });

    const result = paginate(messages, limit);
    return result;
  }

  async function create(
    channelId: string,
    input: CreateMessageInput,
    userId: string
  ) {
    const message = await prisma.message.create({
      data: {
        channelId,
        userId,
        text: input.text,
        ...(input.attachment
          ? { attachment: { create: input.attachment } }
          : {}),
        ...(input.taskCard
          ? { taskCard: { create: input.taskCard } }
          : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
        reactions: {
          include: {
            user: { select: { id: true } },
          },
        },
        attachment: true,
        taskCard: true,
      },
    });

    return message;
  }

  async function update(
    messageId: string,
    input: UpdateMessageInput,
    userId: string
  ) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundError("Mensagem");
    if (message.userId !== userId) {
      throw new ForbiddenError("Você só pode editar suas próprias mensagens");
    }

    return prisma.message.update({
      where: { id: messageId },
      data: { text: input.text },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
        reactions: {
          include: {
            user: { select: { id: true } },
          },
        },
        attachment: true,
        taskCard: true,
      },
    });
  }

  async function remove(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundError("Mensagem");
    if (message.userId !== userId) {
      throw new ForbiddenError("Você só pode deletar suas próprias mensagens");
    }

    await prisma.message.delete({ where: { id: messageId } });
  }

  async function toggleReaction(
    messageId: string,
    emoji: string,
    userId: string
  ) {
    const existing = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({
        data: { messageId, userId, emoji },
      });
    }

    // Return updated reactions for the message
    const reactions = await prisma.reaction.findMany({
      where: { messageId },
      include: { user: { select: { id: true } } },
    });

    return reactions;
  }

  return { listByChannel, create, update, remove, toggleReaction };
}
