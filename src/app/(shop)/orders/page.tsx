import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className='max-w-3xl mx-auto px-4 py-12'>
      <h1 className='text-2xl font-bold mb-8'>Order History</h1>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className='text-center py-16'>
          <p className='text-gray-500 mb-4'>
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href='/shop'
            className='inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800'
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Orders list */}
      <div className='space-y-6'>
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className='border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer'>
              {/* Order header */}
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <p className='text-sm text-gray-500'>Order ID</p>
                  <p className='font-mono text-sm'>{order.id}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-500'>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Order items */}
              <div className='divide-y mb-4'>
                {order.orderItems.map((item) => (
                  <div key={item.id} className='flex justify-between py-2'>
                    <div className='flex items-center gap-3'>
                      {item.product.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className='w-10 h-10 object-cover rounded'
                          width={40}
                          height={40}
                        />
                      )}
                      <div>
                        <p className='font-medium text-sm'>
                          {item.product.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className='text-sm font-medium'>
                      ${Number(item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className='flex justify-between font-bold border-t pt-4'>
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
        styles[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}
