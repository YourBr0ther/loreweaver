import { NextRequest } from 'next/server';
import {
  getEntityById,
  updateEntityStatus,
  updateEntity,
  updateRelationshipStatus,
} from '@/lib/db/queries';
import { getDb } from '@/lib/db';
import type { EntityStatus } from '@/types';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { action, edits } = body as {
    action: 'approve' | 'reject' | 'edit_approve';
    edits?: Record<string, unknown>;
  };

  if (!action) {
    return Response.json({ error: 'action is required' }, { status: 400 });
  }

  const status: EntityStatus = action === 'reject' ? 'rejected' : 'approved';

  // Check if this is an entity or relationship
  const entity = getEntityById(id);
  if (entity) {
    if (action === 'edit_approve' && edits) {
      updateEntity(id, edits as Parameters<typeof updateEntity>[1]);
    }
    updateEntityStatus(id, status);
    return Response.json(getEntityById(id));
  }

  // Try as relationship
  const db = getDb();
  const rel = db.prepare('SELECT * FROM relationships WHERE id = ?').get(id);
  if (rel) {
    updateRelationshipStatus(id, status);
    return Response.json({ success: true, status });
  }

  return Response.json({ error: 'Item not found' }, { status: 404 });
}
