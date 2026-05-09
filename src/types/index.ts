import type { Product } from '@prisma/client';

export type { Product };

export type CartItem = {
  product: Product;
  quantity: number;
};
