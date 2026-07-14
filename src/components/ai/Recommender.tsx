// components/Recommender.tsx
'use client';

import { useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@prisma/client';
import RecommendationReason from '@/components/ai/RecommendationReason';

type RecommendedProduct = Product & { reason?: string };

export default function Recommender() {
  const [showResults, setShowResults] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
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
      setShowResults(true);
    } catch {
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isEmpty = status === 'done' && products.length === 0;

  return (
    <section className='mb-12'>
      <div className='flex items-center gap-2 mb-1'>
        <span className='text-xs font-semibold uppercase tracking-wide bg-gradient-to-r from-sky-600 to-blue-600 text-white px-2 py-0.5 rounded-full'>
          ✨ AI-Powered
        </span>
      </div>
      <h2 className='text-2xl font-medium mb-1'>AI Postcard Recommender</h2>
      <p className='text-muted-foreground text-sm mb-4'>
        Tell our AI what you&rsquo;re looking for. It&rsquo;ll instantly match
        you with the perfect postcards from our catalogue.
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

      <button
        onClick={() => setShowResults((prev) => !prev)}
        className='fixed bottom-2 right-2 z-50 bg-black text-white sm:px-2 sm:py-1 md:px-3 md:py-2 rounded-full shadow-lg sm:text-xs md:text-sm  hover:bg-gray-700 transition-colors'
      >
        {showResults ? 'Close ✕' : '✨ See the results'}
      </button>
      {/* Results */}
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          showResults ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
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
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4'>
              {products.map((p) => (
                <div key={p.id} className='flex flex-col'>
                  <ProductCard product={p} />
                  <RecommendationReason reason={p.reason} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
