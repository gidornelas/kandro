/**
 * Unit tests for the Prisma mock's `some` filter mechanism.
 *
 * Verifies that relation filters like
 *   workspace.findMany({ where: { members: { some: { userId } } } })
 * correctly return only records that have at least one matching related record.
 */
import { describe, it, expect } from "vitest";
import { createInMemoryPrisma } from "./helpers/prisma-mock.js";

describe("prisma-mock `some` filter", () => {
  it("filters workspaces by matching member userId", async () => {
    const prisma = createInMemoryPrisma() as any;

    // Create workspace A with member U1
    const wsA = await prisma.workspace.create({
      data: {
        name: "Workspace A",
        initials: "WA",
        color: "#ff0000",
        members: { create: { userId: "U1", role: "member" } },
      },
    });

    // Create workspace B with member U2
    const wsB = await prisma.workspace.create({
      data: {
        name: "Workspace B",
        initials: "WB",
        color: "#00ff00",
        members: { create: { userId: "U2", role: "member" } },
      },
    });

    // Query workspaces that have a member with userId 'U1'
    const result = await prisma.workspace.findMany({
      where: { members: { some: { userId: "U1" } } },
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(wsA.id);
    expect(result[0].name).toBe("Workspace A");
  });

  it("returns empty array when no workspace has the matching member", async () => {
    const prisma = createInMemoryPrisma() as any;

    // Create workspace A with member U1
    await prisma.workspace.create({
      data: {
        name: "Workspace A",
        initials: "WA",
        color: "#ff0000",
        members: { create: { userId: "U1", role: "member" } },
      },
    });

    // Query for a userId that does not exist
    const result = await prisma.workspace.findMany({
      where: { members: { some: { userId: "NONEXISTENT" } } },
    });

    expect(result).toHaveLength(0);
  });

  it("returns all workspaces when all have matching members", async () => {
    const prisma = createInMemoryPrisma() as any;

    const wsA = await prisma.workspace.create({
      data: {
        name: "Workspace A",
        initials: "WA",
        color: "#ff0000",
        members: { create: { userId: "U1", role: "member" } },
      },
    });

    const wsB = await prisma.workspace.create({
      data: {
        name: "Workspace B",
        initials: "WB",
        color: "#00ff00",
        members: { create: { userId: "U1", role: "member" } },
      },
    });

    // Both workspaces have a member with userId 'U1'
    const result = await prisma.workspace.findMany({
      where: { members: { some: { userId: "U1" } } },
    });

    expect(result).toHaveLength(2);
    expect(result.map((r: any) => r.id).sort()).toEqual([wsA.id, wsB.id].sort());
  });
});
