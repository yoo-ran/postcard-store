import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;

const products: Prisma.ProductCreateInput[] = [
  {
    name: 'Summer in Kits',
    slug: 'postcard-01',
    price: 499,
    stock: 100,
    description:
      '🏖️ Golden hour at Kitsilano Beach — sun-warmed sand, sparkling ocean, and mountain views in the distance. Send a little slice of Vancouver summer to someone who needs it.',
    imageUrl: `${CLOUDFRONT_URL}/postcard-01.jpg`,
    category: 'travel',
  },
  {
    name: 'Autumn in the Lake',
    slug: 'postcard-02',
    price: 499,
    stock: 100,
    description:
      "🍂 Golden leaves mirrored on still water, misty mornings, and the quiet beauty of fall by the lakeside. A serene autumn scene to warm up someone's mailbox.",
    imageUrl: `${CLOUDFRONT_URL}/postcard-02.jpg`,
    category: 'seasonal',
  },
  {
    name: 'Childhood Memories',
    slug: 'postcard-03',
    price: 499,
    stock: 100,
    description:
      '🎈 A nostalgic scene that takes you back to simpler days — scraped knees, endless summers, and afternoons that felt like forever. Perfect for old friends and family.',
    imageUrl: `${CLOUDFRONT_URL}/postcard-03.jpg`,
    category: 'nostalgia',
  },
  {
    name: 'Peaceful Afternoon',
    slug: 'postcard-04',
    price: 499,
    stock: 100,
    description:
      '☕ A quiet, calming moment captured on paper — soft light, slow time, and nowhere to be. Send someone a little serenity in the middle of their busy week.',
    imageUrl: `${CLOUDFRONT_URL}/postcard-04.jpg`,
    category: 'calm',
  },
  {
    name: 'Postcard Package (Set of 8)',
    slug: 'postcard-05',
    price: 3800,
    stock: 100,
    description:
      '📦 The complete collection — eight postcards in one bundle at a better price. Stock up for every occasion, from travel greetings to just-because notes.',
    imageUrl: `${CLOUDFRONT_URL}/postcard-05.jpg`,
    category: 'bundle',
  },
  {
    name: 'Postcard Package (Set of 4)',
    slug: 'postcard-06',
    price: 2000,
    stock: 100,
    description:
      '💌 A curated set of four favourite designs — great as a thoughtful gift or a starter pack for your own snail-mail habit.',
    imageUrl: `${CLOUDFRONT_URL}/postcard-06.jpg`,
    category: 'bundle',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log('✅ Successfully Seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
