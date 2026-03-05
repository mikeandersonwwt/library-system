import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

const prisma = new PrismaClient();

let librarianToken: string;
let memberToken: string;
let memberId: number;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';

  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/auth/register').send({ email: 'librarian@users.test', password: 'password123', name: 'Librarian' });
  await prisma.user.update({ where: { email: 'librarian@users.test' }, data: { role: 'LIBRARIAN' } });
  const libRes = await request(app).post('/auth/login').send({ email: 'librarian@users.test', password: 'password123' });
  librarianToken = libRes.body.token;

  const memRes = await request(app).post('/auth/register').send({ email: 'member@users.test', password: 'password123', name: 'Test Member' });
  memberToken = memRes.body.token;
  memberId = memRes.body.user.id;
});

afterAll(async () => {
  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('GET /users/me', () => {
  it('returns current user profile', async () => {
    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('member@users.test');
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /users/me/borrows', () => {
  it('returns empty borrow list for new user', async () => {
    const res = await request(app).get('/users/me/borrows').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.borrows)).toBe(true);
    expect(res.body.borrows).toHaveLength(0);
  });
});

describe('GET /users', () => {
  it('returns all users for LIBRARIAN', async () => {
    const res = await request(app).get('/users').set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('returns 403 for MEMBER', async () => {
    const res = await request(app).get('/users').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /users/:id', () => {
  it('returns user by ID for LIBRARIAN', async () => {
    const res = await request(app).get(`/users/${memberId}`).set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(memberId);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 403 for MEMBER', async () => {
    const res = await request(app).get(`/users/${memberId}`).set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app).get('/users/999999').set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /users/:id', () => {
  it('updates a user as LIBRARIAN', async () => {
    const res = await request(app)
      .put(`/users/${memberId}`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('returns 403 for MEMBER', async () => {
    const res = await request(app)
      .put(`/users/${memberId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Hack' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /users/:id', () => {
  it('returns 403 for MEMBER', async () => {
    const res = await request(app)
      .delete(`/users/${memberId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('deletes a user as LIBRARIAN', async () => {
    const res = await request(app)
      .delete(`/users/${memberId}`)
      .set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app).get(`/users/${memberId}`).set('Authorization', `Bearer ${librarianToken}`);
    expect(res.status).toBe(404);
  });
});
