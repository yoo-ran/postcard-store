'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

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
              <span className='text- text-sky-600'>
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
            <div className='flex items-center gap-2'>
              <Link
                href='/login'
                className='text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800'
              >
                Sign in
              </Link>
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className='text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2'
              >
                <svg width='16' height='16' viewBox='0 0 24 24'>
                  <path
                    fill='#4285F4'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#34A853'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='#EA4335'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Google
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
