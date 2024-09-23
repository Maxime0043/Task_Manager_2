import { Socket } from "socket.io";
import SocketError from "../errors/SocketError";
import Conversation from "../../db/models/conversation";
import ConversationUsers from "../../db/models/conversation_users";

export default function (socket: Socket) {
  socket.use(async ([event, ...args], next) => {
    if (event !== "join-conversation") {
      return next();
    }

    // Validate the data
    const data = args[0];

    if (!data || !data.id) {
      return next(
        new SocketError({
          event,
          name: "invalid-data",
          message: "Invalid data",
        })
      );
    }

    // Verify if the conversation exists
    const conversation = await Conversation.findByPk(data.id, {
      include: [ConversationUsers],
    });

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

    // Verify if the user is part of the conversation
    if (
      conversation.conversationUsers &&
      conversation.conversationUsers.aUserId !== socket.data.userId &&
      conversation.conversationUsers.bUserId !== socket.data.userId
    ) {
      socket.data.conversationId = null;

      return next(
        new SocketError({
          event,
          name: "user-not-in-conversation",
          message: "User not in conversation",
        })
      );
    }

    // Define the conversation id
    socket.data.conversationId = conversation.id;
    next();
  });
}
