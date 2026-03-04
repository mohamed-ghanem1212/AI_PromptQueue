import { ErrorRequestHandler } from "express";
import { ConflictError } from "../../utils/errorFastify";
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (err.schema) {
    return res
      .status(statusCode)
      .json(
        new ConflictError(`Database error dublicate key in ${err.constraint}`),
      );
  }
  res.status(500).json(err);
};
