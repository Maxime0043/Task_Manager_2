import { Socket } from "socket.io";
import { userSockets } from "../../ws";

export function leaveCurrentRoom(socket: Socket) {
  if (socket.data.user && userSockets[socket.data.user.id]) {
    const { room } = userSockets[socket.data.user.id];

    if (room) {
      socket.leave(room);
    }
  }
}
