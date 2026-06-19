'use client';

import dynamic from 'next/dynamic';

const Recommender = dynamic(() => import('@/components/ai/Recommender'), {
  ssr: false,
});

export default Recommender;
