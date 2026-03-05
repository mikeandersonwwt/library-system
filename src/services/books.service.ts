import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateBookInput, UpdateBookInput } from '../validators/book.validator';

const prisma = new PrismaClient();

export async function getAllBooks(genre?: string, search?: string) {
  return prisma.book.findMany({
    where: {
      ...(genre ? { genre: { contains: genre } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { authors: { some: { author: { firstName: { contains: search } } } } },
              { authors: { some: { author: { lastName: { contains: search } } } } },
            ],
          }
        : {}),
    },
    include: {
      authors: { include: { author: true } },
    },
    orderBy: { title: 'asc' },
  });
}

export async function getBookById(id: number) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: { authors: { include: { author: true } } },
  });
  if (!book) throw new AppError('NOT_FOUND', 'Book not found.', 404);
  return book;
}

export async function createBook(input: CreateBookInput) {
  const { authorIds, ...bookData } = input;

  const existing = await prisma.book.findUnique({ where: { isbn: bookData.isbn } });
  if (existing) throw new AppError('ISBN_TAKEN', 'A book with this ISBN already exists.', 409);

  return prisma.book.create({
    data: {
      ...bookData,
      availableCopies: bookData.totalCopies,
      authors: { create: authorIds.map((id) => ({ authorId: id })) },
    },
    include: { authors: { include: { author: true } } },
  });
}

export async function updateBook(id: number, input: UpdateBookInput) {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Book not found.', 404);

  const { authorIds, ...bookData } = input;

  return prisma.book.update({
    where: { id },
    data: {
      ...bookData,
      ...(authorIds
        ? {
            authors: {
              deleteMany: {},
              create: authorIds.map((aid) => ({ authorId: aid })),
            },
          }
        : {}),
    },
    include: { authors: { include: { author: true } } },
  });
}

export async function deleteBook(id: number) {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Book not found.', 404);
  await prisma.book.delete({ where: { id } });
}

export async function borrowBook(userId: number, bookId: number) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new AppError('NOT_FOUND', 'Book not found.', 404);
  if (book.availableCopies < 1) {
    throw new AppError('BOOK_UNAVAILABLE', 'No copies of this book are currently available.', 409);
  }

  const activeBorrows = await prisma.borrow.count({
    where: { userId, returnedAt: null },
  });
  if (activeBorrows >= 3) {
    throw new AppError('BORROW_LIMIT_REACHED', 'You have reached the maximum of 3 active borrows.', 422);
  }

  const borrowedAt = new Date();
  const dueAt = new Date(borrowedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [borrow] = await prisma.$transaction([
    prisma.borrow.create({ data: { userId, bookId, borrowedAt, dueAt } }),
    prisma.book.update({ where: { id: bookId }, data: { availableCopies: { decrement: 1 } } }),
  ]);

  return borrow;
}

export async function returnBook(userId: number, bookId: number) {
  const borrow = await prisma.borrow.findFirst({
    where: { userId, bookId, returnedAt: null },
  });
  if (!borrow) {
    throw new AppError('NOT_FOUND', 'No active borrow record found for this book.', 404);
  }

  const [updatedBorrow] = await prisma.$transaction([
    prisma.borrow.update({
      where: { id: borrow.id },
      data: { returnedAt: new Date() },
    }),
    prisma.book.update({ where: { id: bookId }, data: { availableCopies: { increment: 1 } } }),
  ]);

  return updatedBorrow;
}
