import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { AppError } from './errorHandler';

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication token is missing or invalid.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 'You do not have permission to perform this action.', 403));
    }
    next();
  };
}
