import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@prisma/client';
import { auth, signIn, signOut } from '@/auth';
import RecommenderWidget from '@/components/ai/RecommenderWidget';
import prisma from '@/lib/prisma';

async function getProducts(): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error(
      `Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      
      <div className='mb-8'>
        <h1 className='text-3xl font-semibold text-gray-900'>Our Postcards</h1>
        <p className='text-gray-500 mt-2'>
          Handpicked cards for every occasion
        </p>
      </div>
      {products.length === 0 ? (
        <p className='text-gray-500'>No products found.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map((product: (typeof products)[number]) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <RecommenderWidget />
    </div>
  );
}
