import { Request, Response } from "express";
import { BaseError, Op } from "sequelize";
import Joi from "joi";

import UserRoles from "../db/models/user_role";
import SimpleError from "../errors/SimpleError";
import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";

export async function listAll(req: Request, res: Response) {
  const { label, limit, offset, orderBy, dir } = req.query;

  // Retrieve the UserRoles columns
  const userRoleColumns = Object.keys(UserRoles.getAttributes());

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    label: Joi.string().trim().max(255),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0),
    orderBy: Joi.string()
      .lowercase()
      .valid(...userRoleColumns),
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

  // Find the userRoles
  const userRoles = await UserRoles.findAll({
    where,
    limit: parseInt(limit as string),
    offset: offset ? parseInt(offset as string) : undefined,
    order:
      orderBy && dir
        ? [[orderBy as string, dir === "asc" ? "ASC" : "DESC"]]
        : undefined,
  });

  return res.status(200).json({ userRoles });
}
