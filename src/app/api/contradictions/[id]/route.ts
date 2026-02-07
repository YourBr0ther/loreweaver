import { NextRequest } from 'next/server';
import { resolveContradiction } from '@/lib/db/queries';
import { getDb } from '@/lib/db';
import type { ContradictionResolution } from '@/types';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const contradiction = db.prepare('SELECT * FROM contradictions WHERE id = ?').get(id);
  if (!contradiction) {
    return Response.json({ error: 'Contradiction not found' }, { status: 404 });
  }

  const body = await request.json();
  const { resolution, notes } = body as {
    resolution: ContradictionResolution;
    notes?: string;
  };

  if (!resolution) {
    return Response.json({ error: 'resolution is required' }, { status: 400 });
  }

  resolveContradiction(id, resolution, notes);

  const updated = db.prepare('SELECT * FROM contradictions WHERE id = ?').get(id);
  return Response.json(updated);
}
