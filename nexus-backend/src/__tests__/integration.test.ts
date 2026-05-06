/**
 * NEXUS Backend Integration Tests
 *
 * Uses in-memory mocks for Prisma and Redis so no external services
 * need to be running. The auth and message CRUD flows are tested via
 * fastify.inject() against a mock database layer.
 */

import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";

// Mock the Prisma plugin to use an in-memory store instead of PostgreSQL.
// The async factory runs when the module is first imported by app.js.
vi.mock("../plugins/prisma.js", async () => {
  const { createInMemoryPrisma } = await import("./helpers/prisma-mock.js");
  const fp = (await import("fastify-plugin")).default;
  return {
    default: fp(async (fastify: Record<string, unknown>) => {
      (fastify as any).decorate("prisma", createInMemoryPrisma());
    }),
  };
});

let app: FastifyInstance;

const testUser = {
  email: `integration-test-${Date.now()}@nexus.test`,
  password: "TestPassword123!",
  name: "Integration Test User",
};

let accessToken = "";
let workspaceId = "";
let channelId = "";
let messageId = "";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.REDIS_URL = ""; // Disable Redis — cache plugin falls back to direct factory calls
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://nexus:nexus@localhost:5432/nexus?schema=public";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-that-is-at-least-32-characters-long!!";

  const { buildApp } = await import("../app.js");
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  if (app) {
    try {
      await app.prisma.user.delete({ where: { email: testUser.email } });
    } catch {
      // Ignore cleanup errors
    }
    await app.close();
  }
});

describe("Auth Flow", () => {
  it("completes full auth cycle: register -> login -> me", async () => {
    // Register
    const registerRes = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: testUser,
    });

    expect(registerRes.statusCode).toBe(201);
    const registerBody = registerRes.json();
    expect(registerBody.user).toBeDefined();
    expect(registerBody.user.email).toBe(testUser.email);
    expect(registerBody.user.name).toBe(testUser.name);
    expect(registerBody.accessToken).toBeTruthy();
    expect(registerBody.refreshToken).toBeTruthy();

    accessToken = registerBody.accessToken;

    // Login
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: testUser.email, password: testUser.password },
    });

    expect(loginRes.statusCode).toBe(200);
    accessToken = loginRes.json().accessToken;

    // Me
    const meRes = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(meRes.statusCode).toBe(200);
    const meBody = meRes.json();
    expect(meBody.email).toBe(testUser.email);
    expect(meBody.name).toBe(testUser.name);
  });

  it("GET /api/auth/me rejects unauthenticated requests", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/auth/me",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("Workspace & Channel Flow", () => {
  it("lists workspaces and channels for the user", async () => {
    // List workspaces
    const wsRes = await app.inject({
      method: "GET",
      url: "/api/workspaces",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(wsRes.statusCode).toBe(200);
    const workspaces = wsRes.json();
    expect(Array.isArray(workspaces)).toBe(true);
    if (workspaces.length === 0) return;

    workspaceId = workspaces[0].id;

    // List channels for first workspace
    const chRes = await app.inject({
      method: "GET",
      url: `/api/workspaces/${workspaceId}/channels`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(chRes.statusCode).toBe(200);
    const channels = chRes.json();
    expect(Array.isArray(channels)).toBe(true);

    const textChannel = channels.find((c: { type: string }) => c.type === "text");
    if (textChannel) {
      channelId = textChannel.id;
    }
  });
});

describe("Message CRUD Flow", () => {
  it("creates, reads, updates, reacts to, and deletes a message", async () => {
    if (!channelId) return;

    // CREATE
    const createRes = await app.inject({
      method: "POST",
      url: `/api/channels/${channelId}/messages`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { text: "Integration test message" },
    });

    expect(createRes.statusCode).toBe(201);
    const created = createRes.json();
    expect(created.text).toBe("Integration test message");
    expect(created.id).toBeTruthy();
    messageId = created.id;

    // READ (list)
    const listRes = await app.inject({
      method: "GET",
      url: `/api/channels/${channelId}/messages`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(listRes.statusCode).toBe(200);
    const list = listRes.json();
    expect(list.data).toBeDefined();
    expect(Array.isArray(list.data)).toBe(true);

    // UPDATE
    const updateRes = await app.inject({
      method: "PATCH",
      url: `/api/messages/${messageId}`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { text: "Updated integration test message" },
    });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.json().text).toBe("Updated integration test message");

    // REACTION
    const reactRes = await app.inject({
      method: "POST",
      url: `/api/messages/${messageId}/reactions`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { emoji: "👍" },
    });

    expect(reactRes.statusCode).toBe(200);
    const reactBody = reactRes.json();
    expect(reactBody.reactions).toBeDefined();
    expect(Array.isArray(reactBody.reactions)).toBe(true);

    // DELETE
    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/api/messages/${messageId}`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(deleteRes.statusCode).toBe(204);
  });

  it("rejects editing other user's message", async () => {
    if (!channelId) return;

    // Create a message as testUser
    const createRes = await app.inject({
      method: "POST",
      url: `/api/channels/${channelId}/messages`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { text: "Message to test forbidden edit" },
    });
    const targetMessageId = createRes.json().id;

    // Register a different user
    const otherEmail = `other-${Date.now()}@nexus.test`;
    const otherRes = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: otherEmail, password: "OtherPass123!", name: "Other User" },
    });
    const otherToken = otherRes.json().accessToken;

    // Try to edit as other user
    const editRes = await app.inject({
      method: "PATCH",
      url: `/api/messages/${targetMessageId}`,
      headers: { authorization: `Bearer ${otherToken}` },
      payload: { text: "Should not work" },
    });

    expect(editRes.statusCode).toBe(403);

    // Cleanup
    await app.inject({
      method: "DELETE",
      url: `/api/messages/${targetMessageId}`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
  });
});
