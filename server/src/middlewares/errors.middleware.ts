import { NextFunction, Request, Response } from "express";
import multer from "multer";

import JoiError from "../errors/JoiError";
import SequelizeError from "../errors/SequelizeError";
import SimpleError from "../errors/SimpleError";
import MulterError from "../errors/MulterError";
import { deleteFile, deleteFilesFromExpressRequest } from "../storage";

export async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Delete files from the storage
  if (req.file) {
    await deleteFile(req.file.path);
  }
  if (req.files) {
    await deleteFilesFromExpressRequest(req.files as Express.Multer.File[]);
  }

  if (err instanceof JoiError || err instanceof SequelizeError) {
    return res.status(err.statusCode).json({ errors: err.errors });
  } else if (err instanceof SimpleError || err instanceof MulterError) {
    return res.status(err.statusCode).json({ error: err.error });
  } else if (err instanceof multer.MulterError) {
    const multerErr = new MulterError({ error: err });
    return res.status(multerErr.statusCode).json({ error: multerErr.error });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
