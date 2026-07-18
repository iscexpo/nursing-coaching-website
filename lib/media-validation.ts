/**
 * Upload content-validation helpers.
 *
 * MIME allowlist plus magic-byte (content) sniffing and extension matching.
 * These guard against a file that declares one type (e.g. image/jpeg) but
 * actually carries a different payload.
 */

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number]

/**
 * Expected leading magic bytes per MIME type.
 */
export const MIME_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (webp container)
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
}

export const EXTENSION_BY_MIME: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
}

export function matchesSignature(buffer: Buffer, mime: string): boolean {
  const signatures = MIME_SIGNATURES[mime]
  if (!signatures) return false
  return signatures.some((sig) => sig.every((b, i) => buffer[i] === b))
}

export function hasAllowedExtension(filename: string, mime: string): boolean {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  return (EXTENSION_BY_MIME[mime] ?? []).includes(ext)
}

export function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
}
