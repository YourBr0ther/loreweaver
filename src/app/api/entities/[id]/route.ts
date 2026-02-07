import { NextRequest } from 'next/server';
import {
  getEntityById,
  updateEntity,
  updateEntityStatus,
  deleteEntity,
  getRelationshipsByEntityId,
  getTagsByEntityId,
  getTimelineEventsByEntityId,
} from '@/lib/db/queries';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = getEntityById(id);
  if (!entity) {
    return Response.json({ error: 'Entity not found' }, { status: 404 });
  }

  const relationships = getRelationshipsByEntityId(id);
  const tags = getTagsByEntityId(id);
  const timeline = getTimelineEventsByEntityId(id);

  return Response.json({ ...entity, relationships, tags, timeline });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = getEntityById(id);
  if (!entity) {
    return Response.json({ error: 'Entity not found' }, { status: 404 });
  }

  const body = await request.json();

  if (body.status) {
    updateEntityStatus(id, body.status);
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.properties !== undefined) updates.properties = body.properties;
  if (body.type !== undefined) updates.type = body.type;

  if (Object.keys(updates).length > 0) {
    updateEntity(id, updates as Parameters<typeof updateEntity>[1]);
  }

  return Response.json(getEntityById(id));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entity = getEntityById(id);
  if (!entity) {
    return Response.json({ error: 'Entity not found' }, { status: 404 });
  }

  deleteEntity(id);
  return Response.json({ success: true });
}
