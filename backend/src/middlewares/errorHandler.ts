import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code || "ERROR",
      message: err.message,
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: err.errors[0]?.message || "Invalid input data",
      details: err.errors,
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      error: "ALREADY_EXISTS",
      message: "A record with this unique field already exists",
    });
  }

  return res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected error occurred",
  });
}