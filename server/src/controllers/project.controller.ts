import { Request, Response } from "express";
import { Op } from "sequelize";
import Joi from "joi";

import JoiError from "../errors/JoiError";
import Project from "../db/models/project";

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
