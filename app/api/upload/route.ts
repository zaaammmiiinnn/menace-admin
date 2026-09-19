import { NextRequest, NextResponse } from 'next/server';
import { getKVDatabase, getD1Database } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const kv = getKVDatabase();
    const d1 = getD1Database();

    const uploadedUrls: string[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const images: any[] = Array.isArray(body.images)
        ? body.images
        : body.dataUrl || body.base64
        ? [body]
        : [];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        let base64 = typeof item === 'string' ? item : item.base64 || item.dataUrl || '';
        let mime = typeof item === 'object' && item.mimeType ? item.mimeType : 'image/jpeg';

        if (base64.startsWith('data:image/')) {
          const match = base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (match) {
            mime = match[1];
            base64 = match[2];
          }
        }

        if (base64) {
          const imgKey = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }

          if (kv) {
            await Promise.all([
              kv.put(`img:${imgKey}`, bytes.buffer),
              kv.put(`mime:${imgKey}`, mime),
            ]);
            uploadedUrls.push(`/api/images/${imgKey}`);
          } else {
            uploadedUrls.push(`data:${mime};base64,${base64}`);
          }
        }
      }
    } else {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const file = formData.get('file') as File | null;
      const allFiles = files && files.length > 0 ? files : file ? [file] : [];

      if (allFiles.length === 0) {
        return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
      }

      for (const f of allFiles) {
        if (!f.type.startsWith('image/')) continue;
        const imgKey = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const buffer = await f.arrayBuffer();
        const mimeType = f.type || 'image/jpeg';

        if (kv) {
          await Promise.all([
            kv.put(`img:${imgKey}`, buffer),
            kv.put(`mime:${imgKey}`, mimeType),
          ]);
          uploadedUrls.push(`/api/images/${imgKey}`);
        } else {
          const base64 = Buffer.from(buffer).toString('base64');
          uploadedUrls.push(`data:${mimeType};base64,${base64}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
    });
  } catch (err: any) {
    console.error('[Upload API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Image upload processing failed' },
      { status: 500 }
    );
  }
}
