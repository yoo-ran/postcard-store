import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  productListResponseSchema,
  productQuerySchema,
} from '@/schemas/product.schema';

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

    const validated = productListResponseSchema.safeParse(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    );

    if (!validated.success) {
      console.error(
        '[GET /api/products] Response validation failed:',
        validated.error,
      );
      return NextResponse.json(
        { error: 'Unexpected data shape from database' },
        { status: 500 },
      );
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}
