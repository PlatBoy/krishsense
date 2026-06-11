import { HttpError } from "../utils/httpError.js";

export function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new HttpError(400, "Validation failed", parsed.error.flatten()));
    }
    req.body = parsed.data;
    next();
  };
}
