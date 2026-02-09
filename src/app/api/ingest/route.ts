import { NextRequest } from 'next/server';
import path from 'path';
import { createIngestionQueueItem } from '@/lib/db/queries';
import { parseFile, isSupportedExtension } from '@/lib/ingestion/parsers';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'file is required' }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!isSupportedExtension(ext)) {
    return Response.json(
      { error: `Unsupported file type: ${ext}. Supported: .txt, .md, .pdf, .docx, .html, .json` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const content = await parseFile(buffer, ext);

  const item = createIngestionQueueItem({
    filename: file.name,
    content,
    input_method: 'upload',
  });

  return Response.json(item, { status: 201 });
}
