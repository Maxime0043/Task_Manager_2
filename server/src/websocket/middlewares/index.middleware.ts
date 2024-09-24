import { Socket } from "socket.io";

import generalMiddleware from "./general.middleware";
import conversationMiddleware from "./conversation.middleware";
import notificationMiddleware from "./notification.middleware";

export default function (socket: Socket) {
  generalMiddleware(socket);
  conversationMiddleware(socket);
  notificationMiddleware(socket);
}
