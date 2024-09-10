import Joi from "joi";

type MyJoiError = {
  field: string | undefined;
  name: string | undefined;
  value?: any;
};

export default class JoiError extends Error {
  private static readonly statusCode = 400;

  private readonly _code: number;
  private readonly _error: Joi.ValidationError;

  constructor(params: { statusCode?: number; error: Joi.ValidationError }) {
    super(params.error.message);

    this._code = params.statusCode || JoiError.statusCode;
    this._error = params.error;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, JoiError.prototype);
  }

  get statusCode() {
    return this._code;
  }

  get errors(): MyJoiError[] {
    const list: MyJoiError[] = [];

    this._error.details.forEach((err) => {
      switch (err.type) {
        case "any.required":
          list.push({
            field: err.context?.key,
            name: "required",
          });
          break;
        case "any.only":
          list.push({
            field: err.context?.key,
            name: "mismatched",
            value: err.context?.valids[0]?.key,
          });
          break;
        case "object.unknown":
          list.push({
            field: err.context?.key,
            name: "useless",
          });
          break;
        case "string.base":
          list.push({
            field: err.context?.key,
            name: "type",
            value: "string",
          });
          break;
        case "string.empty":
          list.push({
            field: err.context?.key,
            name: "empty",
          });
          break;
        case "string.email":
          list.push({
            field: err.context?.key,
            name: "email",
          });
          break;
        case "string.min":
          list.push({
            field: err.context?.key,
            name: "min",
            value: err.context?.limit,
          });
          break;
        case "string.max":
          list.push({
            field: err.context?.key,
            name: "max",
            value: err.context?.limit,
          });
          break;
        case "string.pattern.base":
          list.push({
            field: err.context?.key,
            name: "regex",
            value: err.context?.regex.toString(),
          });
          break;
        case "string.guid":
          list.push({
            field: err.context?.key,
            name: "type",
            value: "uuid",
          });
          break;
        case "number.base":
          list.push({
            field: err.context?.key,
            name: "type",
            value: "number",
          });
          break;
        default:
          list.push({
            field: err.context?.key,
            name: undefined,
          });
          break;
      }
    });

    return list;
  }
}
