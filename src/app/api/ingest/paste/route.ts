import { NextRequest } from 'next/server';
import { createIngestionQueueItem } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.content) {
    return Response.json({ error: 'content is required' }, { status: 400 });
  }

  const item = createIngestionQueueItem({
    filename: body.title || null,
    content: body.content,
    input_method: 'paste',
  });

  return Response.json(item, { status: 201 });
}
