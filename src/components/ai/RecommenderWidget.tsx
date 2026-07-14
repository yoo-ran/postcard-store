// src/components/ai/RecommenderWidget.tsx
'use client';

import { useState } from 'react';
import Recommender from '@/components/ai/Recommender';

export default function RecommenderWidget() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Collapsed button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full shadow-black/50 shadow-lg text-sm hover:bg-gray-700 transition-all duration-300 ${
          open
            ? 'opacity-0 scale-75 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        ✨ AI Recommender
      </button>

      {/* Panel */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-white/90 p-4 shadow-lg shadow-black w-[90%] max-w-md lg:max-w-1/2 max-h-[80vh] overflow-y-auto transition-all duration-300 origin-top ${
          open
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className='absolute top-2 right-2 p-1 text-gray-500 hover:text-black lg:text-xl'
          aria-label='Close recommender'
        >
          ✕
        </button>
        <Recommender />
      </div>
    </>
  );
}
