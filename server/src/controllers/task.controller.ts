import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import SequelizeError from "../errors/SequelizeError";
import Task from "../db/models/task";
import { verifyIdIsUUID } from "../utils/joi_utils";

export async function listAll(req: Request, res: Response) {
  const {
    name,
    statusId,
    priority,
    projectId,
    deleted,
    limit,
    offset,
    orderBy,
    dir,
  } = req.query;

  // Retrieve the Tasks columns
  const taskColumns = Object.keys(Task.getAttributes()).map((column) =>
    column.toLowerCase()
  );

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    name: Joi.string().trim().max(255),
    statusId: Joi.array().items(Joi.number().integer().min(1)),
    priority: Joi.string().lowercase().valid("low", "medium", "high"),
    projectId: Joi.string().uuid(),
    deleted: Joi.string().lowercase().valid("true", "false"),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0),
    orderBy: Joi.string()
      .lowercase()
      .valid(...taskColumns),
    dir: Joi.string().lowercase().valid("asc", "desc"),
  });

  // Validate the query params
  const { error: errorParams } = schema.validate(req.query, {
    abortEarly: false,
  });

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Create the where object
  const where: any = {};

  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (statusId) {
    where.statusId = { [Op.in]: statusId };
  }
  if (priority) {
    where.priority = { [Op.eq]: priority };
  }
  if (projectId) {
    where.projectId = { [Op.eq]: projectId };
  }

  // Find the tasks
  const tasks = await Task.findAll({
    paranoid: deleted === "true" ? false : undefined,
    where,
    limit: parseInt(limit as string),
    offset: offset ? parseInt(offset as string) : undefined,
    order:
      orderBy && dir
        ? [[orderBy as string, dir === "asc" ? "ASC" : "DESC"]]
        : undefined,
  });

  return res.status(200).json({ tasks });
}
