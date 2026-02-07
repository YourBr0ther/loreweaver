export function buildExtractionPrompt(
  chunkText: string,
  existingEntities: string[]
): string {
  const existingList =
    existingEntities.length > 0
      ? `\nKnown entities in the knowledge base:\n${existingEntities.map((n) => `- ${n}`).join('\n')}\n`
      : '\nNo existing entities in the knowledge base yet.\n';

  return `You are an expert D&D lore analyst. Analyze the following session transcript chunk and extract structured data.

${existingList}

INSTRUCTIONS:
1. Extract all named entities: characters, factions, locations, races, events, items, lore, quests, creatures
2. For each entity provide: name, type, description, relevant properties (as key-value pairs), and a confidence score (0-1)
3. If an entity name matches or closely matches one from the known entities list, mark is_existing=true and provide the matching name
4. Identify relationships between entities with typed connections
5. Extract timeline events with date descriptions and relative ordering
6. Flag contradictions if new information conflicts with what would be expected from existing entities

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "entities": [
    {
      "name": "Entity Name",
      "type": "character|faction|location|race|event|item|lore|quest|creature",
      "description": "Brief description",
      "properties": { "key": "value" },
      "confidence": 0.95,
      "is_existing": false,
      "existing_entity_id": null
    }
  ],
  "relationships": [
    {
      "source_entity_name": "Entity A",
      "target_entity_name": "Entity B",
      "type": "allied_with|enemy_of|betrayed|serves|parent_of|child_of|member_of|located_in|involved_in|owns|created|knows|employs|worships|rules|guards|hunts|trades_with",
      "description": "Description of relationship",
      "confidence": 0.9
    }
  ],
  "timeline_events": [
    {
      "entity_name": "Entity Name",
      "date_description": "During the siege of Neverwinter",
      "sort_order": 1
    }
  ],
  "contradictions": [
    {
      "entity_name": "Entity Name",
      "field": "description",
      "old_value": "What was previously known",
      "new_value": "What the new text says",
      "explanation": "Why this is contradictory"
    }
  ]
}

SESSION TRANSCRIPT CHUNK:
---
${chunkText}
---`;
}
