import { LoginSchema, RegisterSchema } from '@/schemas/auth.schema'
import { checkoutCartSchema } from '@/schemas/checkout.schema'
import { aiRecommendRequestSchema, aiRecommendResponseSchema } from '@/schemas/recommend.schema'

// ── LoginSchema ───────────────────────────────────────────────────────────────
describe('LoginSchema', () => {
  it('passes with valid email and password', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('fails with an invalid email', () => {
    const result = LoginSchema.safeParse({
      email: 'not-an-email',
      password: 'securepass123',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Invalid email address')
  })

  it('fails when password is too short', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Password must be at least 8 characters')
  })

  it('fails when fields are missing', () => {
    const result = LoginSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error?.issues.length).toBeGreaterThan(0)
  })
})

// ── RegisterSchema ────────────────────────────────────────────────────────────
describe('RegisterSchema', () => {
  it('passes with all valid fields', () => {
    const result = RegisterSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securepass123',
      confirmPassword: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = RegisterSchema.safeParse({
      name: '',
      email: 'jane@example.com',
      password: 'securepass123',
      confirmPassword: 'securepass123',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Name is required')
  })

  it('fails when passwords do not match', () => {
    const result = RegisterSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securepass123',
      confirmPassword: 'differentpass',
    })
    expect(result.success).toBe(false)
    const confirmError = result.error?.issues.find(
      (i) => i.path[0] === 'confirmPassword'
    )
    expect(confirmError?.message).toBe('Passwords do not match')
  })

  it('fails with invalid email', () => {
    const result = RegisterSchema.safeParse({
      name: 'Jane Doe',
      email: 'not-an-email',
      password: 'securepass123',
      confirmPassword: 'securepass123',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Invalid email address')
  })
})

// ── checkoutCartSchema ────────────────────────────────────────────────────────
describe('checkoutCartSchema', () => {
  const validPayload = {
    cartItems: [
      {
        productId: 'prod-1',
        name: 'Postcard A',
        price: 2.99,
        quantity: 2,
      },
    ],
  }

  it('passes with valid cart items', () => {
    const result = checkoutCartSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('defaults currency to "usd" when not provided', () => {
    const result = checkoutCartSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('usd')
    }
  })

  it('accepts an explicit currency', () => {
    const result = checkoutCartSchema.safeParse({
      ...validPayload,
      currency: 'eur',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('eur')
    }
  })

  it('fails when cartItems is empty', () => {
    const result = checkoutCartSchema.safeParse({ cartItems: [] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Cart must contain at least one item'
    )
  })

  it('fails when price is zero or negative', () => {
    const result = checkoutCartSchema.safeParse({
      cartItems: [{ productId: 'p1', name: 'Postcard', price: 0, quantity: 1 }],
    })
    expect(result.success).toBe(false)
  })

  it('fails when quantity is not an integer', () => {
    const result = checkoutCartSchema.safeParse({
      cartItems: [{ productId: 'p1', name: 'Postcard', price: 2.99, quantity: 1.5 }],
    })
    expect(result.success).toBe(false)
  })
})

// ── aiRecommendRequestSchema ──────────────────────────────────────────────────
describe('aiRecommendRequestSchema', () => {
  it('passes with a valid query string', () => {
    const result = aiRecommendRequestSchema.safeParse({ query: 'birthday cards' })
    expect(result.success).toBe(true)
  })

  it('fails when query is empty', () => {
    const result = aiRecommendRequestSchema.safeParse({ query: '' })
    expect(result.success).toBe(false)
  })

  it('fails when query field is missing', () => {
    const result = aiRecommendRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ── aiRecommendResponseSchema ─────────────────────────────────────────────────
describe('aiRecommendResponseSchema', () => {
  it('passes with valid recommendations array', () => {
    const result = aiRecommendResponseSchema.safeParse({
      recommendations: [
        { productId: 'prod-1', reason: 'Great for birthdays' },
        { productId: 'prod-2', reason: 'Popular this season' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('passes with an empty recommendations array', () => {
    const result = aiRecommendResponseSchema.safeParse({ recommendations: [] })
    expect(result.success).toBe(true)
  })

  it('fails when recommendations is missing', () => {
    const result = aiRecommendResponseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails when a recommendation is missing the reason field', () => {
    const result = aiRecommendResponseSchema.safeParse({
      recommendations: [{ productId: 'prod-1' }],
    })
    expect(result.success).toBe(false)
  })
})