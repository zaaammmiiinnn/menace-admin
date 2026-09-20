import { NextRequest, NextResponse } from 'next/server';
import { getKVDatabase, getD1Database, getLocalStore } from '@/lib/db';

export const dynamic = 'force-dynamic';

function base64ToResponse(dataUrl: string): NextResponse | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const base64Data = match[2];
  try {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }
    return new NextResponse(bytes.buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('[base64ToResponse error]:', e);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('Image ID required', { status: 400 });
    }

    const kv = getKVDatabase();
    const d1 = getD1Database();

    // 1. Check KV database
    if (kv) {
      try {
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

        const rawBuffer = await kv.get(id, { type: 'arrayBuffer' });
        if (rawBuffer) {
          return new NextResponse(rawBuffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (kvErr) {
        console.warn('[Admin Image KV Error]:', kvErr);
      }
    }

    // 2. Check D1 database
    if (d1) {
      try {
        const row: any = await d1
          .prepare(
            'SELECT url FROM product_images WHERE id = ? OR id LIKE ? OR url LIKE ? OR product_id = ? ORDER BY sort_order ASC'
          )
          .bind(id, `%${id}%`, `%${id}%`, id)
          .first();

        if (row && row.url) {
          if (typeof row.url === 'string' && row.url.startsWith('data:image/')) {
            const resp = base64ToResponse(row.url);
            if (resp) {
              if (kv) {
                const match = row.url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
                if (match) {
                  const mime = match[1];
                  const binaryString = atob(match[2]);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let j = 0; j < binaryString.length; j++) {
                    bytes[j] = binaryString.charCodeAt(j);
                  }
                  Promise.all([
                    kv.put(`img:${id}`, bytes.buffer),
                    kv.put(`mime:${id}`, mime),
                  ]).catch(() => {});
                }
              }
              return resp;
            }
          } else if (typeof row.url === 'string' && (row.url.startsWith('http://') || row.url.startsWith('https://'))) {
            return NextResponse.redirect(row.url, 307);
          }
        }
      } catch (dbErr) {
        console.error('[Admin Image D1 Error]:', dbErr);
      }
    }

    // 3. Check Local Store Fallback
    try {
      const store = getLocalStore();
      const imagesTable = store.getTable('product_images');
      const found = imagesTable.find(
        (img: any) =>
          img.id === id ||
          (img.id && img.id.includes(id)) ||
          img.product_id === id ||
          (img.url && typeof img.url === 'string' && img.url.includes(id))
      );

      if (found && found.url) {
        if (typeof found.url === 'string' && found.url.startsWith('data:image/')) {
          const resp = base64ToResponse(found.url);
          if (resp) return resp;
        } else if (typeof found.url === 'string' && (found.url.startsWith('http://') || found.url.startsWith('https://'))) {
          return NextResponse.redirect(found.url, 307);
        }
      }
    } catch (storeErr) {
      console.warn('[Admin Image LocalStore Error]:', storeErr);
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (err: any) {
    console.error('[API Image Serve Error]:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}

