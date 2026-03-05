import { Response, NextFunction } from 'express';
import { createBookSchema, updateBookSchema } from '../validators/book.validator';
import * as booksService from '../services/books.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export async function getBooks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const books = await booksService.getAllBooks(genre, search);
    res.json({ books });
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid book ID.', 400));
    const book = await booksService.getBookById(id);
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function createBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createBookSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const book = await booksService.createBook(parsed.data);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
}

export async function updateBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid book ID.', 400));
    const parsed = updateBookSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError('VALIDATION_ERROR', parsed.error.issues[0].message, 400));
    }
    const book = await booksService.updateBook(id, parsed.data);
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return next(new AppError('VALIDATION_ERROR', 'Invalid book ID.', 400));
    await booksService.deleteBook(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function borrowBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookId = parseInt(String(req.params.id), 10);
    if (isNaN(bookId)) return next(new AppError('VALIDATION_ERROR', 'Invalid book ID.', 400));
    const userId = req.user!.sub;
    const borrow = await booksService.borrowBook(userId, bookId);
    res.status(201).json(borrow);
  } catch (err) {
    next(err);
  }
}

export async function returnBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookId = parseInt(String(req.params.id), 10);
    if (isNaN(bookId)) return next(new AppError('VALIDATION_ERROR', 'Invalid book ID.', 400));
    const userId = req.user!.sub;
    const borrow = await booksService.returnBook(userId, bookId);
    res.json(borrow);
  } catch (err) {
    next(err);
  }
}
