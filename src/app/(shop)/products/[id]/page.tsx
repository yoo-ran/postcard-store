import { notFound } from 'next/navigation';
import type { Product } from '@prisma/client';
import ProductDetail from './ProductDetail';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
      cache: 'no-store',
    });

    if (res.status === 404) return null;

    if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);

    return res.json();
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
