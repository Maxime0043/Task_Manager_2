import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import SequelizeError from "../errors/SequelizeError";
import Task, { TASK_PRIORITIES } from "../db/models/task";
import { verifyIdIsUUID } from "../utils/joi_utils";
import User from "../db/models/user";
import TaskUsers from "../db/models/task_users";
import TaskFiles from "../db/models/task_files";
import { deleteFile } from "../storage";

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
    usersAssigned: Joi.array()
      .items(Joi.string().uuid({ version: "uuidv4" }))
      .min(1)
      .required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Format the users assigned to the task
  const usersAssigned = value.usersAssigned;
  delete value.usersAssigned;

  // Continue with the task creation process
  let task: Task;
  const transaction = await Task.sequelize?.transaction();

  try {
    // Create a new task
    task = await Task.create(value, { transaction });

    if (req.files) {
      // Add the files to the task
      for (const file of req.files as Express.Multer.File[]) {
        await TaskFiles.create(
          {
            name: file.filename,
            path: file.path,
            taskId: task.id,
            userId: value.creatorId,
          },
          { transaction }
        );
      }
    }
  } catch (err) {
    console.log(err);
    // Rollback the transaction in case of error
    await transaction?.rollback();

    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }

  let i = 0;

  // Create the association between the task and the users assigned
  try {
    for (; i < usersAssigned.length; i++) {
      await TaskUsers.create(
        {
          taskId: task.id,
          userId: usersAssigned[i],
        },
        { transaction }
      );
    }
  } catch (err) {
    // Rollback the transaction in case of error
    await transaction?.rollback();

    if (err instanceof BaseError) {
      throw new SequelizeError({
        statusCode: 409,
        error: err,
        extra: { foreignKeyField: `usersAssigned[${i}]` },
      });
    }

    throw err;
  }

  // Commit the transaction
  await transaction?.commit();

  // Reload the task with the users assigned
  task = await task.reload({
    include: [{ model: User, as: "usersAssigned" }, TaskFiles],
  });

  return res.status(201).json({ task });
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
    usersAssigned: Joi.array()
      .items(Joi.string().uuid({ version: "uuidv4" }))
      .min(1),
    filesToRemoveId: Joi.array().items(Joi.number().integer().min(1)),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Retrieve the filesToRemoveId from the value
  const filesToRemoveId: number[] | undefined = value.filesToRemoveId;
  delete value.filesToRemoveId;

  // Format the users assigned to the task
  const usersAssigned: string[] | undefined = value.usersAssigned;
  delete value.usersAssigned;

  // Continue with the task update process
  let updatedTask: Task;
  const transaction = await Task.sequelize?.transaction();

  try {
    // Update the task
    updatedTask = await task.update(value, { transaction });
  } catch (err) {
    // Rollback the transaction in case of error
    await transaction?.rollback();

    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }

  // Update the users assigned to the task
  if (usersAssigned) {
    let i = 0;

    // Create the association between the task and the users assigned
    try {
      // Remove the users that are not assigned anymore
      await TaskUsers.destroy({
        where: {
          taskId: updatedTask.id,
          userId: { [Op.notIn]: usersAssigned },
        },
        transaction,
      });

      // Add the new users assigned
      for (; i < usersAssigned.length; i++) {
        await TaskUsers.findOrCreate({
          where: { taskId: updatedTask.id, userId: usersAssigned[i] },
          defaults: { taskId: updatedTask.id, userId: usersAssigned[i] },
          transaction,
        });
      }
    } catch (err) {
      // Rollback the transaction in case of error
      await transaction?.rollback();

      if (err instanceof BaseError) {
        throw new SequelizeError({
          statusCode: 409,
          error: err,
          extra: { foreignKeyField: `usersAssigned[${i}]` },
        });
      }

      throw err;
    }
  }

  // Update the files assigned to the task
  if (req.files) {
    try {
      // Add the files to the task
      for (const file of req.files as Express.Multer.File[]) {
        await TaskFiles.create(
          {
            name: file.filename,
            path: file.path,
            taskId: updatedTask.id,
            userId: updatedTask.creatorId,
          },
          { transaction }
        );
      }
    } catch (err) {
      // Rollback the transaction in case of error
      await transaction?.rollback();

      if (err instanceof BaseError) {
        throw new SequelizeError({ statusCode: 409, error: err });
      }

      throw err;
    }
  }
  if (filesToRemoveId) {
    try {
      // Retrieve the files to remove
      const filesToRemove = await TaskFiles.findAll({
        where: {
          id: { [Op.in]: filesToRemoveId },
          taskId: updatedTask.id,
        },
        transaction,
      });

      const filesToRemovePaths = filesToRemove.map((file) => file.path);

      // Delete the files from the database
      await TaskFiles.destroy({
        where: {
          id: { [Op.in]: filesToRemoveId },
          taskId: updatedTask.id,
        },
        transaction,
      });

      // Delete the files from the storage
      for (const path of filesToRemovePaths) {
        await deleteFile(path);
      }
    } catch (err) {
      // Rollback the transaction in case of error
      await transaction?.rollback();

      if (err instanceof BaseError) {
        throw new SequelizeError({ statusCode: 409, error: err });
      }

      throw err;
    }
  }

  // Commit the transaction
  await transaction?.commit();

  // Reload the task with the users assigned
  updatedTask = await updatedTask.reload({
    include: [{ model: User, as: "usersAssigned" }, TaskFiles],
  });

  return res.status(200).json({ task: updatedTask });
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
