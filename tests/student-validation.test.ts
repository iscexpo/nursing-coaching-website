import { describe, expect, it } from 'vitest'
import { createStudentSchema } from '../lib/validations'

describe('createStudentSchema', () => {
  it('accepts a student photo url', () => {
    const result = createStudentSchema.safeParse({
      name: 'Rahim',
      email: 'rahim@example.com',
      password: 'secret123',
      image: 'https://example.com/rahim.jpg',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBe('https://example.com/rahim.jpg')
    }
  })
})
