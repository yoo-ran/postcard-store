'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import type { Product } from '@prisma/client';
import { formatPrice } from '@/lib/format-price';

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({
      ...product,
      price: Number(product.price),
      imageUrl: product.imageUrl ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <main className='min-h-screen bg-[#F7F6F3]'>
      {/* Breadcrumb */}
      <nav className='max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2'>
        <ol className='flex items-center gap-2 text-xs text-[#8B8680] font-medium tracking-wide uppercase'>
          <li>
            <Link href='/' className='hover:text-[#1A1916] transition-colors'>
              Home
            </Link>
          </li>
          <li className='text-[#C9C5BF]'>/</li>
          <li>
            <Link
              href='/products'
              className='hover:text-[#1A1916] transition-colors'
            >
              Products
            </Link>
          </li>
          <li className='text-[#C9C5BF]'>/</li>
          <li className='text-[#1A1916] truncate max-w-[160px]'>
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Detail card */}
      <section className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        <div className='bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EBEBEB] grid grid-cols-1 md:grid-cols-2'>
          {/* Image */}
          <div className='relative w-full aspect-square bg-[#F0EEE9] overflow-hidden'>
            {product.badge && (
              <span className='absolute top-5 left-5 z-10 bg-[#1A1916] text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full'>
                {product.badge}
              </span>
            )}
            <Image
              src={product.imageUrl ?? '/placeholder.png'}
              alt={product.name}
              fill
              className='object-cover'
              priority
              sizes='(max-width: 768px) 100vw, 50vw'
            />
          </div>

          {/* Info */}
          <div className='flex flex-col justify-between p-8 sm:p-10 md:p-12'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#A09A93] mb-3'>
                {product.category}
              </p>

              <h1 className='text-3xl sm:text-4xl font-bold text-[#1A1916] leading-tight mb-6 tracking-tight'>
                {product.name}
              </h1>

              <p className='text-[#5C5752] text-base leading-relaxed mb-8'>
                {product.description}
              </p>

              {/* Divider */}
              <div className='w-12 h-px bg-[#E0DDD8] mb-8' />

              {/* Features row */}
              <div className='grid grid-cols-3 gap-3 mb-8'>
                {[
                  { icon: '✦', label: 'Free shipping' },
                  { icon: '↩', label: '30-day returns' },
                  { icon: '◎', label: '2-year warranty' },
                ].map((f) => (
                  <div
                    key={f.label}
                    className='flex flex-col items-center gap-1.5 text-center p-3 rounded-2xl bg-[#F7F6F3]'
                  >
                    <span className='text-sm text-[#8B8680]'>{f.icon}</span>
                    <span className='text-[10px] font-medium text-[#8B8680] leading-tight'>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div>
              <div className='flex items-baseline gap-3 mb-6'>
                <span className='text-4xl font-bold text-[#1A1916] tracking-tight'>
                  {formatPrice(Number(product.price))}
                </span>
                <span className='text-sm text-[#A09A93]'>CAD</span>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 ${
                  added
                    ? 'bg-[#2D6A4F] text-white scale-[0.98]'
                    : 'bg-[#1A1916] text-white hover:bg-[#2D2C2A] active:scale-[0.97]'
                }`}
              >
                {added ? '✓  Added to Cart' : 'Add to Cart'}
              </button>

              <Link
                href='/'
                className='block text-center mt-4 text-sm text-[#A09A93] hover:text-[#1A1916] transition-colors'
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
