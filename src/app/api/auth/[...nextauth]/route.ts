import { handlers } from '@/auth';
import { authLimiter } from '@/lib/ratelimit';
import { NextRequest } from 'next/server';

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { success } = await authLimiter.limit(ip);

  if (!success) {
    return new Response('Too many login attempts. Try again later.', {
      status: 429,
    });
  }

  return handlers.POST(request);
}
