import { PrismaClient } from '@prisma/client';
import * as booksService from '../../src/services/books.service';
import { AppError } from '../../src/middleware/errorHandler';

const prisma = new PrismaClient();

describe('BooksService — borrow logic', () => {
  let userId: number;
  let bookId: number;
  let authorId: number;

  beforeAll(async () => {
    await prisma.borrow.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();

    const author = await prisma.author.create({
      data: { firstName: 'Test', lastName: 'Author' },
    });
    authorId = author.id;

    const user = await prisma.user.create({
      data: { email: 'testuser@unit.com', password: 'hashed', name: 'Test User', role: 'MEMBER' },
    });
    userId = user.id;

    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        isbn: 'UNIT0000001',
        publishedYear: 2020,
        genre: 'Fiction',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId }] },
      },
    });
    bookId = book.id;
  });

  afterAll(async () => {
    await prisma.borrow.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.borrow.deleteMany();
    await prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: 2 },
    });
  });

  it('creates a borrow record with correct dueAt (14 days)', async () => {
    const borrow = await booksService.borrowBook(userId, bookId);
    expect(borrow.userId).toBe(userId);
    expect(borrow.bookId).toBe(bookId);
    expect(borrow.returnedAt).toBeNull();

    const diff = borrow.dueAt.getTime() - borrow.borrowedAt.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    expect(days).toBeCloseTo(14, 0);
  });

  it('decrements availableCopies on borrow', async () => {
    await booksService.borrowBook(userId, bookId);
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    expect(book!.availableCopies).toBe(1);
  });

  it('throws 409 when no copies available', async () => {
    await prisma.book.update({ where: { id: bookId }, data: { availableCopies: 0 } });
    await expect(booksService.borrowBook(userId, bookId)).rejects.toMatchObject({
      code: 'BOOK_UNAVAILABLE',
      status: 409,
    });
  });

  it('throws 422 when borrow limit of 3 is reached', async () => {
    const books = await Promise.all([
      prisma.book.create({
        data: { title: 'B2', isbn: 'UNIT0000002', publishedYear: 2020, genre: 'Fiction', totalCopies: 3, availableCopies: 3, authors: { create: [{ authorId }] } },
      }),
      prisma.book.create({
        data: { title: 'B3', isbn: 'UNIT0000003', publishedYear: 2020, genre: 'Fiction', totalCopies: 3, availableCopies: 3, authors: { create: [{ authorId }] } },
      }),
      prisma.book.create({
        data: { title: 'B4', isbn: 'UNIT0000004', publishedYear: 2020, genre: 'Fiction', totalCopies: 3, availableCopies: 3, authors: { create: [{ authorId }] } },
      }),
    ]);

    await booksService.borrowBook(userId, books[0].id);
    await booksService.borrowBook(userId, books[1].id);
    await booksService.borrowBook(userId, books[2].id);

    await expect(booksService.borrowBook(userId, bookId)).rejects.toMatchObject({
      code: 'BORROW_LIMIT_REACHED',
      status: 422,
    });

    await prisma.borrow.deleteMany();
    await prisma.bookAuthor.deleteMany({ where: { bookId: { in: books.map((b) => b.id) } } });
    await prisma.book.deleteMany({ where: { id: { in: books.map((b) => b.id) } } });
  });

  it('returns a book and increments availableCopies', async () => {
    await booksService.borrowBook(userId, bookId);
    const borrow = await booksService.returnBook(userId, bookId);
    expect(borrow.returnedAt).not.toBeNull();

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    expect(book!.availableCopies).toBe(2);
  });

  it('throws 404 when returning a book not borrowed', async () => {
    await expect(booksService.returnBook(userId, bookId)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});

describe('BooksService — CRUD', () => {
  let authorId: number;

  beforeAll(async () => {
    await prisma.borrow.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();

    const author = await prisma.author.create({
      data: { firstName: 'CRUD', lastName: 'Author' },
    });
    authorId = author.id;
  });

  afterAll(async () => {
    await prisma.borrow.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.$disconnect();
  });

  it('creates a book with availableCopies equal to totalCopies', async () => {
    const book = await booksService.createBook({
      title: 'New Book',
      isbn: 'CRUD0000001',
      publishedYear: 2021,
      genre: 'Mystery',
      totalCopies: 3,
      authorIds: [authorId],
    });
    expect(book.availableCopies).toBe(3);
    expect(book.totalCopies).toBe(3);
  });

  it('throws 409 on duplicate ISBN', async () => {
    await expect(
      booksService.createBook({
        title: 'Duplicate',
        isbn: 'CRUD0000001',
        publishedYear: 2021,
        genre: 'Mystery',
        totalCopies: 1,
        authorIds: [authorId],
      })
    ).rejects.toMatchObject({ code: 'ISBN_TAKEN', status: 409 });
  });

  it('throws 404 when getting a non-existent book', async () => {
    await expect(booksService.getBookById(999999)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('throws 404 when deleting a non-existent book', async () => {
    await expect(booksService.deleteBook(999999)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});
