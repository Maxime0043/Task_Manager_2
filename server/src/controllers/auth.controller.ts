import { Request, Response } from "express";
import Joi from "joi";

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
