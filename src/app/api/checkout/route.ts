import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { checkoutCartSchema } from '@/schemas/checkout.schema';
import { checkoutLimiter } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
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
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
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

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Stripe session creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
