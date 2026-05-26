'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart.store';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    console.log('cart items:', items); // add this

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price, // store is in cents, Stripe schema expects dollars
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to connect to checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#F7F6F3]'>
      <div className='text-center max-w-sm'>
        <p className='text-[80px] font-bold text-[#E0DDD8] leading-none mb-4 select-none'>
          🛒
        </p>
        <h1 className='text-2xl font-bold text-[#1A1916] mb-3 tracking-tight'>
          Checkout
        </h1>

        {items.length === 0 ? (
          <p className='text-[#8B8680] text-sm'>
            Your cart is empty. Add some items before checking out.
          </p>
        ) : (
          <>
            <p className='text-[#8B8680] text-sm mb-6'>
              {items.length} item{items.length > 1 ? 's' : ''} &mdash; $
              {totalPrice().toFixed(2)}
            </p>

            {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className='w-full bg-[#1A1916] text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-[#2d2b28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? 'Processing...' : 'Pay with Stripe'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
