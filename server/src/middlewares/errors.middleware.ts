import { NextFunction, Request, Response } from "express";

import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";
import SimpleError from "../errors/SimpleError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof JoiError || err instanceof SequelizeError) {
    return res.status(err.statusCode).json({ errors: err.errors });
  } else if (err instanceof SimpleError) {
    return res.status(err.statusCode).json({ error: err.error });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
