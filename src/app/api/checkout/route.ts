import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { checkoutCartSchema } from '@/schemas/checkout.schema';
import { checkoutLimiter } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  // Require authentication — orders must belong to a user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { success } = await checkoutLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 },
    );
  }

  const body = await req.json();

  const parsed = checkoutCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { cartItems, currency } = parsed.data;

  // Server-side price lookup — never trust client-supplied prices
  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((item) => item.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const missingItem = cartItems.find((item) => !productMap.has(item.productId));
  if (missingItem) {
    return NextResponse.json(
      { error: 'One or more products no longer exist' },
      { status: 400 },
    );
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      metadata: { userId: session.user.id },
      customer_email: session.user.email ?? undefined,
      line_items: cartItems.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          price_data: {
            currency,
            unit_amount: Math.round(Number(product.price)),
            product_data: {
              name: product.name,
              metadata: {
                productId: product.id,
              },
            },
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Stripe session creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
