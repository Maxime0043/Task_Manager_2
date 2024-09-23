import { Socket } from "socket.io";
import SocketError from "../errors/SocketError";
import Conversation from "../../db/models/conversation";

export default function (socket: Socket) {
  socket.use(async ([event, ...args], next) => {
    if (event !== "new-notification") {
      return next();
    }

    // Verify if the user is in a conversation
    if (!socket.data.conversationId) {
      return next(
        new SocketError({
          event,
          name: "user-not-in-conversation",
          message: "User not in conversation",
        })
      );
    }

    // Validate the data
    const data = args[0];

    if (data) {
      return next(
        new SocketError({
          event,
          name: "data-not-allowed",
          message: "Data not allowed",
        })
      );
    }

    // Verify if the conversation exists
    const conversation = await Conversation.findByPk(
      socket.data.conversationId
    );

    if (!conversation) {
      socket.data.conversationId = null;

      return next(
        new SocketError({
          event,
          name: "conversation-not-found",
          message: "Conversation not found",
        })
      );
    }

    next();
  });
}
