import Stripe from 'stripe';

const globalForStripe = global as typeof global & { stripe?: Stripe };

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  });

if (process.env.NODE_ENV !== 'production') globalForStripe.stripe = stripe;
