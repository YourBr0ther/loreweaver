import { getAllEntities, getAllRelationships } from '@/lib/db/queries';
import type { GraphNode, GraphEdge } from '@/types';

export async function GET() {
  const entities = getAllEntities('approved');
  const relationships = getAllRelationships('approved');

  const connectionCounts: Record<string, number> = {};
  for (const rel of relationships) {
    connectionCounts[rel.source_entity_id] = (connectionCounts[rel.source_entity_id] || 0) + 1;
    connectionCounts[rel.target_entity_id] = (connectionCounts[rel.target_entity_id] || 0) + 1;
  }

  const nodes: GraphNode[] = entities.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    connectionCount: connectionCounts[e.id] || 0,
  }));

  const edges: GraphEdge[] = relationships.map((r) => ({
    source: r.source_entity_id,
    target: r.target_entity_id,
    type: r.type,
    description: r.description,
  }));

  return Response.json({ nodes, edges });
}
