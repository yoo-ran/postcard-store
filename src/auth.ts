import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({ region: "ca-central-1" })

const { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } = await (async () => {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: "postcard-store-google-oauth" })
  )
  return JSON.parse(response.SecretString ?? "{}")
})()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
    }),
  ],
})