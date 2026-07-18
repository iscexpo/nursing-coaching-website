import { describe, expect, it } from 'vitest'
import {
  matchesSignature,
  hasAllowedExtension,
  MIME_SIGNATURES,
} from '../lib/media-validation'

describe('media upload hardening', () => {
  it('accepts a real PNG by content signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(matchesSignature(png, 'image/png')).toBe(true)
  })

  it('rejects a fake JPEG (HTML payload) by content signature', () => {
    const html = Buffer.from('<html><script>alert(1)</script>')
    expect(matchesSignature(html, 'image/jpeg')).toBe(false)
  })

  it('accepts a real PDF by content signature', () => {
    const pdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])
    expect(matchesSignature(pdf, 'application/pdf')).toBe(true)
  })

  it('rejects an executable disguised with a .pdf extension', () => {
    const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00]) // MZ header
    expect(hasAllowedExtension('evil.pdf', 'application/pdf')).toBe(true)
    expect(matchesSignature(exe, 'application/pdf')).toBe(false)
  })

  it('matches allowed extensions per mime type', () => {
    expect(hasAllowedExtension('photo.jpg', 'image/jpeg')).toBe(true)
    expect(hasAllowedExtension('photo.png', 'image/jpeg')).toBe(false)
    expect(hasAllowedExtension('doc.exe', 'image/png')).toBe(false)
  })

  it('covers every allowed mime type with a signature', () => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ]
    for (const mime of allowed) {
      expect(MIME_SIGNATURES[mime]).toBeDefined()
    }
  })
})
