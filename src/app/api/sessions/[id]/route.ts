import { NextRequest } from 'next/server';
import { getSessionById, getAllEntities } from '@/lib/db/queries';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSessionById(id);
  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  const entities = getAllEntities().filter((e) => e.source_session_id === id);

  return Response.json({ ...session, entities });
}
