import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient, Role } from '@prisma/client';
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
