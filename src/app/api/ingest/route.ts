import { NextRequest } from 'next/server';
import { createIngestionQueueItem } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'file is required' }, { status: 400 });
  }

  const content = await file.text();
  const item = createIngestionQueueItem({
    filename: file.name,
    content,
    input_method: 'upload',
  });

  return Response.json(item, { status: 201 });
}
