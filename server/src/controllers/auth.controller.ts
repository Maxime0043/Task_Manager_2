import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";

import User from "../db/models/user";

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
    return res
      .status(400)
      .json({ error: error.details.map((error) => error.message) });
  }

  // Remove passwordConfirmation from the payload
  delete value.passwordConfirmation;

  // Continue with the signup process
  try {
    // Create a new user
    const user = await User.create(value);

    return res.status(201).json(user);
  } catch (err) {
    return res.status(409).json({ error: err });
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
    return res
      .status(400)
      .json({ error: error.details.map((error) => error.message) });
  }

  // Find the user by email
  const user = await User.findOne({ where: { email: value.email } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(value.password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid password" });
  } else {
    return res.status(200).json(user);
  }
}
