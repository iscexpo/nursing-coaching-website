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

/**
 * Image dimension validation for logos.
 * Returns error message if dimensions are invalid, null if valid.
 */
export function validateImageDimensions(
  buffer: Buffer,
  mime: string,
): { width: number; height: number } | null {
  if (!mime.startsWith('image/')) return null

  // Simple PNG dimension extraction
  if (mime === 'image/png') {
    // PNG dimensions are at bytes 16-24 (big-endian)
    if (buffer.length >= 24) {
      const width = buffer.readUInt32BE(16)
      const height = buffer.readUInt32BE(20)
      return { width, height }
    }
  }

  // Simple JPEG dimension extraction
  if (mime === 'image/jpeg') {
    // JPEG dimensions are in SOF markers (0xFF 0xC0, 0xC1, 0xC2)
    let i = 4
    while (i < buffer.length - 8) {
      if (
        buffer[i] === 0xff &&
        (buffer[i + 1] === 0xc0 ||
          buffer[i + 1] === 0xc1 ||
          buffer[i + 1] === 0xc2)
      ) {
        const height = buffer.readUInt16BE(i + 5)
        const width = buffer.readUInt16BE(i + 7)
        return { width, height }
      }
      i += 2 + buffer.readUInt16BE(i + 2)
    }
  }

  // WebP and GIF require more complex parsing, skip for now
  return null
}

/**
 * Check if image dimensions are suitable for a logo.
 * Recommended: 200x200 to 2000x2000 pixels
 */
export function isValidLogoSize(
  dimensions: { width: number; height: number } | null,
): { valid: boolean; error?: string } {
  if (!dimensions) return { valid: true } // Skip validation if we can't extract dimensions

  const { width, height } = dimensions
  const minSize = 200
  const maxSize = 2000

  if (width < minSize || height < minSize) {
    return {
      valid: false,
      error: `Image too small. Minimum size is ${minSize}x${minSize} pixels.`,
    }
  }

  if (width > maxSize || height > maxSize) {
    return {
      valid: false,
      error: `Image too large. Maximum size is ${maxSize}x${maxSize} pixels.`,
    }
  }

  // Check aspect ratio (should be roughly square for logos)
  const aspectRatio = Math.max(width, height) / Math.min(width, height)
  if (aspectRatio > 3) {
    return {
      valid: false,
      error:
        'Image aspect ratio is too extreme. Logos should be roughly square (max 3:1 ratio).',
    }
  }

  return { valid: true }
}
