import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import SimpleError from "../errors/SimpleError";
import SequelizeError from "../errors/SequelizeError";
import Project from "../db/models/project";
import { verifyIdIsUUID } from "../utils/joi_utils";

export async function listAll(req: Request, res: Response) {
  const {
    name,
    statusId,
    isInternalProject,
    managerId,
    clientId,
    deleted,
    limit,
    offset,
    orderBy,
    dir,
  } = req.query;

  // Retrieve the Projects columns
  const projectColumns = Object.keys(Project.getAttributes());

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    name: Joi.string().trim().max(255),
    statusId: Joi.array().items(Joi.number().integer().min(1)),
    isInternalProject: Joi.string().lowercase().valid("true", "false"),
    managerId: Joi.string().uuid(),
    clientId: Joi.string().uuid(),
    deleted: Joi.string().lowercase().valid("true", "false"),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0),
    orderBy: Joi.string()
      .lowercase()
      .valid(...projectColumns),
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
  if (isInternalProject) {
    where.isInternalProject = { [Op.eq]: isInternalProject === "true" };
  }
  if (managerId) {
    where.managerId = { [Op.eq]: managerId };
  }
  if (clientId) {
    where.clientId = { [Op.eq]: clientId };
  }

  // Find the projects
  const projects = await Project.findAll({
    paranoid: deleted === "true" ? false : undefined,
    where,
    limit: parseInt(limit as string),
    offset: offset ? parseInt(offset as string) : undefined,
    order:
      orderBy && dir
        ? [[orderBy as string, dir === "asc" ? "ASC" : "DESC"]]
        : undefined,
  });

  return res.status(200).json({ projects });
}

export async function details(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the project
  const project = await Project.findByPk(id);

  if (!project) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Project not found",
    });
  }

  return res.status(200).json({ project });
}

export async function create(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255).required(),
    statusId: Joi.number().integer().min(1).required(),
    budget: Joi.number().min(0).precision(2),
    description: Joi.string().trim(),
    isInternalProject: Joi.boolean().required(),
    managerId: Joi.string().uuid({ version: "uuidv4" }).required(),
    clientId: Joi.string().uuid({ version: "uuidv4" }).required(),
    creatorId: Joi.string().uuid({ version: "uuidv4" }).required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the project creation process
  try {
    // Create a new project
    const project = await Project.create(value);

    return res.status(201).json({ project });
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

  // Find the project to update
  const project = await Project.findByPk(id);

  if (!project) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Project not found",
    });
  }

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255),
    statusId: Joi.number().integer().min(1),
    budget: Joi.number().min(0).precision(2),
    description: Joi.string().trim(),
    isInternalProject: Joi.boolean(),
    managerId: Joi.string().uuid({ version: "uuidv4" }),
    clientId: Joi.string().uuid({ version: "uuidv4" }),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the project update process
  try {
    // Update the project
    const updatedProject = await project.update(value);

    return res.status(200).json({ project: updatedProject });
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

  // Find the project to delete
  const project = await Project.findByPk(id);

  if (!project) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Project not found",
    });
  }

  // Continue with the project removal process
  try {
    // Remove the project
    await project.destroy();

    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}
