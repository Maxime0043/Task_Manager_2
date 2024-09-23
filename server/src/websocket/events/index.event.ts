import { Socket } from "socket.io";

import conversationEvent from "./conversation.event";
import notificationEvent from "./notification.event";

export default function (socket: Socket) {
  conversationEvent(socket);
  notificationEvent(socket);
}
