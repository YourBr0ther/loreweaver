import { NextRequest } from 'next/server';
import { getAllEntities, getEntitiesByType } from '@/lib/db/queries';
import type { EntityType } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') as EntityType | null;
  const status = searchParams.get('status') as 'proposed' | 'approved' | 'rejected' | null;

  let entities;
  if (type) {
    entities = getEntitiesByType(type, status ?? 'approved');
  } else {
    entities = getAllEntities(status ?? 'approved');
  }

  return Response.json(entities);
}
