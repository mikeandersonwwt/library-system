import { Router } from 'express';
import * as authorsController from '../controllers/authors.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, authorsController.getAuthors);
router.get('/:id', authenticate, authorsController.getAuthor);
router.post('/', authenticate, requireRole('LIBRARIAN'), authorsController.createAuthor);
router.put('/:id', authenticate, requireRole('LIBRARIAN'), authorsController.updateAuthor);
router.delete('/:id', authenticate, requireRole('LIBRARIAN'), authorsController.deleteAuthor);

export default router;
