import {
  BaseError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from "sequelize";

type MySequelizeError = {
  field: string | undefined;
  name: string;
  value?: any;
};
type MyExtra = {
  foreignKeyField?: string;
};

export default class SequelizeError extends Error {
  private static readonly statusCode = 400;

  private readonly _code: number;
  private readonly _error: any;
  private readonly _extra: MyExtra;

  constructor(params: {
    statusCode?: number;
    error: BaseError;
    extra?: MyExtra;
  }) {
    super(params.error.message);

    this._code = params.statusCode || SequelizeError.statusCode;
    this._error = params.error;
    this._extra = params?.extra || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, SequelizeError.prototype);
  }

  get statusCode() {
    return this._code;
  }

  get errors(): MySequelizeError[] {
    const list: MySequelizeError[] = [];

    if (this._error instanceof ForeignKeyConstraintError) {
      this.foreignKeyError(list, this._error);
    } else if (this._error instanceof UniqueConstraintError) {
      this.uniqueKeyError(list, this._error);
    }

    return list;
  }

  private foreignKeyError(
    list: MySequelizeError[],
    error: ForeignKeyConstraintError
  ) {
    const field = this._extra?.foreignKeyField
      ? this._extra?.foreignKeyField
      : error.fields
      ? error.fields[0]
      : undefined;
    const name = "foreign_key";

    list.push({ field, name });
  }

  private uniqueKeyError(
    list: MySequelizeError[],
    error: UniqueConstraintError
  ) {
    error.errors.forEach((err) => {
      const field = err.path || undefined;
      const name = "not_unique";

      list.push({ field, name });
    });
  }
}
