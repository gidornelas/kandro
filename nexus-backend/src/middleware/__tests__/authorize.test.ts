import { describe, it, expect, vi } from "vitest";
import { requireWorkspaceRole, requireChannelAccess } from "../authorize.js";

describe("requireWorkspaceRole middleware", () => {
  it("allows access when user has sufficient role", async () => {
    const middleware = requireWorkspaceRole("member");
    const request = {
      params: { workspaceId: "ws-1" },
      user: { sub: "user-1" },
      server: {
        prisma: {
          workspaceMember: {
            findUnique: vi.fn().mockResolvedValue({
              workspaceId: "ws-1",
              userId: "user-1",
              role: "admin",
            }),
          },
        },
      },
    } as any;

    await expect(middleware(request, {} as any)).resolves.toBeUndefined();
  });

  it("blocks access when user has insufficient role", async () => {
    const middleware = requireWorkspaceRole("admin");
    const request = {
      params: { workspaceId: "ws-1" },
      user: { sub: "user-1" },
      server: {
        prisma: {
          workspaceMember: {
            findUnique: vi.fn().mockResolvedValue({
              workspaceId: "ws-1",
              userId: "user-1",
              role: "member",
            }),
          },
        },
      },
    } as any;

    await expect(middleware(request, {} as any)).rejects.toThrow(
      "Requires role admin"
    );
  });

  it("blocks access when user is not a member", async () => {
    const middleware = requireWorkspaceRole("member");
    const request = {
      params: { workspaceId: "ws-1" },
      user: { sub: "user-1" },
      server: {
        prisma: {
          workspaceMember: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        },
      },
    } as any;

    await expect(middleware(request, {} as any)).rejects.toThrow(
      "Você não é membro deste workspace"
    );
  });

  it("skips check when no workspaceId", async () => {
    const middleware = requireWorkspaceRole("member");
    const request = {
      params: {},
      user: { sub: "user-1" },
      server: { prisma: {} },
    } as any;

    await expect(middleware(request, {} as any)).resolves.toBeUndefined();
  });
});

describe("requireChannelAccess middleware", () => {
  it("allows access to public channel for workspace member", async () => {
    const request = {
      params: { channelId: "ch-1" },
      user: { sub: "user-1" },
      server: {
        prisma: {
          channel: {
            findUnique: vi.fn().mockResolvedValue({
              id: "ch-1",
              workspaceId: "ws-1",
              private: false,
            }),
          },
          workspaceMember: {
            findUnique: vi.fn().mockResolvedValue({
              workspaceId: "ws-1",
              userId: "user-1",
              role: "member",
            }),
          },
        },
      },
    } as any;

    await expect(requireChannelAccess(request, {} as any)).resolves.toBeUndefined();
  });

  it("blocks access when user is not a workspace member", async () => {
    const request = {
      params: { channelId: "ch-1" },
      user: { sub: "user-1" },
      server: {
        prisma: {
          channel: {
            findUnique: vi.fn().mockResolvedValue({
              id: "ch-1",
              workspaceId: "ws-1",
              private: false,
            }),
          },
          workspaceMember: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        },
      },
    } as any;

    await expect(requireChannelAccess(request, {} as any)).rejects.toThrow(
      "Acesso negado a este canal"
    );
  });

  it("skips check when no channelId", async () => {
    const request = {
      params: {},
      user: { sub: "user-1" },
      server: { prisma: {} },
    } as any;

    await expect(requireChannelAccess(request, {} as any)).resolves.toBeUndefined();
  });
});
