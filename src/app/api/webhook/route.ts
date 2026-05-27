import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/ses';

export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotency check — skip if already processed
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existingOrder) {
      console.log(
        'Duplicate webhook event - order already exists for session:',
        session.id,
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log('No existing order found, proceeding to create...');

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    const customerEmail = session.customer_details?.email ?? '';
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      console.error('No user found for email:', customerEmail);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Save order to DB
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        stripeSessionId: session.id,
        status: 'CONFIRMED',
        total: (session.amount_total ?? 0) / 100,
        orderItems: {
          create:
            fullSession.line_items?.data.map((item) => ({
              productId: (item.price?.product as Stripe.Product).metadata
                .productId,
              quantity: item.quantity ?? 1,
              unitPrice: (item.price?.unit_amount ?? 0) / 100,
            })) ?? [],
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    // Send confirmation email after order is saved
    await sendOrderConfirmationEmail({
      orderId: order.id,
      customerEmail,
      items: order.orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.unitPrice),
      })),
      total: Number(order.total),
    });
    // Order creation goes here in the next task
    console.log('New event — ready to create order for session:', session.id);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
