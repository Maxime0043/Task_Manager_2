import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import TaskStatus from "./../db/models/task_status";
import Task from "../db/models/task";
import SimpleError from "../errors/SimpleError";
import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";
import { verifyIdIsInteger } from "../utils/joi_utils";

export async function listAll(req: Request, res: Response) {
  const { label, limit, offset, orderBy, dir } = req.query;

  // Retrieve the TaskStatus columns
  const taskStatusColumns = Object.keys(TaskStatus.getAttributes());

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    label: Joi.string().trim().max(255),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0),
    orderBy: Joi.string()
      .lowercase()
      .valid(...taskStatusColumns),
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

  if (label) {
    where.label = { [Op.like]: `%${label}%` };
  }

  // Find the taskStatus
  const taskStatus = await TaskStatus.findAll({
    where,
    limit: parseInt(limit as string),
    offset: offset ? parseInt(offset as string) : undefined,
    order:
      orderBy && dir
        ? [[orderBy as string, dir === "asc" ? "ASC" : "DESC"]]
        : undefined,
  });

  return res.status(200).json({ taskStatus });
}
