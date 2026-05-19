import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL 

const products: Prisma.ProductCreateInput[] = [
  {
    name: 'Postcard 1',
    slug: 'postcard-01',
    price: 499,
    stock: 100,
    imageUrl: `${CLOUDFRONT_URL}/postcard-01.jpg`,
    category: 'travel',
  },
  {
    name: 'Postcard 2',
    slug: 'postcard-02',
    price: 499,
    stock: 100,
    imageUrl: `${CLOUDFRONT_URL}/postcard-02.jpg`,
    category: 'paris',
  },
  {
    name: 'Postcard 3',
    slug: 'postcard-03',
    price: 499,
    stock: 100,
    imageUrl: `${CLOUDFRONT_URL}/postcard-03.jpg`,
    category: 'postcards',
  },
  {
    name: 'Postcard 4',
    slug: 'postcard-04',
    price: 499,
    stock: 100,
    imageUrl: `${CLOUDFRONT_URL}/postcard-04.jpg`,
    category: 'postcards',
  },
  {
    name: 'Postcard 5',
    slug: 'postcard-05',
    price: 499,
    stock: 100,
    imageUrl: `${CLOUDFRONT_URL}/postcard-05.jpg`,
    category: 'postcards',
  },
  {
    name: 'Postcard 6',
    slug: 'postcard-06',
    price: 499,
    stock: 100,
    imageUrl: `${CLOUDFRONT_URL}/postcard-06.jpg`,
    category: 'postcards',
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
