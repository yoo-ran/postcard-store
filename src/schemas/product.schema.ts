import { z } from 'zod';

export const productQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  stock: z.number(),
  imageUrl: z.string().nullable(),
  category: z.string().nullable(),
  badge: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productListResponseSchema = z.array(productResponseSchema);
