import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthService } from "../auth.service.js";

function createMockPrisma() {
  const mockFindUnique = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockFindMany = vi.fn();
  const mockTransaction = vi.fn((fn: (tx: any) => any) => {
    const tx = {
      refreshToken: {
        findUnique: mockFindUnique,
        delete: mockDelete,
      },
    };
    return fn(tx);
  });

  return {
    $transaction: mockTransaction,
    user: { findUnique: mockFindUnique, create: mockCreate, update: mockUpdate },
    refreshToken: {
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      create: mockCreate,
      delete: mockDelete,
    },
  } as any;
}

describe("auth service", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let authService: ReturnType<typeof createAuthService>;

  beforeEach(() => {
    prisma = createMockPrisma();
    authService = createAuthService(prisma as any);
  });

  describe("register", () => {
    it("creates a user and returns sanitized profile", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        passwordHash: "$2b$12$hashed",
      });

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(result).toEqual({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      });
      // Password hash should NOT be returned
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("throws ConflictError for duplicate email", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "existing" });

      await expect(
        authService.register({
          email: "duplicate@example.com",
          password: "password123",
          name: "Test",
        })
      ).rejects.toThrow("Email já cadastrado");
    });

    it("generates initials from name", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-2",
        email: "joao@example.com",
        name: "João Silva",
        passwordHash: "$2b$12$hashed",
      });

      await authService.register({
        email: "joao@example.com",
        password: "password123",
        name: "João Silva",
      });

      // Verify the create call included initials and color
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.initials).toBe("JS");
      expect(createCall.data.color).toBeDefined();
    });
  });

  describe("login", () => {
    it("returns user on valid credentials", async () => {
      const hash = await import("bcrypt").then((b) => b.hashSync("correct", 12));
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        passwordHash: hash,
        role: "Membro",
        status: "online",
      });

      const result = await authService.login({
        email: "test@example.com",
        password: "correct",
      });

      expect(result.id).toBe("user-1");
      expect(result.email).toBe("test@example.com");
    });

    it("throws UnauthorizedError for wrong password", async () => {
      const hash = await import("bcrypt").then((b) => b.hashSync("correct", 12));
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        passwordHash: hash,
      });

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrong-password",
        })
      ).rejects.toThrow("Email ou senha inválidos");
    });

    it("throws UnauthorizedError for non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "nonexistent@example.com",
          password: "any",
        })
      ).rejects.toThrow("Email ou senha inválidos");
    });
  });

  describe("refresh token", () => {
    it("rotates refresh token atomically", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        name: "Test",
      };

      prisma.refreshToken.findUnique.mockResolvedValue({
        id: "token-id",
        token: "old-token",
        expiresAt: new Date(Date.now() + 86400000),
        user,
      });

      // Set up $transaction to call the callback
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          refreshToken: {
            findUnique: prisma.refreshToken.findUnique,
            delete: prisma.refreshToken.delete,
          },
        };
        return fn(tx);
      });

      const result = await authService.rotateRefreshToken("old-token");

      expect(result).toEqual(user);
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: "token-id" },
      });
    });

    it("throws on expired token", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: "expired-id",
        token: "expired-token",
        expiresAt: new Date(Date.now() - 86400000),
        user: { id: "user-1" },
      });

      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          refreshToken: {
            findUnique: prisma.refreshToken.findUnique,
            delete: prisma.refreshToken.delete,
          },
        };
        return fn(tx);
      });

      await expect(
        authService.rotateRefreshToken("expired-token")
      ).rejects.toThrow("Refresh token inválido ou expirado");
    });
  });
});
