import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

async function findOrder(sessionId: string, retries = 8, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });
    if (order) return order;
    // Wait before retrying
    await new Promise<void>((res) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        res();
      }, delay);
    });
  }
  return null;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) redirect('/');

  const order = await findOrder(sessionId);

  if (!order) redirect('/');

  redirect(`/orders/${order.id}`);
}
