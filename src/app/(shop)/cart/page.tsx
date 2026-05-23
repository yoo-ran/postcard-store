'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-32 text-center'>
        <span className='text-6xl mb-6'>🛒</span>
        <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
          Your cart is empty
        </h1>
        <p className='text-gray-500 mb-8'>
          Looks like you haven&apos;t added any postcards yet.
        </p>
        <Link
          href='/'
          className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium'
        >
          Browse Postcards
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <h1 className='text-3xl font-semibold text-gray-900 mb-8'>Your Cart</h1>

      <div className='divide-y divide-gray-100'>
        {items.map((item) => (
          <div key={item.id} className='flex gap-4 py-6'>
            {item.imageUrl && (
              <div className='relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0'>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className='object-cover w-full h-full'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>
            )}

            <div className='flex-1 min-w-0'>
              <h3 className='font-medium text-gray-900 truncate'>
                {item.name}
              </h3>
              <p className='text-sm text-gray-500 mt-0.5'>
                ${(item.price / 100).toFixed(2)} each
              </p>

              <div className='flex items-center gap-4 mt-3'>
                <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none'
                    aria-label='Decrease quantity'
                  >
                    −
                  </button>
                  <span className='w-8 text-center text-sm font-medium text-gray-900'>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className='w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none'
                    aria-label='Increase quantity'
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className='text-sm text-red-500 hover:text-red-700 transition-colors'
                >
                  Remove
                </button>
              </div>
            </div>

            <div className='text-right shrink-0'>
              <span className='font-semibold text-gray-900'>
                ${((item.price * item.quantity) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className='border-t border-gray-200 pt-6 mt-2'>
        <div className='flex items-center justify-between mb-6'>
          <span className='text-lg font-medium text-gray-900'>Order total</span>
          <span className='text-2xl font-semibold text-gray-900'>
            ${(totalPrice() / 100).toFixed(2)}
          </span>
        </div>

        <Link
          href='/checkout'
          className='block w-full bg-black text-white text-center py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors'
        >
          Proceed to Checkout
        </Link>

        <Link
          href='/'
          className='block w-full text-center text-sm text-gray-500 hover:text-gray-800 transition-colors mt-4'
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
