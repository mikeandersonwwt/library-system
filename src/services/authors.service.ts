import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateAuthorInput, UpdateAuthorInput } from '../validators/author.validator';

const prisma = new PrismaClient();

export async function getAllAuthors() {
  return prisma.author.findMany({ orderBy: { lastName: 'asc' } });
}

export async function getAuthorById(id: number) {
  const author = await prisma.author.findUnique({
    where: { id },
    include: {
      books: {
        include: { book: { select: { id: true, title: true, genre: true } } },
      },
    },
  });
  if (!author) throw new AppError('NOT_FOUND', 'Author not found.', 404);
  return author;
}

export async function createAuthor(input: CreateAuthorInput) {
  return prisma.author.create({ data: input });
}

export async function updateAuthor(id: number, input: UpdateAuthorInput) {
  const existing = await prisma.author.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Author not found.', 404);
  return prisma.author.update({ where: { id }, data: input });
}

export async function deleteAuthor(id: number) {
  const existing = await prisma.author.findUnique({ where: { id } });
  if (!existing) throw new AppError('NOT_FOUND', 'Author not found.', 404);
  await prisma.author.delete({ where: { id } });
}
