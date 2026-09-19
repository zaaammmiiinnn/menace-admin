import { NextRequest, NextResponse } from 'next/server';
import { getKVDatabase, getD1Database } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kv = getKVDatabase();
    const d1 = getD1Database();

    if (kv) {
      const [imageBuffer, mimeType] = await Promise.all([
        kv.get(`img:${id}`, { type: 'arrayBuffer' }),
        kv.get(`mime:${id}`),
      ]);

      if (imageBuffer) {
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // Fallback: check D1 for legacy base64 and auto-cache to KV
    if (d1) {
      try {
        const row: any = await d1.prepare('SELECT url FROM product_images WHERE id = ? OR id LIKE ?').bind(id, `%${id}%`).first();
        if (row && row.url && typeof row.url === 'string' && row.url.startsWith('data:image/')) {
          const match = row.url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (match) {
            const mime = match[1];
            const base64Data = match[2];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }

            if (kv) {
              Promise.all([
                kv.put(`img:${id}`, bytes.buffer),
                kv.put(`mime:${id}`, mime),
              ]).catch(() => {});
            }

            return new NextResponse(bytes.buffer, {
              status: 200,
              headers: {
                'Content-Type': mime,
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        }
      } catch (dbErr) {
        console.error('[Admin Image D1 Fallback Error]:', dbErr);
      }
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (err: any) {
    console.error('[API Image Serve Error]:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
