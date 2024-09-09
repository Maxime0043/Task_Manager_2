import { NextFunction, Request, Response } from "express";

import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof JoiError) {
    return res.status(err.statusCode).json({ errors: err.errors });
  } else if (err instanceof SequelizeError) {
    return res.status(err.statusCode).json({ errors: err.errors });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
