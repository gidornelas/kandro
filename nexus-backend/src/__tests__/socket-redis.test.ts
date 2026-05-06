import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Server as SocketServer } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis-mock";
import { createServer } from "http";

const PORT_A = 4001;
const PORT_B = 4002;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

describe("Socket.io Redis Adapter multi-instance", () => {
  let ioA: SocketServer;
  let ioB: SocketServer;
  let clientA: ClientSocket;
  let clientB: ClientSocket;

  beforeAll(async () => {
    // Create HTTP servers
    const httpA = createServer();
    const httpB = createServer();

    ioA = new SocketServer(httpA, {
      cors: { origin: "*", credentials: true },
    });
    ioB = new SocketServer(httpB, {
      cors: { origin: "*", credentials: true },
    });

    // Set up Redis adapter for both instances
    const pubA = new Redis(REDIS_URL);
    const subA = pubA.duplicate();
    ioA.adapter(createAdapter(pubA, subA));

    const pubB = new Redis(REDIS_URL);
    const subB = pubB.duplicate();
    ioB.adapter(createAdapter(pubB, subB));

    // Register a test event handler on instance A
    ioA.on("connection", (socket) => {
      socket.on("test:echo", (data, callback) => {
        if (typeof callback === "function") {
          callback({ ok: true, data, receivedBy: "A" });
        }
      });
    });

    // Register a test event handler on instance B
    ioB.on("connection", (socket) => {
      socket.on("test:echo", (data, callback) => {
        if (typeof callback === "function") {
          callback({ ok: true, data, receivedBy: "B" });
        }
      });
    });

    // Register join and broadcast handlers
    ioA.on("connection", (socket) => {
      socket.on("join", (room) => {
        socket.join(room);
      });
      socket.on("test:broadcast", (payload) => {
        ioA.to("room:test").emit("test:message", payload);
      });
    });
    ioB.on("connection", (socket) => {
      socket.on("join", (room) => {
        socket.join(room);
      });
    });

    // Start listening
    await new Promise<void>((resolve) => httpA.listen(PORT_A, resolve));
    await new Promise<void>((resolve) => httpB.listen(PORT_B, resolve));

    // Connect client A to instance A
    clientA = ioClient(`http://localhost:${PORT_A}`, {
      transports: ["websocket"],
      forceNew: true,
    });
    await new Promise<void>((resolve, reject) => {
      clientA.on("connect", () => resolve());
      clientA.on("connect_error", reject);
    });

    // Connect client B to instance B
    clientB = ioClient(`http://localhost:${PORT_B}`, {
      transports: ["websocket"],
      forceNew: true,
    });
    await new Promise<void>((resolve, reject) => {
      clientB.on("connect", () => resolve());
      clientB.on("connect_error", reject);
    });
  });

  afterAll(async () => {
    clientA?.close();
    clientB?.close();
    ioA?.close();
    ioB?.close();
    // Give time for cleanup
    await new Promise((r) => setTimeout(r, 200));
  });

  it("should connect clients to different instances", () => {
    expect(clientA.connected).toBe(true);
    expect(clientB.connected).toBe(true);
  });

  it("should route messages through Redis adapter across instances", async () => {
    // Client A sends a broadcast event
    const payload = { text: "Hello from A", ts: Date.now() };

    // Client B should receive the message via Redis adapter
    const received = new Promise<any>((resolve) => {
      clientB.on("test:message", resolve);
    });

    // Both clients join the same room
    clientA.emit("join", "room:test");
    clientB.emit("join", "room:test");

    // Wait for joins to propagate
    await new Promise((r) => setTimeout(r, 300));

    // Client A broadcasts
    clientA.emit("test:broadcast", payload);

    const result = await received;
    expect(result).toEqual(payload);
  }, 10000);

  it("should handle direct request-response across instances", async () => {
    // Client A sends a request to instance A (direct)
    const responseA = await new Promise<any>((resolve) => {
      clientA.emit("test:echo", { from: "A" }, resolve);
    });
    expect(responseA.ok).toBe(true);
    expect(responseA.receivedBy).toBe("A");

    // Client B sends a request to instance B (direct)
    const responseB = await new Promise<any>((resolve) => {
      clientB.emit("test:echo", { from: "B" }, resolve);
    });
    expect(responseB.ok).toBe(true);
    expect(responseB.receivedBy).toBe("B");
  }, 5000);
});
