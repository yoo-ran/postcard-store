import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import ClearCart from './ClearCart';
import { formatPrice } from '@/lib/format-price';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.email) redirect('/login');

  const order = await prisma.order.findUnique({
    where: { id }, // ← was params.id
    include: {
      orderItems: {
        include: { product: true },
      },
      user: true,
    },
  });

  if (!order) notFound();

  // Block access if order belongs to a different user
  if (order.user.email !== session.user.email) notFound();

  return (
    <div className='max-w-2xl mx-auto px-4 py-12'>
      <h1 className='text-2xl font-bold mb-2'>Order Confirmed 🎉</h1>
      <p className='text-gray-500 mb-8'>Order ID: {order.id}</p>

      {/* Status badge */}
      <span className='inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 mb-8'>
        {order.status}
      </span>

      {/* Order items */}
      <div className='divide-y border rounded-lg mb-8'>
        {order.orderItems.map((item: (typeof order.orderItems)[number]) => (
          <div key={item.id} className='flex justify-between px-4 py-3'>
            <div>
              <p className='font-medium'>{item.product.name}</p>
              <p className='text-sm text-gray-500'>Qty: {item.quantity}</p>
            </div>
            <p className='font-medium'>{formatPrice(Number(item.unitPrice))}</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className='flex justify-between text-lg font-bold border-t pt-4'>
        <span>Total</span>
        <span>{formatPrice(Number(order.total))}</span>
      </div>

      {/* Clears cart on mount */}
      <ClearCart />
    </div>
  );
}
