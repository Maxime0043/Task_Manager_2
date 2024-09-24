import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import SequelizeError from "../errors/SequelizeError";
import { verifyIdIsUUID } from "../utils/joi_utils";
import User from "../db/models/user";
import Message from "../db/models/message";
import MessageFiles from "../db/models/message_files";
import { deleteFile, generatePresignedUrl } from "../storage";
import Conversation from "../db/models/conversation";

export async function listAll(req: Request, res: Response) {
  const { id: conversationId } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Verify that the conversation exists
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Conversation not found",
    });
  }

  // Validate the query params
  const { before, after, limit, offset } = req.query;

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    before: Joi.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    after: Joi.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0),
  });

  const { error: errorQueryParams } = schema.validate(req.query, {
    abortEarly: false,
  });

  if (errorQueryParams) {
    throw new JoiError({ error: errorQueryParams, isUrlParam: true });
  }

  // Create the where object
  const where: any = {};

  if (before) {
    where.createdAt = { [Op.lte]: before };
  }
  if (after) {
    where.createdAt = { [Op.gte]: after };
  }
  if (conversationId) {
    where.conversationId = { [Op.eq]: conversationId };
  }

  // Find the messages
  const messages = await Message.findAll({
    where,
    limit: parseInt(limit as string),
    offset: offset ? parseInt(offset as string) : undefined,
    order: [["createdAt", "DESC"]],
    include: [User, MessageFiles],
  });

  // Generate the presigned URL for each file
  for (const message of messages) {
    if (message.files) {
      for (const file of message.files) {
        file.path = await generatePresignedUrl(file.path);
      }
    }
  }

  return res.status(200).json({ messages });
}
