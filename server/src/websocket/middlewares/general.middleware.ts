import dotenv from "dotenv";

dotenv.config();

import { Request } from "express";
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

import User from "../../db/models/user";
import { userSockets } from "../../ws";
import SocketError from "../errors/SocketError";

export default function (socket: Socket) {
  socket.use(async ([event, ...args], next) => {
    const request = socket.request as Request;

    // We add the name of the triggering event in the socket request
    socket.data.eventTriggered = event;

    const unauthorizedError = new SocketError({
      event: event,
      name: "unauthorized",
    });

    request.session.reload(async (err) => {
      if (err) {
        socket.data.userId = null;
        return next(unauthorizedError);
      }

      // Check if the user is authenticated
      if (request.session.token) {
        const token = request.session.token;

        if (token) {
          try {
            const decoded: any = jwt.verify(
              token,
              process.env.JWT_PRIVATE_KEY!
            );
            const user = await User.findByPk(decoded.userId);

            if (user) {
              socket.data.userId = user.id;
              userSockets[user.id] = {
                socket: socket.id,
                room: undefined,
              };
              next();
            } else {
              socket.data.userId = null;
              next(unauthorizedError);
            }
          } catch (err: any) {
            socket.data.userId = null;
            next(unauthorizedError);
          }
        } else {
          socket.data.userId = null;
          next(unauthorizedError);
        }
      } else {
        socket.data.userId = null;
        next(unauthorizedError);
      }
    });
  });
}
