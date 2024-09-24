import dotenv from "dotenv";

dotenv.config();

import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { BaseError } from "sequelize";
import jwt from "jsonwebtoken";

import User from "../db/models/user";
import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";

export async function signup(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    lastName: Joi.string().trim().max(255).required(),
    firstName: Joi.string().trim().max(255).required(),
    email: Joi.string().trim().email().max(255).required(),
    password: Joi.string().trim().min(6).max(16).required(),
    passwordConfirmation: Joi.string()
      .trim()
      .valid(Joi.ref("password") ?? null)
      .required(),
    roleId: Joi.number().required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Remove passwordConfirmation from the payload
  delete value.passwordConfirmation;

  // Continue with the signup process
  try {
    // Create a new user
    const user = await User.create(value);

    // Generate the jwt token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_PRIVATE_KEY!);

    // Set the token in the session
    req.session.token = token;
    req.session.save();

    return res.sendStatus(201);
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function signin(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    email: Joi.string().trim().email().max(255).required(),
    password: Joi.string().trim().min(6).max(16).required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Find the user by email
  const user = await User.findOne({ where: { email: value.email } });

  if (!user) {
    return res.sendStatus(401);
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(value.password, user.password);

  if (!isPasswordValid) {
    return res.sendStatus(401);
  }

  // Generate the jwt token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_PRIVATE_KEY!);

  // Set the token in the session
  req.session.token = token;
  req.session.save();

  return res.sendStatus(200);
}

export async function signout(req: Request, res: Response) {
  req.session.token = "";

  req.session.destroy((err) => {
    if (err) {
      throw err;
    }

    return res.sendStatus(200);
  });
}
