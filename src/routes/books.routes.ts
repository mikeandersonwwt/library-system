import { Router } from 'express';
import * as booksController from '../controllers/books.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, booksController.getBooks);
router.get('/:id', authenticate, booksController.getBook);
router.post('/', authenticate, requireRole('LIBRARIAN'), booksController.createBook);
router.put('/:id', authenticate, requireRole('LIBRARIAN'), booksController.updateBook);
router.delete('/:id', authenticate, requireRole('LIBRARIAN'), booksController.deleteBook);
router.post('/:id/borrow', authenticate, requireRole('MEMBER', 'LIBRARIAN'), booksController.borrowBook);
router.post('/:id/return', authenticate, requireRole('MEMBER', 'LIBRARIAN'), booksController.returnBook);

export default router;
