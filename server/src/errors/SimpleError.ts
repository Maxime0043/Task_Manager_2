import Joi from "joi";

type MySimpleError = {
  name: string | undefined;
  message?: string;
};

export default class SimpleError extends Error {
  private static readonly statusCode = 400;

  private readonly _code: number;
  private readonly _errorName: string;

  constructor(params: { statusCode?: number; name: string; message?: string }) {
    super(params.message || "Bad Request");

    this._code = params.statusCode || SimpleError.statusCode;
    this._errorName = params.name;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, SimpleError.prototype);
  }

  get statusCode() {
    return this._code;
  }

  get error(): MySimpleError {
    return {
      name: this._errorName,
      message: this.message,
    };
  }
}
