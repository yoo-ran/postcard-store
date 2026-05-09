import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { productQuerySchema } from '@/schemas/product.schema';
import type { Product } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = productQuerySchema.safeParse({
    category: searchParams.get('category') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { category, limit } = parsed.data;

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(category && { category }),
      },
      ...(limit && { take: limit }),
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json<Product[]>(products);
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}
