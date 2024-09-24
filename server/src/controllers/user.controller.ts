import { Request, Response } from "express";
import { BaseError } from "sequelize";
import Joi from "joi";

import User from "../db/models/user";
import SimpleError from "../errors/SimpleError";
import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";
import { verifyIdIsUUID } from "../utils/joi_utils";
import { Op } from "sequelize";
import { deleteFile, generatePresignedUrl } from "../storage";

export async function listAll(req: Request, res: Response) {
  const {
    lastName,
    firstName,
    email,
    isAdmin,
    deleted,
    limit,
    offset,
    orderBy,
    dir,
  } = req.query;

  // Retrieve the Users columns
  const userColumns = Object.keys(User.getAttributes()).map((column) =>
    column.toLowerCase()
  );

  // Create JOI Schema to validate the query params
  const schema = Joi.object({
    lastName: Joi.string().trim().max(255),
    firstName: Joi.string().trim().max(255),
    email: Joi.string().trim().max(255),
    isAdmin: Joi.string().lowercase().valid("true", "false"),
    deleted: Joi.string().lowercase().valid("true", "false"),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0),
    orderBy: Joi.string()
      .lowercase()
      .valid(...userColumns),
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

  if (lastName) {
    where.lastName = { [Op.like]: `%${lastName}%` };
  }
  if (firstName) {
    where.firstName = { [Op.like]: `%${firstName}%` };
  }
  if (email) {
    where.email = { [Op.like]: `%${email}%` };
  }
  if (isAdmin) {
    where.isAdmin = isAdmin === "true";
  }

  // Find the users
  const users = await User.findAll({
    paranoid: deleted === "true" ? false : undefined,
    where,
    limit: parseInt(limit as string),
    offset: offset ? parseInt(offset as string) : undefined,
    order:
      orderBy && dir
        ? [[orderBy as string, dir === "asc" ? "ASC" : "DESC"]]
        : undefined,
    attributes: { exclude: ["password"] },
  });

  // Generate the icon URL for each user
  for (const user of users) {
    if (user.icon) {
      user.icon = await generatePresignedUrl(user.icon);
    }
  }

  return res.status(200).json({ users });
}

export async function info(req: Request, res: Response) {
  const id = res.locals.userId;

  // Find the user
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "User not found",
    });
  }

  // Generate the icon URL
  if (user.icon) {
    user.icon = await generatePresignedUrl(user.icon);
  }

  return res.status(200).json({ user });
}

export async function create(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    firstName: Joi.string().trim().max(255).required(),
    lastName: Joi.string().trim().max(255).required(),
    email: Joi.string().trim().email().max(255).required(),
    password: Joi.string().trim().min(6).max(16).required(),
    passwordConfirmation: Joi.string()
      .trim()
      .min(6)
      .max(16)
      .valid(Joi.ref("password"))
      .required(),
    roleId: Joi.number().integer().min(1).required(),
    isAdmin: Joi.boolean().required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the user creation process
  try {
    let user = await User.create(value);

    // Update the icon if it exists
    if (req.file) {
      user = await user.update({ icon: req.file.path });

      // Generate the icon URL
      user.icon = await generatePresignedUrl(user.icon);
    }

    // Remove the password from the response
    const { password, ...userWithoutPassword } = user.toJSON();

    return res.status(201).json({ userWithoutPassword });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function update(req: Request, res: Response) {
  const id = res.locals.userId;

  // Find the user to update
  const user = await User.findByPk(id);

  if (!user) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "User not found",
    });
  }

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    firstName: Joi.string().trim().max(255),
    lastName: Joi.string().trim().max(255),
    email: Joi.string().trim().email().max(255),
    password: Joi.string().trim().min(6).max(16),
    passwordConfirmation: Joi.string()
      .trim()
      .min(6)
      .max(16)
      .valid(Joi.ref("password"))
      .when("password", {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    roleId: Joi.number().integer().min(1),
    isAdmin: Joi.boolean(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the user update process
  try {
    // Update the user
    let updatedUser = await user.update(value);

    // Delete the icon if it exists
    if (updatedUser.icon) {
      await deleteFile(user.icon);
    }
    // Update the icon if it exists
    if (req.file) {
      updatedUser = await user.update({ icon: req.file.path });

      // Generate the icon URL
      updatedUser.icon = await generatePresignedUrl(updatedUser.icon);
    }

    // Remove the password from the response
    const { password, ...userWithoutPassword } = updatedUser.toJSON();

    return res.status(200).json({ user: userWithoutPassword });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function updateOther(req: Request, res: Response) {
  const { id } = req.params;

  // Validate the params
  const errorParams = verifyIdIsUUID(req.params);

  if (errorParams) {
    throw new JoiError({ error: errorParams, isUrlParam: true });
  }

  // Find the user to update
  const user = await User.findByPk(id);

  if (!user) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "User not found",
    });
  }

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    firstName: Joi.string().trim().max(255),
    lastName: Joi.string().trim().max(255),
    email: Joi.string().trim().email().max(255),
    password: Joi.string().trim().min(6).max(16),
    passwordConfirmation: Joi.string()
      .trim()
      .min(6)
      .max(16)
      .valid(Joi.ref("password"))
      .when("password", {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    roleId: Joi.number().integer().min(1),
    isAdmin: Joi.boolean(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the user update process
  try {
    // Update the user
    let updatedUser = await user.update(value);

    // Delete the icon if it exists
    if (updatedUser.icon) {
      await deleteFile(user.icon);
    }
    // Update the icon if it exists
    if (req.file) {
      updatedUser = await user.update({ icon: req.file.path });

      // Generate the icon URL
      updatedUser.icon = await generatePresignedUrl(updatedUser.icon);
    }

    // Remove the password from the response
    const { password, ...userWithoutPassword } = updatedUser.toJSON();

    return res.status(200).json({ user: userWithoutPassword });
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

  // Retrieve the payload
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    definitely: Joi.boolean(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Find the user to delete
  const user = await User.findByPk(id, {
    paranoid: value.definitely === true ? false : undefined,
  });

  if (!user) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "User not found",
    });
  }

  // Continue with the user removal process
  const transaction = await User.sequelize?.transaction();

  try {
    // Remove the user
    await user.destroy({ force: value.definitely === true, transaction });

    // Commit the transaction
    await transaction?.commit();

    return res.sendStatus(200);
  } catch (err) {
    // Rollback the transaction
    await transaction?.rollback();

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

  // Find the user to restore
  const user = await User.findByPk(id, { paranoid: false });

  if (!user) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "User not found",
    });
  }

  // Continue with the user restoration process
  try {
    // Restore the user
    await user.restore();

    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}
