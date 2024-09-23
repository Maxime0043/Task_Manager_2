import dotenv from "dotenv";

dotenv.config();

import { Server } from "socket.io";
import httpServer from "./api";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./websocket/utils/interfaces";

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

// Websocket connection
io.on("connection", (socket) => {
  console.log("Client connected");

  // Client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

io.engine.on("connection_error", (err) => {
  console.error(err);
});
