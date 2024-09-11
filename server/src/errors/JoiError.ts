import Joi from "joi";

type MyJoiError = {
  field?: string | undefined;
  param?: string | undefined;
  name: string | undefined;
  value?: any;
};

export default class JoiError extends Error {
  private static readonly statusCode = 400;

  private readonly _code: number;
  private readonly _error: Joi.ValidationError;
  private readonly _isUrlParam: boolean;

  constructor(params: {
    statusCode?: number;
    error: Joi.ValidationError;
    isUrlParam?: boolean;
  }) {
    super(params.error.message);

    this._code = params.statusCode || JoiError.statusCode;
    this._error = params.error;
    this._isUrlParam = params.isUrlParam || false;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, JoiError.prototype);
  }

  get statusCode() {
    return this._code;
  }

  get errors(): MyJoiError[] {
    const list: MyJoiError[] = [];
    const name = this._isUrlParam ? "param" : "field";

    this._error.details.forEach((err) => {
      switch (err.type) {
        case "any.required":
          list.push({
            [name]: err.context?.key,
            name: "required",
          });
          break;
        case "any.only":
          list.push({
            [name]: err.context?.key,
            name: "mismatched",
            value: err.message.includes("must be [ref:")
              ? err.context?.valids[0]?.key
              : err.context?.valids,
          });
          break;
        case "object.unknown":
          list.push({
            [name]: err.context?.key,
            name: "useless",
          });
          break;
        case "string.base":
          list.push({
            [name]: err.context?.key,
            name: "type",
            value: "string",
          });
          break;
        case "string.empty":
          list.push({
            [name]: err.context?.key,
            name: "empty",
          });
          break;
        case "string.email":
          list.push({
            [name]: err.context?.key,
            name: "email",
          });
          break;
        case "string.min":
        case "number.min":
          list.push({
            [name]: err.context?.key,
            name: "min",
            value: err.context?.limit,
          });
          break;
        case "string.max":
        case "number.max":
          list.push({
            [name]: err.context?.key,
            name: "max",
            value: err.context?.limit,
          });
          break;
        case "string.pattern.base":
          list.push({
            [name]: err.context?.key,
            name: "regex",
            value: err.context?.regex.toString(),
          });
          break;
        case "string.guid":
          list.push({
            [name]: err.context?.key,
            name: "type",
            value: "uuid",
          });
          break;
        case "number.base":
          list.push({
            [name]: err.context?.key,
            name: "type",
            value: "number",
          });
          break;
        case "boolean.base":
          list.push({
            [name]: err.context?.key,
            name: "type",
            value: "boolean",
          });
          break;
        default:
          list.push({
            [name]: err.context?.key,
            name: undefined,
          });
          break;
      }
    });

    return list;
  }
}
