import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1),
  isbn: z.string().min(10).max(13),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
  genre: z.string().min(1),
  synopsis: z.string().optional(),
  totalCopies: z.number().int().min(1),
  authorIds: z.array(z.number().int().positive()).min(1),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
