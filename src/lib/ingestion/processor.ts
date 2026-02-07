import { chunkText } from './chunker';
import { extractFromChunk } from '@/lib/ai';
import {
  createSession,
  createEntity,
  createRelationship,
  createTimelineEvent,
  createContradiction,
  getAllEntities,
  getNextQueueItem,
  updateIngestionStatus,
  updateSessionStatus,
} from '@/lib/db/queries';

export async function processNextQueueItem(): Promise<{
  success: boolean;
  sessionId?: string;
  error?: string;
}> {
  const item = getNextQueueItem();
  if (!item) {
    return { success: false, error: 'No items in queue' };
  }

  updateIngestionStatus(item.id, 'processing');

  try {
    // Create session
    const session = createSession({
      title: item.filename || `Ingested ${new Date().toISOString().split('T')[0]}`,
      date: new Date().toISOString().split('T')[0],
      raw_text: item.content,
      source_file: item.filename || undefined,
    });

    // Chunk the content
    const chunks = chunkText(item.content);

    // Get existing entity names for deduplication
    const existingEntities = getAllEntities('approved').map((e) => e.name);

    // Process each chunk
    for (const chunk of chunks) {
      try {
        const result = await extractFromChunk(chunk.text, existingEntities);

        // Build a map of entity names to IDs (for relationship linking)
        const entityNameToId: Record<string, string> = {};

        // Save proposed entities
        for (const extracted of result.entities) {
          const entity = createEntity({
            name: extracted.name,
            type: extracted.type,
            description: extracted.description,
            properties: extracted.properties,
            status: 'proposed',
            source_session_id: session.id,
          });
          entityNameToId[extracted.name] = entity.id;

          // Add to existing list for subsequent chunks
          if (!existingEntities.includes(extracted.name)) {
            existingEntities.push(extracted.name);
          }
        }

        // Save proposed relationships
        for (const rel of result.relationships) {
          const sourceId = entityNameToId[rel.source_entity_name];
          const targetId = entityNameToId[rel.target_entity_name];

          if (sourceId && targetId) {
            createRelationship({
              source_entity_id: sourceId,
              target_entity_id: targetId,
              type: rel.type,
              description: rel.description,
              confidence: rel.confidence,
              status: 'proposed',
              source_session_id: session.id,
            });
          }
        }

        // Save timeline events
        for (const event of result.timeline_events) {
          const entityId = entityNameToId[event.entity_name];
          if (entityId) {
            createTimelineEvent({
              entity_id: entityId,
              date_description: event.date_description,
              sort_order: event.sort_order,
            });
          }
        }

        // Save contradictions
        for (const contradiction of result.contradictions) {
          const entityId = entityNameToId[contradiction.entity_name];
          if (entityId) {
            createContradiction({
              entity_id: entityId,
              field: contradiction.field,
              old_value: contradiction.old_value,
              new_value: contradiction.new_value,
              new_source_session_id: session.id,
            });
          }
        }
      } catch (chunkError) {
        console.error(`Failed to process chunk ${chunk.index}:`, chunkError);
        // Continue with remaining chunks
      }
    }

    updateSessionStatus(session.id, 'processed');
    updateIngestionStatus(item.id, 'completed');

    return { success: true, sessionId: session.id };
  } catch (error) {
    updateIngestionStatus(item.id, 'failed');
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
