import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        status: err.status,
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      status: 500,
    },
  });
}
