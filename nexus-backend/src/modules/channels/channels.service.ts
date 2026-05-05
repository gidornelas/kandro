import type { PrismaClient } from "@prisma/client";
import { NotFoundError, ConflictError, ForbiddenError } from "../../lib/errors.js";
import type { CreateChannelInput, UpdateChannelInput } from "./channels.schema.js";

const DEFAULT_BOARD_COLUMNS = [
  { name: "Backlog", color: "#9899b0", position: 0 },
  { name: "Em Progresso", color: "#60a5fa", position: 1 },
  { name: "Em Revisão", color: "#fbbf24", position: 2 },
  { name: "Concluído", color: "#4ade80", position: 3 },
];

export function createChannelService(prisma: PrismaClient) {
  async function list(workspaceId: string) {
    return prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
  }

  async function getById(channelId: string) {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        kanbanColumns: { orderBy: { position: "asc" } },
        _count: { select: { messages: true } },
      },
    });
    if (!channel) throw new NotFoundError("Canal");
    return channel;
  }

  async function create(workspaceId: string, input: CreateChannelInput, userId: string) {
    const existing = await prisma.channel.findUnique({
      where: { workspaceId_name: { workspaceId, name: input.name } },
    });
    if (existing) throw new ConflictError("Já existe um canal com este nome");

    const channel = await prisma.channel.create({
      data: {
        workspaceId,
        name: input.name,
        type: input.type,
        icon: input.type === "text" ? "#" : input.type === "board" ? "⊞" : "🔊",
        description: input.description,
        private: input.private,
        // Auto-create kanban columns for board channels
        ...(input.type === "board"
          ? {
              kanbanColumns: {
                create: DEFAULT_BOARD_COLUMNS,
              },
            }
          : {}),
      },
      include: {
        kanbanColumns: { orderBy: { position: "asc" } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId,
        userId,
        action: "criou",
        targetId: channel.id,
        targetType: "channel",
        targetName: channel.name,
      },
    });

    return channel;
  }

  async function update(channelId: string, input: UpdateChannelInput) {
    const channel = await prisma.channel.update({
      where: { id: channelId },
      data: input,
    });
    return channel;
  }

  async function remove(channelId: string) {
    await prisma.channel.delete({ where: { id: channelId } });
  }

  return { list, getById, create, update, remove };
}
