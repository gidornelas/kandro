import type { PrismaClient } from "@prisma/client";
import { parsePagination, paginate } from "../../lib/pagination.js";

export function createActivityService(prisma: PrismaClient) {
  async function list(
    workspaceId: string,
    query: { cursor?: string; limit?: string }
  ) {
    const { cursor, limit } = parsePagination(query);

    const activities = await prisma.activity.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, initials: true, color: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
    });

    const result = paginate(activities, limit);
    return result;
  }

  return { list };
}
