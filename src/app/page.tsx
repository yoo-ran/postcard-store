import { mockProducts } from '@/lib/mock-data';
import ProductCard from '@/components/shop/ProductCard';

export default function HomePage() {
  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-semibold text-gray-900'>Our Postcards</h1>
        <p className='text-gray-500 mt-2'>
          Handpicked cards for every occasion
        </p>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
