import { NextFunction, Response, Request } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req as Request, res, next)).catch(next);
  };
};
