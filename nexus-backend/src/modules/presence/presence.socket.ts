import type { Server as SocketServer, Socket } from "socket.io";

interface PresenceState {
  userId: string;
  status: string;
  action?: string;
  context?: string;
  lastSeen: number;
}

const onlineUsers = new Map<string, PresenceState>();

export function registerPresenceHandlers(
  io: SocketServer,
  socket: Socket,
  userId: string
) {
  // Mark user online
  onlineUsers.set(userId, {
    userId,
    status: "online",
    lastSeen: Date.now(),
  });

  // Broadcast presence to all connected clients
  io.emit("presence:online", {
    userId,
    status: "online",
  });

  // Listen for status + activity updates
  socket.on("presence:status", (data: { status: string; action?: string; context?: string }) => {
    const existing = onlineUsers.get(userId);
    if (existing) {
      existing.status = data.status;
      existing.action = data.action;
      existing.context = data.context;
      existing.lastSeen = Date.now();
      io.emit("presence:status", {
        userId,
        status: data.status,
        action: data.action,
        context: data.context,
      });
    }
  });

  // Listen for activity updates (editing, reviewing, etc.)
  socket.on("presence:activity", (data: { action: string; context?: string }) => {
    const existing = onlineUsers.get(userId);
    if (existing) {
      existing.action = data.action;
      existing.context = data.context;
      existing.lastSeen = Date.now();
      io.emit("presence:activity", {
        userId,
        action: data.action,
        context: data.context,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("presence:offline", {
      userId,
      status: "offline",
    });
  });
}

export function getOnlineUsers(): PresenceState[] {
  return Array.from(onlineUsers.values());
}
