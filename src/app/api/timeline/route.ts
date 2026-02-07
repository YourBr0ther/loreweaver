import { getAllTimelineEvents } from '@/lib/db/queries';
import { getDb } from '@/lib/db';

export async function GET() {
  const events = getAllTimelineEvents();

  // Enrich with entity names
  const db = getDb();
  const enriched = events.map((event) => {
    const entity = db
      .prepare('SELECT name, type FROM entities WHERE id = ?')
      .get(event.entity_id) as { name: string; type: string } | undefined;
    return {
      ...event,
      entity_name: entity?.name ?? 'Unknown',
      entity_type: entity?.type ?? 'unknown',
    };
  });

  return Response.json(enriched);
}
