import Joi from "joi";

export function verifyIdIsUUID(
  params: object
): Joi.ValidationError | undefined {
  // Create JOI Schema to validate the params
  const schema = Joi.object({
    id: Joi.string().uuid({ version: "uuidv4" }).required(),
  });

  // Validate the payload
  const { error } = schema.validate(params, { abortEarly: false });

  return error;
}
