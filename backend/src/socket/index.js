import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { Document } from "../models/Document.js";
import { scheduleAutosave } from "../services/documentSyncService.js";

export function createSocketServer(httpServer, { jwtSecret, clientUrl }) {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const payload = verifyToken(token, jwtSecret);
      const user = await User.findById(payload.sub).select("_id name email");
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("document:join", async ({ documentId }) => {
      const doc = await Document.findById(documentId);
      if (!doc) return;

      const isAllowed = doc.owner.toString() === socket.user._id.toString() ||
        doc.collaborators.some((c) => c.user.toString() === socket.user._id.toString());

      if (!isAllowed) {
        socket.emit("document:error", { message: "Forbidden" });
        return;
      }

      socket.join(documentId);
      socket.to(documentId).emit("presence:update", { type: "join", user: socket.user });
    });

    socket.on("document:edit", async ({ documentId, patch, nextContent, baseVersion }) => {
      const doc = await Document.findById(documentId);
      if (!doc) return;

      if (baseVersion !== doc.version) {
        socket.emit("document:conflict", {
          message: "Version mismatch",
          serverVersion: doc.version,
          content: doc.content
        });
        return;
      }

      doc.version += 1;
      const update = {
        patch,
        content: nextContent,
        version: doc.version,
        updatedBy: socket.user._id
      };

      socket.to(documentId).emit("document:patch", update);
      socket.emit("document:ack", update);
      scheduleAutosave(documentId, {
        content: nextContent,
        version: doc.version,
        userId: socket.user._id
      });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("presence:update", { type: "leave", user: socket.user });
        }
      }
    });
  });

  return io;
}
