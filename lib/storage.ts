import { put, del } from '@vercel/blob'
import { Buffer } from 'node:buffer'

export async function uploadToStorage(
  path: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const blob = await put(path, Buffer.from(body), {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })
  return blob.url
}

export async function deleteFromStorage(pathOrUrl: string): Promise<void> {
  await del(pathOrUrl)
}
