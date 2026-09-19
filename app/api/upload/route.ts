import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const file = formData.get('file') as File | null;

    const allFiles = files && files.length > 0 ? files : (file ? [file] : []);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const f of allFiles) {
      if (!f.type.startsWith('image/')) {
        continue;
      }

      const buffer = await f.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = f.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64}`;

      uploadedUrls.push(dataUrl);
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
