import { Response, NextFunction } from 'express';
import { createAuthorSchema, updateAuthorSchema } from '../validators/author.validator';
import * as authorsService from '../services/authors.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export async function getAuthors(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authors = await authorsService.getAllAuthors();
    res.json({ authors });
  } catch (err) {
    next(err);
  }
}

export async function getAuthor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid author ID.', 400));
    const author = await authorsService.getAuthorById(id);
    res.json(author);
  } catch (err) {
    next(err);
  }
}

export async function createAuthor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createAuthorSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const author = await authorsService.createAuthor(parsed.data);
    res.status(201).json(author);
  } catch (err) {
    next(err);
  }
}

export async function updateAuthor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid author ID.', 400));
    const parsed = updateAuthorSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const author = await authorsService.updateAuthor(id, parsed.data);
    res.json(author);
  } catch (err) {
    next(err);
  }
}

export async function deleteAuthor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid author ID.', 400));
    await authorsService.deleteAuthor(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
