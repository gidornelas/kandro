import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../lib/errors.js";

export function createVoiceService(prisma: PrismaClient) {
  async function joinChannel(channelId: string, userId: string) {
    const participantInclude = {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, initials: true, color: true },
          },
        },
      },
    };

    const session = await prisma.$transaction(async (tx) => {
      const voiceSession = await tx.voiceSession.upsert({
        where: { channelId_active: { channelId, active: true } },
        create: {
          channelId,
          roomName: `channel-${channelId}`,
          startedById: userId,
          participants: {
            create: { userId },
          },
        },
        update: {},
        include: participantInclude,
      });

      if (!voiceSession.participants.some((p) => p.userId === userId)) {
        await tx.voiceParticipant.create({
          data: { sessionId: voiceSession.id, userId },
        });

        return tx.voiceSession.findUniqueOrThrow({
          where: { id: voiceSession.id },
          include: participantInclude,
        });
      }

      return voiceSession;
    }, { isolationLevel: "Serializable" });

    return {
      sessionId: session.id,
      roomName: session.roomName,
      participants: session.participants.map((p) => ({
        userId: p.userId,
        name: p.user.name,
        initials: p.user.initials,
        color: p.user.color,
        muted: p.muted,
        cameraOn: p.cameraOn,
        sharing: p.sharing,
      })),
    };
  }

  async function leaveChannel(channelId: string, userId: string) {
    const session = await prisma.voiceSession.findFirst({
      where: { channelId, active: true },
    });
    if (!session) return;

    await prisma.voiceParticipant.deleteMany({
      where: { sessionId: session.id, userId },
    });

    // Check remaining participants
    const remaining = await prisma.voiceParticipant.count({
      where: { sessionId: session.id },
    });

    if (remaining === 0) {
      await prisma.voiceSession.update({
        where: { id: session.id },
        data: { active: false, endedAt: new Date() },
      });
    }
  }

  async function updateParticipant(
    channelId: string,
    userId: string,
    input: { muted?: boolean; cameraOn?: boolean; sharing?: boolean }
  ) {
    const session = await prisma.voiceSession.findFirst({
      where: { channelId, active: true },
    });
    if (!session) throw new NotFoundError("Sessão de voz ativa");

    const participant = await prisma.voiceParticipant.findUnique({
      where: { sessionId_userId: { sessionId: session.id, userId } },
    });
    if (!participant) throw new NotFoundError("Participante");

    await prisma.voiceParticipant.update({
      where: { id: participant.id },
      data: input,
    });

    return { userId, ...input };
  }

  async function getSession(channelId: string) {
    const session = await prisma.voiceSession.findFirst({
      where: { channelId, active: true },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, color: true },
            },
          },
        },
      },
    });

    if (!session) return null;

    return {
      sessionId: session.id,
      roomName: session.roomName,
      active: session.active,
      startedBy: session.startedById,
      participants: session.participants.map((p) => ({
        userId: p.userId,
        name: p.user.name,
        initials: p.user.initials,
        color: p.user.color,
        muted: p.muted,
        cameraOn: p.cameraOn,
        sharing: p.sharing,
        joinedAt: p.joinedAt,
      })),
    };
  }

  async function endSessionByRoom(roomName: string) {
    await prisma.voiceSession.updateMany({
      where: { roomName, active: true },
      data: { active: false, endedAt: new Date() },
    });
  }

  async function removeParticipantByRoom(roomName: string, userId: string) {
    const session = await prisma.voiceSession.findFirst({
      where: { roomName, active: true },
    });
    if (!session) return;

    await prisma.voiceParticipant.deleteMany({
      where: { sessionId: session.id, userId },
    });
  }

  return {
    joinChannel,
    leaveChannel,
    updateParticipant,
    getSession,
    endSessionByRoom,
    removeParticipantByRoom,
  };
}
