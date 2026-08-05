import type { Response } from "express";

export type FieldError = { field: string; message: string };

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: FieldError[],
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function sendError(
  res: Response,
  status: number,
  error: string,
  details?: FieldError[],
) {
  if (status === 400 && details?.length) {
    return res.status(status).json({ error, details });
  }
  return res.status(status).json({ error });
}

export function handleError(res: Response, err: unknown) {
  if (err instanceof AppError) {
    return sendError(res, err.status, err.message, err.details);
  }
  console.error(err);
  return sendError(res, 500, "Internal server error");
}
