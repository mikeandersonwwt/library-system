import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';
});

afterAll(async () => {
  await prisma.borrow.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /auth/register', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'newuser@test.com',
      password: 'password123',
      name: 'New User',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@test.com');
    expect(res.body.user.role).toBe('MEMBER');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 409 when email already registered', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'newuser@test.com',
      password: 'password123',
      name: 'Duplicate',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'short@test.com',
      password: 'short',
      name: 'Short Pass',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
      name: 'Bad Email',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'newuser@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('newuser@test.com');
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'newuser@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 with unknown email', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'nobody@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});
