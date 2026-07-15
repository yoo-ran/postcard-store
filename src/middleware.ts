import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const isSecure = req.nextUrl.protocol === 'https:';

  const token = await getToken({
    req: req as Parameters<typeof getToken>[0]['req'],
    secret: process.env.AUTH_SECRET,
    cookieName: isSecure
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  });

  if (!token) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout', '/checkout/:path*'],
};
