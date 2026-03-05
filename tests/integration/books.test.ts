import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

const prisma = new PrismaClient();

let librarianToken: string;
let memberToken: string;
let bookId: number;
let authorId: number;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';

  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  const libRes = await request(app).post('/auth/register').send({
    email: 'librarian@books.test',
    password: 'password123',
    name: 'Test Librarian',
  });
  await prisma.user.update({ where: { email: 'librarian@books.test' }, data: { role: 'LIBRARIAN' } });
  const loginRes = await request(app).post('/auth/login').send({ email: 'librarian@books.test', password: 'password123' });
  librarianToken = loginRes.body.token;

  const memberRes = await request(app).post('/auth/register').send({
    email: 'member@books.test',
    password: 'password123',
    name: 'Test Member',
  });
  memberToken = memberRes.body.token;

  const author = await prisma.author.create({ data: { firstName: 'Test', lastName: 'Author' } });
  authorId = author.id;
});

afterAll(async () => {
  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('GET /books', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/books');
    expect(res.status).toBe(401);
  });

  it('returns list of books with token', async () => {
    const res = await request(app).get('/books').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.books)).toBe(true);
  });
});

describe('POST /books', () => {
  it('returns 403 for MEMBER', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Test', isbn: '1234567890', publishedYear: 2020, genre: 'Fiction', totalCopies: 1, authorIds: [authorId] });
    expect(res.status).toBe(403);
  });

  it('creates a book as LIBRARIAN', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: 'Integration Book', isbn: 'INT0000001', publishedYear: 2021, genre: 'Mystery', totalCopies: 3, authorIds: [authorId] });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Integration Book');
    expect(res.body.availableCopies).toBe(3);
    bookId = res.body.id;
  });

  it('returns 409 for duplicate ISBN', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: 'Dup', isbn: 'INT0000001', publishedYear: 2021, genre: 'Mystery', totalCopies: 1, authorIds: [authorId] });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ISBN_TAKEN');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: 'No ISBN' });
    expect(res.status).toBe(400);
  });
});

describe('GET /books/:id', () => {
  it('returns book by ID', async () => {
    const res = await request(app).get(`/books/${bookId}`).set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(bookId);
  });

  it('returns 404 for non-existent book', async () => {
    const res = await request(app).get('/books/999999').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /books/:id', () => {
  it('updates a book as LIBRARIAN', async () => {
    const res = await request(app)
      .put(`/books/${bookId}`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: 'Updated Title', isbn: 'INT0000001', publishedYear: 2022, genre: 'Thriller', totalCopies: 2, authorIds: [authorId] });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('returns 403 for MEMBER', async () => {
    const res = await request(app)
      .put(`/books/${bookId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Hack', isbn: 'INT0000001', publishedYear: 2022, genre: 'Thriller', totalCopies: 2, authorIds: [authorId] });
    expect(res.status).toBe(403);
  });
});

describe('POST /books/:id/borrow and /return', () => {
  it('borrows a book successfully', async () => {
    const res = await request(app)
      .post(`/books/${bookId}/borrow`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(201);
    expect(res.body.bookId).toBe(bookId);
    expect(res.body.returnedAt).toBeNull();
  });

  it('returns a borrowed book successfully', async () => {
    const res = await request(app)
      .post(`/books/${bookId}/return`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.returnedAt).not.toBeNull();
  });

  it('returns 404 when returning a book not borrowed', async () => {
    const res = await request(app)
      .post(`/books/${bookId}/return`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 409 when no copies available', async () => {
    await prisma.book.update({ where: { id: bookId }, data: { availableCopies: 0 } });
    const res = await request(app)
      .post(`/books/${bookId}/borrow`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('BOOK_UNAVAILABLE');
    await prisma.book.update({ where: { id: bookId }, data: { availableCopies: 2 } });
  });
});

describe('DELETE /books/:id', () => {
  it('returns 403 for MEMBER', async () => {
    const res = await request(app)
      .delete(`/books/${bookId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('deletes a book as LIBRARIAN', async () => {
    const res = await request(app)
      .delete(`/books/${bookId}`)
      .set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app).get(`/books/${bookId}`).set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });
});
