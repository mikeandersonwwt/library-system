import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { UpdateUserInput } from '../validators/user.validator';

const prisma = new PrismaClient();

const safeSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function getAllUsers() {
  return prisma.user.findMany({ select: safeSelect, orderBy: { name: 'asc' } });
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: safeSelect });
  if (!user) throw new AppError('NOT_FOUND', 'User not found.', 404);
  return user;
}

export async function updateUser(id: number, input: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'User not found.', 404);
  return prisma.user.update({ where: { id }, data: input, select: safeSelect });
}

export async function deleteUser(id: number) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'User not found.', 404);
  await prisma.user.delete({ where: { id } });
}

export async function getUserBorrows(userId: number, activeOnly?: boolean) {
  return prisma.borrow.findMany({
    where: {
      userId,
      ...(activeOnly ? { returnedAt: null } : {}),
    },
    include: { book: { select: { id: true, title: true, isbn: true, genre: true } } },
    orderBy: { borrowedAt: 'desc' },
  });
}
