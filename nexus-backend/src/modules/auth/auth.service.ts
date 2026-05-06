import { v4 as uuid } from "uuid";
import type { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors.js";
import type { RegisterInput, LoginInput, UpdateStatusInput, UpdateProfileInput } from "./auth.schema.js";

export function createAuthService(prisma: PrismaClient) {
  async function register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError("Email já cadastrado");

    const initials = input.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = ["#7c6af7", "#f472b6", "#fbbf24", "#60a5fa", "#34d399", "#f87171", "#f97316"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        initials,
        color,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      initials: user.initials,
      color: user.color,
      role: user.role,
      status: user.status,
    };
  }

  async function login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedError("Email ou senha inválidos");

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Email ou senha inválidos");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      initials: user.initials,
      color: user.color,
      role: user.role,
      status: user.status,
    };
  }

  async function getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Usuário");
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      initials: user.initials,
      color: user.color,
      role: user.role,
      status: user.status,
    };
  }

  async function updateProfile(userId: string, input: UpdateProfileInput) {
    const data: Record<string, string> = {};
    if (input.name) {
      data.name = input.name;
      data.initials = input.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (input.image) data.image = input.image;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      initials: user.initials,
      color: user.color,
      image: user.image,
      role: user.role,
      status: user.status,
    };
  }

  async function updateStatus(userId: string, input: UpdateStatusInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: input.status },
    });
    return {
      id: user.id,
      status: user.status,
    };
  }

  function generateTokens(
    jwtSign: (payload: { sub: string; userId: string; email: string; name: string; jti?: string }) => string,
    jwtSignRefresh: (payload: { sub: string; userId: string; email: string; name: string; jti?: string }) => string,
    user: { id: string; email: string; name: string }
  ) {
    const payload = { sub: user.id, userId: user.id, email: user.email, name: user.name };

    return {
      accessToken: jwtSign({ ...payload, jti: uuid() }),
      refreshToken: jwtSignRefresh({ ...payload, jti: uuid() }),
    };
  }

  async function storeRefreshToken(userId: string, token: string) {
    // 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  async function rotateRefreshToken(oldToken: string) {
    const result = await prisma.$transaction(async (tx) => {
      const stored = await tx.refreshToken.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      if (!stored || stored.expiresAt < new Date()) {
        throw new UnauthorizedError("Refresh token inválido ou expirado");
      }

      // Delete old token atomically
      await tx.refreshToken.delete({ where: { id: stored.id } });

      return stored.user;
    });

    return result;
  }

  return {
    register,
    login,
    getProfile,
    updateProfile,
    updateStatus,
    generateTokens,
    storeRefreshToken,
    rotateRefreshToken,
  };
}
