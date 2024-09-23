import { Socket } from "socket.io";

import generalMiddleware from "./general.middleware";

export default function (socket: Socket) {
  generalMiddleware(socket);
}
