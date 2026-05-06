import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className='border-b border-gray-200 bg-white'>
      <div className='mx-auto max-w-6xl px-4 py-4 flex items-center justify-between'>
        <Link href='/' className='text-xl font-semibold tracking-tight'>
          🗺️ Postcard Store
        </Link>
        <div className='flex items-center gap-6'>
          <Link href='/' className='text-sm text-gray-600 hover:text-black'>
            Shop
          </Link>
          <Link href='/cart' className='text-sm text-gray-600 hover:text-black'>
            Cart (0)
          </Link>
          <Link
            href='/login'
            className='text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800'
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
