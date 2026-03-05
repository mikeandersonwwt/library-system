import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/user.validator';

const prisma = new PrismaClient();

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 'This email address is already registered.', 409);
  }

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { email: input.email, password: hashed, name: input.name },
    select: { id: true, email: true, name: true, role: true },
  });

  const token = signToken(user);
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }

  const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  const token = signToken(safeUser);
  return { user: safeUser, token };
}

function signToken(user: { id: number; email: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  const expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as `${number}${'s' | 'm' | 'h' | 'd'}`;
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
}
