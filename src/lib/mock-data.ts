import { Product } from '@/types'

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Paris at Sunset',
    description: 'Golden hour over the Seine — a timeless classic.',
    price: 499, // $4.99 in cents
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
    stock: 50,
    category: 'travel'
  },
  {
    id: 'prod_2',
    name: 'Tokyo Neon Nights',
    description: 'Shibuya crossing alive with light and energy.',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    stock: 35,
    category: 'travel'
  },
  {
    id: 'prod_3',
    name: 'Happy Birthday Balloons',
    description: 'Bright and cheerful — perfect for any birthday.',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
    stock: 80,
    category: 'birthday'
  },
  {
    id: 'prod_4',
    name: 'New York Skyline',
    description: 'Manhattan at midnight — the city that never sleeps.',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    stock: 60,
    category: 'travel'
  },
  {
    id: 'prod_5',
    name: 'Thank You Florals',
    description: 'Delicate watercolour flowers for a heartfelt thank you.',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88df5691cc10?w=400',
    stock: 90,
    category: 'thank-you'
  },
  {
    id: 'prod_6',
    name: 'Vintage London',
    description: 'Red telephone boxes and black cabs — classic London.',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    stock: 45,
    category: 'travel'
  }
]