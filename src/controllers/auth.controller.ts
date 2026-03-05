import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/user.validator';
import * as authService from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const result = await authService.register(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const result = await authService.login(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
