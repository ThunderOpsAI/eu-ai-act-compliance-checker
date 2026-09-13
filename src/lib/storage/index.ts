import { put } from '@vercel/blob';

export async function uploadReportPdf(
  path: string,
  pdfBuffer: Buffer
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.log('[Storage] BLOB_READ_WRITE_TOKEN not configured. Storing virtual path.');
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
    console.warn('[Storage] Vercel Blob upload error, fallback to virtual path:', err);
    return `virtual://${path}`;
  }
}

export async function downloadReportPdf(
  storageUrlOrPath: string
): Promise<Buffer | null> {
  if (!storageUrlOrPath || storageUrlOrPath.startsWith('virtual://')) {
    return null;
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

  return null;
}
