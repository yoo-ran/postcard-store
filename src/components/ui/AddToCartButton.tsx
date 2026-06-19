'use client';

import { useState } from 'react';
import type { Product } from '@prisma/client';
import { useCartStore } from '@/store/cart.store';

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
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
  );
}
