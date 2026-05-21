import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/schemas/auth.schema';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const prisma = new PrismaClient();
const client = new SecretsManagerClient({ region: 'ca-central-1' });

const { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } = await (async () => {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'postcard-store-google-oauth' }),
  );
  return JSON.parse(response.SecretString ?? '{}');
})();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
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
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        console.log('dbUser:', dbUser);
        token.role = dbUser?.role;
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
