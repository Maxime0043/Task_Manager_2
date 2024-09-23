import { Socket } from "socket.io";

import conversationEvent from "./conversation.event";

export default function (socket: Socket) {
  conversationEvent(socket);
}
