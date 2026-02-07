import { NextRequest } from 'next/server';
import { getEntityById, updateEntityStatus, updateRelationshipStatus } from '@/lib/db/queries';
import { getDb } from '@/lib/db';
import type { EntityStatus } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ids, action } = body as { ids: string[]; action: 'approve' | 'reject' };

  if (!ids || !Array.isArray(ids) || !action) {
    return Response.json({ error: 'ids (array) and action are required' }, { status: 400 });
  }

  const status: EntityStatus = action === 'reject' ? 'rejected' : 'approved';
  const db = getDb();
  let updated = 0;

  for (const id of ids) {
    const entity = getEntityById(id);
    if (entity) {
      updateEntityStatus(id, status);
      updated++;
      continue;
    }
    const rel = db.prepare('SELECT id FROM relationships WHERE id = ?').get(id);
    if (rel) {
      updateRelationshipStatus(id, status);
      updated++;
    }
  }

  return Response.json({ updated, total: ids.length });
}
