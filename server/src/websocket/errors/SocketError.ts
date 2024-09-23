import { CustomError } from "../../errors/CustomError";

type MySocketError = {
  event: string;
  name: string;
  info?: Record<string, any>;
};

export default class SocketError extends CustomError {
  readonly statusCode = 400;

  private readonly _event: string;
  private readonly _name: string;
  private readonly _info: Record<string, any>;

  constructor(params: {
    event: string;
    name: string;
    message?: string;
    info?: Record<string, any>;
  }) {
    super(params?.message || "Bad Request");

    this._event = params.event;
    this._name = params.name;
    this._info = params.info || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, SocketError.prototype);
  }

  get error(): MySocketError {
    return {
      event: this._event,
      name: this._name,
      info: this._info,
    };
  }
}
