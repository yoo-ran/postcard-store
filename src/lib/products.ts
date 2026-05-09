export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Aether Wireless Headphones',
    category: 'Audio',
    description:
      "Immerse yourself in crystalline sound with 40-hour battery life, adaptive noise cancellation, and premium memory foam ear cushions. The Aether delivers studio-grade audio in an impossibly light 210g frame. Whether you're commuting, working, or lost in music — silence the world on your terms.",
    price: 349,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'Obsidian Mechanical Keyboard',
    category: 'Computing',
    description:
      "Tactile, precise, and built to outlast everything else on your desk. The Obsidian features POM plate dampening, hot-swappable Gateron switches, and a full-aluminum chassis with per-key RGB. It's not just a keyboard — it's a statement.",
    price: 219,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    badge: 'New',
  },
  {
    id: '3',
    name: 'Lumen Desk Lamp',
    category: 'Lighting',
    description:
      'Tunable white light from 2700K warm to 6500K daylight, touch-dimming, and a wireless charging pad hidden in the base. Lumen adapts to your task and mood — morning focus, evening wind-down, or anything between.',
    price: 129,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
  },
  {
    id: '4',
    name: 'Nomad Camera Backpack',
    category: 'Bags',
    description:
      'Carry every lens, every cable, every creative impulse. The Nomad\'s modular divider system fits mirrorless and DSLR rigs, a 16" laptop, and a drone — all TSA-compliant. Weatherproof YKK zippers and an anti-theft lockback panel keep your gear safe anywhere on earth.',
    price: 189,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
  },
  {
    id: '5',
    name: 'Glacier Water Bottle',
    category: 'Lifestyle',
    description:
      "Triple-wall vacuum insulation keeps drinks ice-cold for 48 hours or piping hot for 24. The Glacier's wide-mouth design fits ice cubes and standard bottle brushes; the magnetic lid seals with a satisfying click. BPA-free, dishwasher safe, and made with 50% recycled steel.",
    price: 59,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
    badge: 'Eco Pick',
  },
  {
    id: '6',
    name: 'Phantom Smart Watch',
    category: 'Wearables',
    description:
      "A health command center on your wrist. ECG, SpO2, continuous HRV monitoring, sleep staging, and 15-day battery. The Phantom's AMOLED display reads perfectly in direct sunlight; its titanium case shrugs off salt water, sweat, and impact. Pairs seamlessly with iOS and Android.",
    price: 429,
    imageUrl:
      'https://d1r1t0ctsj0cph.cloudfront.net/test.jpg',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
