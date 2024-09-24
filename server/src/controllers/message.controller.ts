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
    include: [
      { model: User, attributes: ["id", "lastName", "firstName", "icon"] },
      MessageFiles,
    ],
  });

  for (const message of messages) {
    // Generate the presigned URL for the user icon
    if (message?.user?.icon) {
      message.user.icon = await generatePresignedUrl(message.user.icon);
    }

    // Generate the presigned URL for each file
    if (message.files) {
      for (const file of message.files) {
        file.path = await generatePresignedUrl(file.path);
      }
    }
  }

  return res.status(200).json({ messages });
}

export async function create(req: Request, res: Response) {
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

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    content: Joi.string().trim().allow(null, ""),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Define content
  if (!value.content) {
    value.content = "";
  }

  // Define the userId and conversationId
  value.userId = res.locals.userId;
  value.conversationId = conversationId;

  // Continue with the message creation process
  const transaction = await Message.sequelize?.transaction();

  try {
    // Create a new message
    let message = await Message.create(value, { transaction });

    // Create the message files if they exist
    if (req.files) {
      for (const file of req.files as Express.Multer.File[]) {
        await MessageFiles.create(
          {
            path: file.path,
            messageId: message.id,
          },
          { transaction }
        );
      }
    }

    // Retrieve the message with the user and files
    message = await message.reload({
      include: [
        { model: User, attributes: ["lastName", "firstName", "icon"] },
        MessageFiles,
      ],
      transaction,
    });

    // Generate the presigned URL for the user icon
    if (message?.user?.icon) {
      message.user.icon = await generatePresignedUrl(message.user.icon);
    }

    // Generate the presigned URL for each file
    if (message.files) {
      for (const file of message.files) {
        file.path = await generatePresignedUrl(file.path);
      }
    }

    // Commit the transaction
    await transaction?.commit();

    return res.status(201).json({ message });
  } catch (err) {
    // Rollback the transaction
    await transaction?.rollback();

    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}
