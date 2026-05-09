import { z } from 'zod';

export const productQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
