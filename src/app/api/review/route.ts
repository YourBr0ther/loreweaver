import { getAllEntities, getAllRelationships } from '@/lib/db/queries';

export async function GET() {
  const entities = getAllEntities('proposed');
  const relationships = getAllRelationships('proposed');

  return Response.json({ entities, relationships });
}
