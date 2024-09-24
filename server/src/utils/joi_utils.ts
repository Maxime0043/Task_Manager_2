import Joi from "joi";

export function verifyIdIsUUID(
  params: object,
  fieldName: string | string[] = "id"
): Joi.ValidationError | undefined {
  // Create JOI Schema to validate the params
  let schema: Joi.ObjectSchema;

  if (Array.isArray(fieldName)) {
    const obj: any = {};

    fieldName.forEach((field) => {
      obj[field] = Joi.string().uuid({ version: "uuidv4" }).required();
    });
    schema = Joi.object(obj);
  } else {
    schema = Joi.object({
      [fieldName]: Joi.string().uuid({ version: "uuidv4" }).required(),
    });
  }

  // Validate the payload
  const { error } = schema.validate(params, { abortEarly: false });

  return error;
}

export function verifyIdIsInteger(
  params: object
): Joi.ValidationError | undefined {
  // Create JOI Schema to validate the params
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
  });

  // Validate the payload
  const { error } = schema.validate(params, { abortEarly: false });

  return error;
}
