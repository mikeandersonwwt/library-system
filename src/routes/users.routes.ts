import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.get('/me/borrows', authenticate, usersController.getMyBorrows);
router.get('/', authenticate, requireRole('LIBRARIAN'), usersController.getUsers);
router.get('/:id', authenticate, requireRole('LIBRARIAN'), usersController.getUser);
router.put('/:id', authenticate, requireRole('LIBRARIAN'), usersController.updateUser);
router.delete('/:id', authenticate, requireRole('LIBRARIAN'), usersController.deleteUser);

export default router;
