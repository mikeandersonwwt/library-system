import { Request } from 'express';

export type Role = 'MEMBER' | 'LIBRARIAN';

export interface AuthPayload {
  sub: number;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}
