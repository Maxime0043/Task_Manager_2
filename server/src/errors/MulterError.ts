import multer from "multer";
import { multerOptions } from "../storage";

type MyMulterError = {
  name: string | undefined;
  message?: string;
  info?: { [key: string]: any };
};

export default class MulterError extends Error {
  private static readonly statusCode = 400;

  private readonly _code: number;
  private readonly _errorName: string;
  private readonly _info: any;

  constructor(params: {
    statusCode?: number;
    error: multer.MulterError;
    info?: { maxFiles?: number };
  }) {
    super(params.error.message || "Bad Request");

    this._code = params.statusCode || MulterError.statusCode;
    this._errorName = params.error.code;
    this._info = params.info;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, MulterError.prototype);
  }

  get statusCode() {
    return this._code;
  }

  get error(): MyMulterError {
    const info: any = {};

    switch (this._errorName) {
      case "LIMIT_FILE_SIZE":
        info.size = multerOptions.limits.fileSize;
        break;
      case "LIMIT_UNEXPECTED_FILE":
        info.maxFiles = this._info?.maxFiles || -1;
        break;
      default:
        break;
    }

    return {
      name: this._errorName,
      message: this.message,
      info,
    };
  }
}
