import { Response, NextFunction } from 'express';
import { updateUserSchema } from '../validators/user.validator';
import * as usersService from '../services/users.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export async function getUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await usersService.getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getUserById(req.user!.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getMyBorrows(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const active = req.query.active === 'true';
    const borrows = await usersService.getUserBorrows(req.user!.sub, active || undefined);
    res.json({ borrows });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid user ID.', 400));
    const user = await usersService.getUserById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid user ID.', 400));
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const user = await usersService.updateUser(id, parsed.data);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid user ID.', 400));
    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
