import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import SequelizeError from "../errors/SequelizeError";
import Task, { TASK_PRIORITIES } from "../db/models/task";
import { verifyIdIsUUID } from "../utils/joi_utils";
import User from "../db/models/user";

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
    priority: Joi.string()
      .lowercase()
      .valid(...Object.values(TASK_PRIORITIES)),
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
    include: [
      {
        model: User,
        as: "usersAssigned",
        attributes: ["id", "firstname", "lastname", "icon"],
      },
    ],
  });

  return res.status(200).json({ tasks });
}

export async function details(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the task
  const task = await Task.findByPk(id, {
    include: {
      model: User,
      as: "usersAssigned",
      attributes: ["id", "firstname", "lastname", "icon"],
    },
  });

  if (!task) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Task not found",
    });
  }

  return res.status(200).json({ task });
}

export async function create(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255).required(),
    timeEstimate: Joi.number().min(0).precision(2).required(),
    deadline: Joi.date().iso(),
    percentDone: Joi.number().integer().min(0).max(100),
    statusId: Joi.number().integer().min(1).required(),
    description: Joi.string().trim(),
    priority: Joi.string()
      .lowercase()
      .valid(...Object.values(TASK_PRIORITIES)),
    position: Joi.number().integer().min(0),
    projectId: Joi.string().uuid({ version: "uuidv4" }).required(),
    creatorId: Joi.string().uuid({ version: "uuidv4" }).required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the task creation process
  try {
    // Create a new task
    const task = await Task.create(value);

    return res.status(201).json({ task });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the task to update
  const task = await Task.findByPk(id);

  if (!task) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Task not found",
    });
  }

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255),
    timeEstimate: Joi.number().min(0).precision(2),
    deadline: Joi.date().iso(),
    percentDone: Joi.number().integer().min(0).max(100),
    statusId: Joi.number().integer().min(1),
    description: Joi.string().trim(),
    priority: Joi.string()
      .lowercase()
      .valid(...Object.values(TASK_PRIORITIES)),
    position: Joi.number().integer().min(0),
    projectId: Joi.string().uuid({ version: "uuidv4" }),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the task update process
  try {
    // Update the task
    const updatedTask = await task.update(value);

    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the task to delete
  const task = await Task.findByPk(id);

  if (!task) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Task not found",
    });
  }

  // Continue with the task removal process
  try {
    // Remove the task
    await task.destroy();

    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function restore(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the task to restore
  const task = await Task.findByPk(id, { paranoid: false });

  if (!task) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Task not found",
    });
  }

  // Continue with the task restoration process
  try {
    // Restore the task
    await task.restore();

    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}
