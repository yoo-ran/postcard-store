'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { totalItems } = useCartStore();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
            Cart ({mounted ? totalItems() : 0})
          </Link>
          <Link href='/orders'>Orders</Link>

          {status === 'authenticated' ? (
            <div className='flex items-center gap-4'>
              <span className='text-sm text-gray-600'>
                {session.user?.name ?? session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className='text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800'
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href='/login'
              className='text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800'
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
