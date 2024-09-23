import dotenv from "dotenv";

dotenv.config();

import helmet from "helmet";
import { Server } from "socket.io";
import httpServer, { sessionMiddleware } from "./api";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  UserSocket,
} from "./websocket/utils/interfaces";
import SocketError from "./websocket/errors/SocketError";

// Define the WebSocket server
export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(" "),
    credentials: true,
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e6, // 1MB
});

// Middleware
io.engine.use(helmet());
io.engine.use(sessionMiddleware);

// Relation between idUser and idSocket
export const userSockets: Record<string, UserSocket> = {}; // { userId: {socket: socketId, room: room} }

// Import middlewares
import socketMiddleware from "./websocket/middlewares/index.middleware";

// Import events
import socketEvents from "./websocket/events/index.event";

// Websocket connection
io.on("connection", (socket) => {
  socketMiddleware(socket);
  socketEvents(socket);

  // Manage Error
  socket.on("error", (err) => {
    if (err instanceof SocketError) {
      socket.emit("error", { error: err.error });
    } else {
      const myError = new SocketError({
        event: "unknown",
        name: "UnknownError",
      });
      socket.emit("error", { error: myError.error });
    }
  });

  // Client disconnection
  socket.on("disconnect", () => {
    // If the user is connected, delete the socket
    if (socket.data.userId) {
      delete userSockets[socket.data.userId];
    }
  });
});

io.engine.on("connection_error", (err) => {
  console.error(err);
});
