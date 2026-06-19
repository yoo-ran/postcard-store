import { notFound } from 'next/navigation';
import type { Product } from '@prisma/client';
import prisma from '@/lib/prisma';
import ProductDetail from './ProductDetail';

interface Props {
  params: Promise<{ id: string }>;
}
export const dynamic = 'force-dynamic';

async function getProduct(id: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('[ProductPage] getProduct:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} — Shop`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
