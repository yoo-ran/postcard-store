import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/schemas/auth.schema';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

import prisma from '@/lib/prisma';

const client = new SecretsManagerClient({ region: 'ca-central-1' });

const { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } = await (async () => {
  // In test/CI environment, use environment variables
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    return {
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || '',
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || '',
    };
  }

  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: 'postcard-store-google-oauth' }),
    );
    return JSON.parse(response.SecretString ?? '{}');
  } catch (error) {
    console.warn(
      'Failed to load secrets from AWS, using environment variables',
      error,
    );
    return {
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || '',
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || '',
    };
  }
})();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Google({
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      // ← add from here
      async authorize(credentials) {
        // 1. validate input
        const result = LoginSchema.safeParse(credentials);
        if (!result.success) return null;

        const { email, password } = result.data;

        // 2. look up user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        // 3. guard against OAuth-only accounts
        if (!user.password) return null;

        // 4. verify password against hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        // 5. return user on success
        return user;
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? '';

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        token.role = dbUser?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.userId = token.userId as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
