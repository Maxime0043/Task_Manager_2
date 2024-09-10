import { Request, Response } from "express";
import { BaseError } from "sequelize";
import Joi from "joi";

import Client from "../db/models/client";
import SimpleError from "../errors/SimpleError";
import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";

export async function listAll(req: Request, res: Response) {
  const clients = await Client.findAll();

  return res.status(200).json({ clients });
}

export async function details(req: Request, res: Response) {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Client not found",
    });
  }

  return res.status(200).json({ client });
}

export async function create(req: Request, res: Response) {
  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255).required(),
    email: Joi.string().trim().email().max(255).required(),
    phone: Joi.string()
      .trim()
      .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/),
    description: Joi.string().trim(),
    creatorId: Joi.string().uuid({ version: "uuidv4" }).required(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the client creation process
  try {
    // Create a new client
    const client = await Client.create(value);

    return res.status(201).json({ client });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Client not found",
    });
  }

  const payload = req.body;

  // Create JOI Schema to validate the payload
  const schema = Joi.object({
    name: Joi.string().trim().max(255),
    email: Joi.string().trim().email().max(255),
    phone: Joi.string()
      .trim()
      .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/),
    description: Joi.string().trim(),
  });

  // Validate the payload
  const { value, error } = schema.validate(payload, { abortEarly: false });

  if (error) {
    throw new JoiError({ error });
  }

  // Continue with the client update process
  try {
    // Update the client
    const updatedClient = await client.update(value);

    return res.status(200).json({ client: updatedClient });
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Client not found",
    });
  }

  // Continue with the client removal process
  try {
    // Remove the client
    await client.destroy();

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

  const client = await Client.findByPk(id, { paranoid: false });

  if (!client) {
    throw new SimpleError({
      statusCode: 404,
      name: "not_found",
      message: "Client not found",
    });
  }

  // Continue with the client restoration process
  try {
    // Restore the client
    await client.restore();

    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof BaseError) {
      throw new SequelizeError({ statusCode: 409, error: err });
    }

    throw err;
  }
}
