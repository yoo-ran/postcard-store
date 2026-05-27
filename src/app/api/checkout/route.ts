import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { checkoutCartSchema } from '@/schemas/checkout.schema';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = checkoutCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { cartItems, currency } = parsed.data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: cartItems.map((item) => ({
        price_data: {
          currency,
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            metadata: {
              productId: item.productId,
            },
          },
        },
        quantity: item.quantity,
      })),
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
