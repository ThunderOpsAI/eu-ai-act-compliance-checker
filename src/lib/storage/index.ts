import { put } from '@vercel/blob';

const inMemoryBlobs = new Map<string, Buffer>();

export async function uploadReportPdf(
  path: string,
  pdfBuffer: Buffer
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.log('[Storage] BLOB_READ_WRITE_TOKEN not configured. Storing in memory.');
    inMemoryBlobs.set(path, pdfBuffer);
    return `virtual://${path}`;
  }

  try {
    const blob = await put(path, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
      token,
    });
    console.log(`[Storage] Uploaded PDF to Vercel Blob: ${blob.url}`);
    return blob.url;
  } catch (err) {
    console.warn('[Storage] Vercel Blob upload error, fallback to virtual in-memory path:', err);
    inMemoryBlobs.set(path, pdfBuffer);
    return `virtual://${path}`;
  }
}

export async function downloadReportPdf(
  storageUrlOrPath: string
): Promise<Buffer | null> {
  if (!storageUrlOrPath) {
    return null;
  }

  if (storageUrlOrPath.startsWith('virtual://')) {
    const key = storageUrlOrPath.replace('virtual://', '');
    return inMemoryBlobs.get(key) || null;
  }

  if (storageUrlOrPath.startsWith('http://') || storageUrlOrPath.startsWith('https://')) {
    try {
      const res = await fetch(storageUrlOrPath);
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
    } catch (err) {
      console.warn(`[Storage] Failed to download blob from ${storageUrlOrPath}:`, err);
    }
  }

  return inMemoryBlobs.get(storageUrlOrPath) || null;
}
