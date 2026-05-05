import { describe, it, expect, vi } from "vitest";
import { authenticate } from "../authenticate.js";
import { UnauthorizedError } from "../../lib/errors.js";

describe("authenticate middleware", () => {
  it("throws UnauthorizedError when no auth header", async () => {
    const request = {
      headers: {},
      server: { jwtVerify: vi.fn() },
    } as any;
    const reply = {} as any;

    await expect(authenticate(request, reply)).rejects.toThrow(
      "Token não fornecido"
    );
  });

  it("throws UnauthorizedError when auth header is not Bearer", async () => {
    const request = {
      headers: { authorization: "Basic xyz" },
      server: { jwtVerify: vi.fn() },
    } as any;

    await expect(authenticate(request, {})).rejects.toThrow(
      "Token não fornecido"
    );
  });

  it("throws UnauthorizedError when token is invalid", async () => {
    const request = {
      headers: { authorization: "Bearer invalid-token" },
      server: { jwtVerify: vi.fn(() => { throw new Error("Invalid"); }) },
    } as any;

    await expect(authenticate(request, {})).rejects.toThrow(
      "Token inválido ou expirado"
    );
  });

  it("sets request.user on valid token", async () => {
    const userPayload = { sub: "user-1", email: "test@example.com", name: "Test" };
    const request = {
      headers: { authorization: "Bearer valid-token" },
      server: { jwtVerify: vi.fn().mockReturnValue(userPayload) },
    } as any;

    await authenticate(request, {} as any);

    expect(request.user).toEqual(userPayload);
  });
});
