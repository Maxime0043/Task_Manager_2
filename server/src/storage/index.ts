import { config } from "dotenv";

config();

import { Client } from "minio";
import multer from "multer";
import { MinioStorageEngine } from "@namatery/multer-minio";
import { IStorageOptions } from "@namatery/multer-minio/dist/lib/storage.options";
import { NextFunction, Request, Response } from "express";
import MulterError from "../errors/MulterError";
import SimpleError from "../errors/SimpleError";
import { normalizeString } from "../utils/format";

// Minio client
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
  useSSL: true, // Permer d'utiliser le protocole HTTPS
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

// Multer storage engine
const options: IStorageOptions = {
  path: "/uploads",
  bucket: {
    init: false,
    versioning: false,
    forceDelete: false,
  },
  object: {
    useOriginalFilename: false,
    name: (req, file) => {
      const filename = normalizeString(file.originalname);
      return `${Date.now()}-${filename}`;
    },
  },
};

const storageUser = new MinioStorageEngine(
  minioClient,
  process.env.MINIO_BUCKET!,
  {
    ...options,
    path: "/uploads/users",
  }
);
const storageTask = new MinioStorageEngine(
  minioClient,
  process.env.MINIO_BUCKET!,
  {
    ...options,
    path: "/uploads/tasks",
  }
);
const storageConversations = new MinioStorageEngine(
  minioClient,
  process.env.MINIO_BUCKET!,
  {
    ...options,
    path: "/uploads/conversations",
  }
);

// Multer middlewares
export const multerOptions = {
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB
  },
};

export const multerUserMiddleware = multer({
  storage: storageUser,
  ...multerOptions,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/image/)) {
      return cb(
        new SimpleError({
          name: "invalid-type-mime",
          message: "Invalid file type mime (only images are allowed)",
        })
      );
    }

    cb(null, true);
  },
});
export const multerTaskMiddleware = multer({
  storage: storageTask,
  ...multerOptions,
});
export const multerConversationsMiddleware = multer({
  storage: storageConversations,
  ...multerOptions,
});

// Construct a multer middleware
export function constructMulterMiddleware(
  multer: multer.Multer,
  fieldName: string,
  isSingle: boolean = true,
  maxFiles: number = 1
) {
  if (isSingle) {
    return (req: Request, res: Response, next: NextFunction) => {
      multer.single(fieldName)(req, res, (err) => {
        if (err) {
          if (err instanceof SimpleError) {
            return next(err);
          }
          return next(new MulterError({ error: err, info: { maxFiles: 1 } }));
        }

        next();
      });
    };
  } else {
    return (req: Request, res: Response, next: NextFunction) => {
      multer.array(fieldName, maxFiles)(req, res, (err) => {
        if (err) {
          return next(new MulterError({ error: err, info: { maxFiles } }));
        }

        next();
      });
    };
  }
}

// Delete a file from the storage
export async function deleteFile(filename: string): Promise<void> {
  try {
    await minioClient.removeObject(process.env.MINIO_BUCKET!, filename);
  } catch (err) {
    throw new Error(`Failed to delete file: ${err}`);
  }
}

// Delete multiple files from an express request from the storage
export async function deleteFilesFromExpressRequest(
  files: Express.Multer.File[]
): Promise<void> {
  try {
    for (const file of files) {
      await minioClient.removeObject(process.env.MINIO_BUCKET!, file.path);
    }
  } catch (err) {
    throw new Error(`Failed to delete files: ${err}`);
  }
}

// Generate a presigned URL for a file
export async function generatePresignedUrl(
  filename: string,
  expiry: number = 3600 * 24 * 7
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(
      process.env.MINIO_BUCKET!,
      filename,
      expiry
    );
  } catch (err) {
    throw new Error(`Failed to generate presigned URL: ${err}`);
  }
}
