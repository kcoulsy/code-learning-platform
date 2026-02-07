import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '@/db'
import * as authSchema from '@/db/auth-schema'
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto'

const ALGORITHM = 'aes-256-gcm'

/**
 * Derive master encryption key from environment secret
 * Uses scrypt for better key derivation than simple SHA-256
 */
function getMasterKey(): Buffer {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET environment variable is required')
  }
  // Use scrypt with a fixed salt for master key derivation
  // Salt is fixed because we need deterministic key derivation for the master key
  return scryptSync(secret, 'learn-code-master-salt', 32)
}

/**
 * Generate a new random encryption key for a user
 * This key will be used to encrypt the user's API keys
 */
export function generateUserEncryptionKey(): string {
  const key = randomBytes(32)
  return key.toString('base64')
}

/**
 * Encrypt a user's encryption key with the master key
 * This allows us to store the per-user key in the database
 */
export function encryptUserKey(userKey: string): string {
  const masterKey = getMasterKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, masterKey, iv)

  let encrypted = cipher.update(userKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Store: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a user's encryption key using the master key
 */
export function decryptUserKey(encryptedData: string): string {
  const masterKey = getMasterKey()
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, masterKey, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Encrypt an API key using a user's encryption key
 */
export function encryptApiKey(apiKey: string, userKey: string): string {
  const keyBuffer = Buffer.from(userKey, 'base64')
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv)

  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Store: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an API key using a user's encryption key
 */
export function decryptApiKey(encryptedData: string, userKey: string): string {
  const keyBuffer = Buffer.from(userKey, 'base64')
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ['http://localhost:3000'],
  plugins: [tanstackStartCookies()],
})

export type Auth = typeof auth
