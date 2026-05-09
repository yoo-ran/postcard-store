'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@prisma/client';
import { useCartStore } from '@/store/cart.store';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const price = (product.price.toNumber() / 100).toFixed(2); // cents → dollars
  const { addItem } = useCartStore();

  return (
    <div className='group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow'>
      <Link href={`/products/${product.id}`}>
        <div className='relative aspect-[4/3] overflow-hidden bg-gray-100'>
          <Image
            src={product.imageUrl ?? '/placeholder.png'}
            alt={product.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
          />
        </div>
      </Link>
      <div className='p-4'>
        <span className='text-xs text-gray-400 uppercase tracking-wide'>
          {product.category}
        </span>
        <h3 className='font-medium text-gray-900 mt-1'>{product.name}</h3>
        <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
          {product.description}
        </p>
        <div className='flex items-center justify-between mt-4'>
          <span className='font-semibold text-gray-900'>${price}</span>
          <button
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.price.toNumber() / 100, // convert cents to dollars
                imageUrl: product.imageUrl, // ← add this
              })
            }
            className='bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors'
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
