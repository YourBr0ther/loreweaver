import { NextRequest } from 'next/server';
import { getAllSessions, createSession } from '@/lib/db/queries';

export async function GET() {
  const sessions = getAllSessions();
  return Response.json(sessions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || !body.raw_text) {
    return Response.json({ error: 'title and raw_text are required' }, { status: 400 });
  }

  const session = createSession({
    title: body.title,
    date: body.date || new Date().toISOString().split('T')[0],
    raw_text: body.raw_text,
    summary: body.summary,
    source_file: body.source_file,
  });

  return Response.json(session, { status: 201 });
}
