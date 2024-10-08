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

export async function details(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsInteger(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the taskStatus
  const taskStatus = await TaskStatus.findByPk(id);

  if (!taskStatus) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "UserRole not found",
    });
  }

  return res.status(200).json({ taskStatus });
}

export async function create(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255).required(),
    label: Joi.string().trim().max(255).required(),
    color: Joi.string()
      .trim()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the TaskStatus creation process
  try {
    // Create a new taskStatus
    const taskStatus = await TaskStatus.create(value);

    return res.status(201).json({ taskStatus });
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
  const errorParams = verifyIdIsInteger(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the taskStatus to update
  const taskStatus = await TaskStatus.findByPk(id);

  if (!taskStatus) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "TaskStatus not found",
    });
  }

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255),
    label: Joi.string().trim().max(255),
    color: Joi.string()
      .trim()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the taskStatus update process
  try {
    // Update the taskStatus
    const updatedTaskStatus = await taskStatus.update(value);

    return res.status(200).json({ taskStatus: updatedTaskStatus });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const payload = req.body;

  // Validate the params
  const errorParams = verifyIdIsInteger(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    statusId: Joi.number().integer().min(1).required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  const { statusId } = value;
  const transaction = await TaskStatus.sequelize?.transaction();

  // Find the TaskStatus to delete
  const taskStatus = await TaskStatus.findByPk(id);

  if (!taskStatus) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "TaskStatus not found",
    });
  }

  // Find all the tasks with the statusId and change their statusId
  try {
    // Update the tasks
    await Task.update(
      { statusId: statusId },
      { where: { statusId: taskStatus.id }, transaction }
    );
  } catch (err) {
    // Rollback the transaction in case of error
    await transaction?.rollback();

    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }

  // Continue with the UserRole removal process
  try {
    // Remove the UserRole
    await taskStatus.destroy({ transaction });

    // Commit the transaction
    await transaction?.commit();

    return res.sendStatus(200);
  } catch (err) {
    // Rollback the transaction in case of error
    await transaction?.rollback();

    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}
