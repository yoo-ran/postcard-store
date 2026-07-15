import { z } from 'zod';

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const checkoutCartSchema = z.object({
  cartItems: z
    .array(lineItemSchema)
    .min(1, 'Cart must contain at least one item'),
  currency: z.string().optional().default('usd'),
});

export type CheckoutCartPayload = z.infer<typeof checkoutCartSchema>;
