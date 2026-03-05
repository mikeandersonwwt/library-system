import { z } from 'zod';

export const createAuthorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().optional(),
  birthYear: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
