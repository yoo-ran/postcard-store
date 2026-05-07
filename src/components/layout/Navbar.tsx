'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const items = useCartStore((s) => s.items); // ← select items, not totalItems

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className='sticky top-0 z-50 border-b border-gray-200 bg-white'>
      <div className='mx-auto max-w-6xl px-4 py-4 flex items-center justify-between'>
        <Link href='/' className='text-xl font-semibold tracking-tight'>
          🗺️ Postcard Store
        </Link>
        <div className='flex items-center gap-6'>
          <Link href='/' className='text-sm text-gray-600 hover:text-black'>
            Shop
          </Link>
          <Link href='/cart' className='text-sm text-gray-600 hover:text-black'>
            Cart ({mounted ? items.length : 0})
          </Link>
          <Link
            href='/login'
            className='text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800'
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
