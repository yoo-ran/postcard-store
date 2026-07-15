import { handlers } from '@/auth';
import { authLimiter } from '@/lib/ratelimit';
import { NextRequest } from 'next/server';

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const isCredentialsLogin =
    request.nextUrl.pathname === '/api/auth/callback/credentials';

  if (isCredentialsLogin && process.env.PLAYWRIGHT_TEST !== 'true') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';

    const { success } = await authLimiter.limit(`login:${ip}`);

    if (!success) {
      return Response.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429 },
      );
    }
  }

  return handlers.POST(request);
}
