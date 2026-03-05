import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

const prisma = new PrismaClient();

let librarianToken: string;
let memberToken: string;
let authorId: number;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';

  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/auth/register').send({ email: 'librarian@authors.test', password: 'password123', name: 'Librarian' });
  await prisma.user.update({ where: { email: 'librarian@authors.test' }, data: { role: 'LIBRARIAN' } });
  const libRes = await request(app).post('/auth/login').send({ email: 'librarian@authors.test', password: 'password123' });
  librarianToken = libRes.body.token;

  const memRes = await request(app).post('/auth/register').send({ email: 'member@authors.test', password: 'password123', name: 'Member' });
  memberToken = memRes.body.token;
});

afterAll(async () => {
  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /authors', () => {
  it('creates an author as LIBRARIAN', async () => {
    const res = await request(app)
      .post('/authors')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ firstName: 'Jane', lastName: 'Austen', birthYear: 1775 });
    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe('Jane');
    authorId = res.body.id;
  });

  it('returns 403 for MEMBER', async () => {
    const res = await request(app)
      .post('/authors')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ firstName: 'Test', lastName: 'Author' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/authors')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ firstName: 'NoLastName' });
    expect(res.status).toBe(400);
  });
});

describe('GET /authors', () => {
  it('returns list of authors', async () => {
    const res = await request(app).get('/authors').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.authors)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/authors');
    expect(res.status).toBe(401);
  });
});

describe('GET /authors/:id', () => {
  it('returns author by ID', async () => {
    const res = await request(app).get(`/authors/${authorId}`).set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(authorId);
  });

  it('returns 404 for non-existent author', async () => {
    const res = await request(app).get('/authors/999999').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /authors/:id', () => {
  it('updates an author as LIBRARIAN', async () => {
    const res = await request(app)
      .put(`/authors/${authorId}`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ bio: 'Famous English novelist.' });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('Famous English novelist.');
  });
});

describe('DELETE /authors/:id', () => {
  it('deletes an author as LIBRARIAN', async () => {
    const res = await request(app)
      .delete(`/authors/${authorId}`)
      .set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app).get(`/authors/${authorId}`).set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });
});
