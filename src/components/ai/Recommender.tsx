// components/Recommender.tsx
'use client';

import { useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@prisma/client';

export default function Recommender() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  );

  async function handleSubmit() {
    if (!query.trim()) return;
    setStatus('loading');
    setProducts([]);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (res.status === 429) {
        setStatus('error');
        return;
      }

      const data = await res.json();
      setProducts(data.recommendations ?? []);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isEmpty = status === 'done' && products.length === 0;

  return (
    <section className='mb-12'>
      <h2 className='text-2xl font-medium mb-1'>Find your perfect postcard</h2>
      <p className='text-muted-foreground text-sm mb-4'>
        Describe what you&rsquo;re looking for and AI will match it to our
        catalogue.
      </p>

      <div className='flex gap-2 mb-6'>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
          placeholder="e.g. something funny for my mum's birthday"
          disabled={isLoading}
          className='flex-1 h-10 px-3 border rounded-md text-sm bg-background'
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !query.trim()}
          className='h-10 px-4 border rounded-md text-sm flex items-center gap-2 disabled:opacity-40'
        >
          {isLoading ? (
            <>
              <span className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
              Finding…
            </>
          ) : (
            'Find'
          )}
        </button>
      </div>

      {isLoading && (
        <div className='flex justify-center py-10'>
          <span className='w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin' />
        </div>
      )}

      {isEmpty && (
        <p className='text-center text-muted-foreground py-10 text-sm'>
          No matches found, try a different description
        </p>
      )}

      {status === 'error' && (
        <p className='text-center text-muted-foreground py-10 text-sm'>
          Something went wrong — please try again
        </p>
      )}

      {products.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {products.map((p: (typeof products)[number]) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
