import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const client = new SecretsManagerClient({ region: 'ca-central-1' })

let cachedSecret: string | null = null

export async function getDatabaseUrl(): Promise<string> {
  // In local dev, use .env.local directly
  if (process.env.NODE_ENV === 'development') {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL missing in .env.local')
    return url
  }

  // In production, fetch from Secrets Manager once and cache it
  if (cachedSecret) return cachedSecret

  const command = new GetSecretValueCommand({ SecretId: 'postcard/db/url' })
  const response = await client.send(command)

  if (!response.SecretString) throw new Error('Secret value is empty')

  cachedSecret = response.SecretString
  return cachedSecret
}