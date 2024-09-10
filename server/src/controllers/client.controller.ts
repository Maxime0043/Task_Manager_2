import { Request, Response } from "express";
import Client from "../db/models/client";

export async function listAll(req: Request, res: Response) {
  const clients = await Client.findAll();

  return res.status(200).json({ clients });
}
