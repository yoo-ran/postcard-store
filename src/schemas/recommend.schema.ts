import { z } from "zod";

export const aiRecommendRequestSchema = z.object({
  query: z.string().min(1),
});

export const aiRecommendResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      productId: z.string(),
      reason: z.string(),
    })
  ),
});