import { describe, it, expect, vi } from "vitest";
import { createVoiceService } from "../voice.service.js";

function createMockPrisma() {
  const mockFindFirst = vi.fn();
  const mockUpsert = vi.fn();
  const mockCreate = vi.fn();
  const mockFindUniqueOrThrow = vi.fn();
  const mockDeleteMany = vi.fn();
  const mockCount = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateMany = vi.fn();
  const mockFindUnique = vi.fn();

  return {
    voiceSession: {
      findFirst: mockFindFirst,
      upsert: mockUpsert,
      update: mockUpdate,
      updateMany: mockUpdateMany,
    },
    voiceParticipant: {
      create: mockCreate,
      deleteMany: mockDeleteMany,
      count: mockCount,
      update: vi.fn(),
      findUnique: mockFindUnique,
    },
    $transaction: vi.fn((fn: (tx: any) => any) => {
      const tx = {
        voiceSession: {
          upsert: mockUpsert,
          findUniqueOrThrow: mockFindUniqueOrThrow,
        },
        voiceParticipant: {
          create: mockCreate,
        },
      };
      return fn(tx);
    }),
  } as any;
}

describe("voice service", () => {
  it("joins a channel by creating a new session", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);

    prisma.voiceSession.upsert.mockResolvedValue({
      id: "session-new",
      roomName: "channel-ch-1",
      participants: [{ userId: "u1", muted: false, cameraOn: false, sharing: false, user: { id: "u1", name: "User", initials: "U", color: "#000" } }],
    });

    const result = await service.joinChannel("ch-1", "u1");

    expect(result.roomName).toBe("channel-ch-1");
    expect(result.participants).toHaveLength(1);
  });

  it("joins an existing session by adding participant", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);

    // The mock for $transaction callback needs to simulate:
    // - upsert returns session WITHOUT the new participant
    // - findUniqueOrThrow returns session WITH the new participant

    // First $transaction call: upsert returns session without u2
    // We need access to the mockFindUniqueOrThrow from inside
    // Override the entire $transaction mock for this test
    const mockFindUniqueOrThrow = vi.fn().mockResolvedValue({
      id: "session-1",
      roomName: "channel-ch-1",
      participants: [
        { userId: "u1", muted: false, cameraOn: false, sharing: false, user: { id: "u1", name: "User1", initials: "U", color: "#000" } },
        { userId: "u2", muted: false, cameraOn: false, sharing: false, user: { id: "u2", name: "User2", initials: "U2", color: "#fff" } },
      ],
    });

    const mockUpsert = vi.fn().mockResolvedValue({
      id: "session-1",
      roomName: "channel-ch-1",
      participants: [
        { userId: "u1", muted: false, cameraOn: false, sharing: false, user: { id: "u1", name: "User1" } },
      ],
    });

    const mockCreate = vi.fn().mockResolvedValue({});

    prisma.$transaction.mockImplementation((fn: (tx: any) => any) => {
      const tx = {
        voiceSession: {
          upsert: mockUpsert,
          findUniqueOrThrow: mockFindUniqueOrThrow,
        },
        voiceParticipant: {
          create: mockCreate,
        },
      };
      return fn(tx);
    });

    prisma.voiceParticipant.create.mockResolvedValue({});

    const result = await service.joinChannel("ch-1", "u2");

    expect(result.participants).toHaveLength(2);
    expect(mockCreate).toHaveBeenCalled(); // ensures the new participant was created
  });

  it("leaves a channel and ends session if no participants remain", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);

    prisma.voiceSession.findFirst.mockResolvedValue({ id: "session-1" });
    prisma.voiceParticipant.deleteMany.mockResolvedValue({ count: 1 });
    prisma.voiceParticipant.count.mockResolvedValue(0);
    prisma.voiceSession.update.mockResolvedValue({});

    await service.leaveChannel("ch-1", "u1");

    expect(prisma.voiceParticipant.deleteMany).toHaveBeenCalled();
    expect(prisma.voiceSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "session-1" },
        data: expect.objectContaining({ active: false }),
      })
    );
  });

  it("updates participant status", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);

    prisma.voiceSession.findFirst.mockResolvedValue({ id: "session-1" });
    prisma.voiceParticipant.findUnique.mockResolvedValue({ id: "p1", sessionId: "session-1", userId: "u1" });
    prisma.voiceParticipant.update.mockResolvedValue({});

    const result = await service.updateParticipant("ch-1", "u1", { muted: true });

    expect(result.muted).toBe(true);
  });

  it("returns null for non-existent session", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);

    prisma.voiceSession.findFirst.mockResolvedValue(null);

    const result = await service.getSession("ch-1");

    expect(result).toBeNull();
  });

  it("gets active session with participants", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);

    prisma.voiceSession.findFirst.mockResolvedValue({
      id: "session-1",
      roomName: "channel-ch-1",
      active: true,
      startedById: "u1",
      participants: [
        { userId: "u1", muted: false, cameraOn: false, sharing: false, joinedAt: new Date(), user: { id: "u1", name: "User" } },
      ],
    });

    const result = await service.getSession("ch-1");

    expect(result).not.toBeNull();
    expect(result!.sessionId).toBe("session-1");
    expect(result!.participants).toHaveLength(1);
  });

  it("ends session by room name", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);
    prisma.voiceSession.updateMany.mockResolvedValue({ count: 1 });

    await service.endSessionByRoom("channel-ch-1");

    expect(prisma.voiceSession.updateMany).toHaveBeenCalledWith({
      where: { roomName: "channel-ch-1", active: true },
      data: { active: false, endedAt: expect.any(Date) },
    });
  });

  it("removes participant by room name", async () => {
    const prisma = createMockPrisma();
    const service = createVoiceService(prisma);
    prisma.voiceSession.findFirst.mockResolvedValue({ id: "session-1" });
    prisma.voiceParticipant.deleteMany.mockResolvedValue({ count: 1 });

    await service.removeParticipantByRoom("channel-ch-1", "u1");

    expect(prisma.voiceParticipant.deleteMany).toHaveBeenCalledWith({
      where: { sessionId: "session-1", userId: "u1" },
    });
  });
});
