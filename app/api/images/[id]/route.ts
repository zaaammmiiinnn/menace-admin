import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let kv: any = null;

    try {
      const ctx = getCloudflareContext();
      kv = (ctx.env as any)?.MENACE_KV;
    } catch {
      // Ignore if not in cloudflare worker context
    }

    if (!kv) {
      return new NextResponse('Storage Unavailable', { status: 503 });
    }

    const [imageBuffer, mimeType] = await Promise.all([
      kv.get(`img:${id}`, { type: 'arrayBuffer' }),
      kv.get(`mime:${id}`),
    ]);

    if (!imageBuffer) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('[API Image Serve Error]:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
