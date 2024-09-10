import { Request, Response } from "express";
import Client from "../db/models/client";
import SimpleError from "../errors/SimpleError";

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
