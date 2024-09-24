import { NextFunction, Request, Response } from "express";

import { verifyIdIsUUID } from "../utils/joi_utils";
import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import Conversation from "../db/models/conversation";
import Message from "../db/models/message";

export async function conversationExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id, conversationId } = req.params;
  const params = id ? { id } : { conversationId };

  // Validate the params
  const errorParams = verifyIdIsUUID(params, id ? "id" : "conversationId");

  if (errorParams) {
    return next(new JoiError({ error: errorParams, isUrlParam: true }));
  }

  // Verify that the conversation exists
  const conversation = await Conversation.findByPk(id ? id : conversationId);

  if (!conversation) {
    return next(
      new SimpleError({
        statusCode: 404,
        name: "not_found",
        message: "Conversation not found",
      })
    );
  }

  return next();
}

export async function messageExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { messageId } = req.params;
  const params = { messageId };

  // Validate the params
  const errorParams = verifyIdIsUUID(params, "messageId");

  if (errorParams) {
    return next(new JoiError({ error: errorParams, isUrlParam: true }));
  }

  const message = await Message.findByPk(messageId);

  if (!message) {
    return next(
      new SimpleError({
        statusCode: 404,
        name: "not_found",
        message: "Message not found",
      })
    );
  }

  return next();
}
