import { Socket } from "socket.io";
import { leaveCurrentRoom } from "../utils/functions";
import { userSockets } from "../../ws";

export default function (socket: Socket) {
  socket.on("join-conversation", async (data: Record<string, string>) => {
    const conversationId = socket.data.conversationId;

    // The user leaves the current room
    leaveCurrentRoom(socket);

    // The user joins the conversation room
    socket.join(conversationId);
    userSockets[socket.data.userId].room = conversationId;

    // Send the messages to the user
    socket.emit("join-conversation", { id: conversationId, status: "success" });
  });

  socket.on("leave-conversation", () => {
    socket.data.conversationId = null;
    leaveCurrentRoom(socket);
  });
}
