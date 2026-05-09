import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { productResponseSchema } from '@/schemas/product.schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 },
      );
    }
    const validated = productResponseSchema.safeParse({
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });

    if (!validated.success) {
      console.error(
        '[GET /api/products/[id]] Response validation failed:',
        validated.error,
      );
      return NextResponse.json(
        { error: 'Unexpected data shape from database' },
        { status: 500 },
      );
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}
