import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@prisma/client';
import { auth, signIn, signOut } from '@/auth';
import Recommender from '@/components/ai/Recommender';

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://localhost:3000/api/products', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(
      `Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const session = await auth();

  return (
    <div>
      {session ? (
        <>
          <p>Signed in as {session.user?.email}</p>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button type='submit'>Sign out</button>
          </form>
        </>
      ) : (
        <form
          action={async () => {
            'use server';
            await signIn('google');
          }}
        >
          <button type='submit'>Sign in with Google</button>
        </form>
      )}
      <div className='mb-8'>
        <h1 className='text-3xl font-semibold text-gray-900'>Our Postcards</h1>
        <p className='text-gray-500 mt-2'>
          Handpicked cards for every occasion
        </p>
      </div>
      {products.length === 0 ? (
        <p className='text-gray-500'>No products found.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map((product: (typeof products)[number]) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <Recommender />
    </div>
  );
}
// testing CI pipeline
// testing CI pipeline again
// testing CI pipeline with another commit
// testing CI pipeline with another commit in test branch
// testing CI pipeline with another commit in test branch again

// export default async function Home() {
//   const session = await auth();

//   return (
//     <main>
//       {session ? (
//         <>
//           <p>Signed in as {session.user?.email}</p>
//           <form
//             action={async () => {
//               'use server';
//               await signOut();
//             }}
//           >
//             <button type='submit'>Sign out</button>
//           </form>
//         </>
//       ) : (
//         <form
//           action={async () => {
//             'use server';
//             await signIn('google');
//           }}
//         >
//           <button type='submit'>Sign in with Google</button>
//         </form>
//       )}
//     </main>
//   );
// }
