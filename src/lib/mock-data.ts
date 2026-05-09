import { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Paris at Sunset',
    description: 'Golden hour over the Seine — a timeless classic.',
    price: 499, // $4.99 in cents
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    stock: 50,
    category: 'travel',
  },
  {
    id: 'prod_2',
    name: 'Tokyo Neon Nights',
    description: 'Shibuya crossing alive with light and energy.',
    price: 499,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    stock: 35,
    category: 'travel',
  },
  {
    id: 'prod_3',
    name: 'Happy Birthday Balloons',
    description: 'Bright and cheerful — perfect for any birthday.',
    price: 349,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    stock: 80,
    category: 'birthday',
  },
  {
    id: 'prod_4',
    name: 'New York Skyline',
    description: 'Manhattan at midnight — the city that never sleeps.',
    price: 499,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    stock: 60,
    category: 'travel',
  },
  {
    id: 'prod_5',
    name: 'Thank You Florals',
    description: 'Delicate watercolour flowers for a heartfelt thank you.',
    price: 349,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    stock: 90,
    category: 'thank-you',
  },
  {
    id: 'prod_6',
    name: 'Vintage London',
    description: 'Red telephone boxes and black cabs — classic London.',
    price: 499,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    stock: 45,
    category: 'travel',
  },
];
