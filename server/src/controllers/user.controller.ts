import { Request, Response } from "express";
import { BaseError } from "sequelize";
import Joi from "joi";

import User from "../db/models/user";
import SimpleError from "../errors/SimpleError";
import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";
import { verifyIdIsUUID } from "../utils/joi_utils";

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
    icon: Joi.string().trim().uri().max(255),
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
    // Create a new user
    const user = await User.create(value);

    return res.status(201).json({ user });
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
    icon: Joi.string().trim().uri().max(255),
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
    const updatedUser = await user.update(value);

    return res.status(200).json({ user: updatedUser });
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

  // Find the user to delete
  const user = await User.findByPk(id);

  if (!user) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "User not found",
    });
  }

  // Continue with the user removal process
  try {
    // Remove the user
    await user.destroy();

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
