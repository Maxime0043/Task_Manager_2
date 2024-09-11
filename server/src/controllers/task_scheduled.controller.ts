import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import SequelizeError from "../errors/SequelizeError";
import TaskScheduled from "../db/models/task_scheduled";
import { verifyIdIsUUID } from "../utils/joi_utils";
import { isIsoDate } from "../utils/validate";

export async function listAll(req: Request, res: Response) {
  const { start, end, taskId, projectId, userId, limit, offset, orderBy, dir } =
    req.query;

  // Retrieve the TaskScheduled columns
  const taskScheduledColumns = Object.keys(TaskScheduled.getAttributes()).map(
    (column) => column.toLowerCase()
  );

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required(),
    taskId: Joi.string().uuid(),
    projectId: Joi.string().uuid(),
    userId: Joi.string().uuid(),
    limit: Joi.number().integer().min(1),
    offset: Joi.number().integer().min(0),
    orderBy: Joi.string()
      .lowercase()
      .valid(...taskScheduledColumns),
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

  if (start) {
    if (isIsoDate(start as string) === false) {
      throw new SimpleError({
        statusCode: 400,
        name: "invalid_iso_date_format",
        message: "Invalid date format for 'start'. Please use ISO format.",
      });
    }

    // Separate date and time from the start date
    const startDate = new Date(start as string);

    const [date, time] = startDate.toISOString().split("T");

    where.date = { [Op.gte]: date };
    where.start = { [Op.gte]: time };
  }
  if (end) {
    if (isIsoDate(end as string) === false) {
      throw new SimpleError({
        statusCode: 400,
        name: "invalid_iso_date_format",
        message: "Invalid date format for 'end'. Please use ISO format.",
      });
    }

    // Separate date and time from the end date
    const endDate = new Date(end as string);

    const [date, time] = endDate.toISOString().split("T");

    where.date = { [Op.lte]: date };
    where.end = { [Op.lte]: time };
  }
  if (taskId) {
    where.taskId = { [Op.eq]: taskId };
  }
  if (projectId) {
    where.projectId = { [Op.eq]: projectId };
  }
  if (userId) {
    where.userId = { [Op.eq]: userId };
  }

  // Find the tasks
  const tasks = await TaskScheduled.findAll({
    where,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
    order:
      orderBy && dir
        ? [[orderBy as string, dir === "asc" ? "ASC" : "DESC"]]
        : undefined,
  });

  return res.status(200).json({ tasks });
}
