import { v4 as uuidv4 } from 'uuid';
import { getDb } from './index';
import type {
  Session,
  Entity,
  Relationship,
  TimelineEvent,
  Contradiction,
  Tag,
  IngestionQueueItem,
  DashboardStats,
  EntityType,
  EntityStatus,
  ContradictionResolution,
  IngestionMethod,
  IngestionStatus,
  SessionStatus,
} from '@/types';

// --- Sessions ---

export function createSession(data: {
  title: string;
  date: string;
  raw_text: string;
  summary?: string;
  source_file?: string;
}): Session {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO sessions (id, title, date, raw_text, summary, source_file)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, data.title, data.date, data.raw_text, data.summary ?? null, data.source_file ?? null);
  return getSessionById(id)!;
}

export function getSessionById(id: string): Session | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
  return row ?? null;
}

export function getAllSessions(): Session[] {
  const db = getDb();
  return db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all() as Session[];
}

export function updateSessionStatus(id: string, status: SessionStatus): void {
  const db = getDb();
  db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, id);
}

// --- Entities ---

export function createEntity(data: {
  name: string;
  type: EntityType;
  description: string;
  properties?: Record<string, unknown>;
  status?: EntityStatus;
  source_session_id?: string;
}): Entity {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO entities (id, name, type, description, properties, status, source_session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.name,
    data.type,
    data.description,
    JSON.stringify(data.properties ?? {}),
    data.status ?? 'proposed',
    data.source_session_id ?? null
  );
  return getEntityById(id)!;
}

export function getEntityById(id: string): Entity | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM entities WHERE id = ?').get(id) as
    | (Omit<Entity, 'properties'> & { properties: string })
    | undefined;
  if (!row) return null;
  return { ...row, properties: JSON.parse(row.properties) };
}

export function getAllEntities(status?: EntityStatus): Entity[] {
  const db = getDb();
  let rows;
  if (status) {
    rows = db.prepare('SELECT * FROM entities WHERE status = ? ORDER BY name').all(status);
  } else {
    rows = db.prepare('SELECT * FROM entities ORDER BY name').all();
  }
  return (rows as (Omit<Entity, 'properties'> & { properties: string })[]).map((r) => ({
    ...r,
    properties: JSON.parse(r.properties),
  }));
}

export function getEntitiesByType(type: EntityType, status?: EntityStatus): Entity[] {
  const db = getDb();
  let rows;
  if (status) {
    rows = db
      .prepare('SELECT * FROM entities WHERE type = ? AND status = ? ORDER BY name')
      .all(type, status);
  } else {
    rows = db.prepare('SELECT * FROM entities WHERE type = ? ORDER BY name').all(type);
  }
  return (rows as (Omit<Entity, 'properties'> & { properties: string })[]).map((r) => ({
    ...r,
    properties: JSON.parse(r.properties),
  }));
}

export function updateEntity(
  id: string,
  data: Partial<Pick<Entity, 'name' | 'description' | 'properties' | 'type'>>
): void {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push('description = ?');
    values.push(data.description);
  }
  if (data.properties !== undefined) {
    sets.push('properties = ?');
    values.push(JSON.stringify(data.properties));
  }
  if (data.type !== undefined) {
    sets.push('type = ?');
    values.push(data.type);
  }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE entities SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

export function updateEntityStatus(id: string, status: EntityStatus): void {
  const db = getDb();
  db.prepare("UPDATE entities SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    id
  );
}

export function deleteEntity(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM tags WHERE entity_id = ?').run(id);
  db.prepare('DELETE FROM timeline_events WHERE entity_id = ?').run(id);
  db.prepare('DELETE FROM relationships WHERE source_entity_id = ? OR target_entity_id = ?').run(
    id,
    id
  );
  db.prepare('DELETE FROM contradictions WHERE entity_id = ?').run(id);
  db.prepare('DELETE FROM entities WHERE id = ?').run(id);
}

export function searchEntities(query: string): Entity[] {
  const db = getDb();
  const pattern = `%${query}%`;
  const rows = db
    .prepare(
      `SELECT * FROM entities
       WHERE (name LIKE ? OR description LIKE ?) AND status = 'approved'
       ORDER BY name`
    )
    .all(pattern, pattern);
  return (rows as (Omit<Entity, 'properties'> & { properties: string })[]).map((r) => ({
    ...r,
    properties: JSON.parse(r.properties),
  }));
}

// --- Relationships ---

export function createRelationship(data: {
  source_entity_id: string;
  target_entity_id: string;
  type: string;
  description?: string;
  confidence?: number;
  status?: EntityStatus;
  source_session_id?: string;
}): Relationship {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO relationships (id, source_entity_id, target_entity_id, type, description, confidence, status, source_session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.source_entity_id,
    data.target_entity_id,
    data.type,
    data.description ?? null,
    data.confidence ?? 1.0,
    data.status ?? 'proposed',
    data.source_session_id ?? null
  );
  return db.prepare('SELECT * FROM relationships WHERE id = ?').get(id) as Relationship;
}

export function getRelationshipsByEntityId(entityId: string): Relationship[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM relationships
       WHERE (source_entity_id = ? OR target_entity_id = ?) AND status = 'approved'`
    )
    .all(entityId, entityId) as Relationship[];
}

export function getAllRelationships(status?: EntityStatus): Relationship[] {
  const db = getDb();
  if (status) {
    return db
      .prepare('SELECT * FROM relationships WHERE status = ?')
      .all(status) as Relationship[];
  }
  return db.prepare('SELECT * FROM relationships').all() as Relationship[];
}

export function updateRelationshipStatus(id: string, status: EntityStatus): void {
  const db = getDb();
  db.prepare('UPDATE relationships SET status = ? WHERE id = ?').run(status, id);
}

// --- Timeline Events ---

export function createTimelineEvent(data: {
  entity_id: string;
  date_description: string;
  sort_order: number;
  session_number?: number;
}): TimelineEvent {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO timeline_events (id, entity_id, date_description, sort_order, session_number)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, data.entity_id, data.date_description, data.sort_order, data.session_number ?? null);
  return db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(id) as TimelineEvent;
}

export function getAllTimelineEvents(): TimelineEvent[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM timeline_events ORDER BY sort_order')
    .all() as TimelineEvent[];
}

export function getTimelineEventsByEntityId(entityId: string): TimelineEvent[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM timeline_events WHERE entity_id = ? ORDER BY sort_order')
    .all(entityId) as TimelineEvent[];
}

// --- Contradictions ---

export function createContradiction(data: {
  entity_id: string;
  field: string;
  old_value: string;
  new_value: string;
  old_source_session_id?: string;
  new_source_session_id?: string;
}): Contradiction {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO contradictions (id, entity_id, field, old_value, new_value, old_source_session_id, new_source_session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.entity_id,
    data.field,
    data.old_value,
    data.new_value,
    data.old_source_session_id ?? null,
    data.new_source_session_id ?? null
  );
  return db.prepare('SELECT * FROM contradictions WHERE id = ?').get(id) as Contradiction;
}

export function getAllContradictions(): Contradiction[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM contradictions ORDER BY created_at DESC')
    .all() as Contradiction[];
}

export function getUnresolvedContradictions(): Contradiction[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM contradictions WHERE resolution IS NULL ORDER BY created_at DESC')
    .all() as Contradiction[];
}

export function resolveContradiction(
  id: string,
  resolution: ContradictionResolution,
  notes?: string
): void {
  const db = getDb();
  db.prepare('UPDATE contradictions SET resolution = ?, notes = ? WHERE id = ?').run(
    resolution,
    notes ?? null,
    id
  );
}

// --- Tags ---

export function createTag(entityId: string, tag: string): Tag {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO tags (id, entity_id, tag) VALUES (?, ?, ?)').run(id, entityId, tag);
  return { id, entity_id: entityId, tag };
}

export function getTagsByEntityId(entityId: string): Tag[] {
  const db = getDb();
  return db.prepare('SELECT * FROM tags WHERE entity_id = ?').all(entityId) as Tag[];
}

export function deleteTag(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
}

// --- Ingestion Queue ---

export function createIngestionQueueItem(data: {
  filename?: string;
  content: string;
  input_method: IngestionMethod;
}): IngestionQueueItem {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO ingestion_queue (id, filename, content, input_method)
     VALUES (?, ?, ?, ?)`
  ).run(id, data.filename ?? null, data.content, data.input_method);
  return db.prepare('SELECT * FROM ingestion_queue WHERE id = ?').get(id) as IngestionQueueItem;
}

export function getNextQueueItem(): IngestionQueueItem | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM ingestion_queue WHERE status = 'queued' ORDER BY created_at LIMIT 1")
    .get() as IngestionQueueItem | undefined;
  return row ?? null;
}

export function updateIngestionStatus(id: string, status: IngestionStatus): void {
  const db = getDb();
  db.prepare('UPDATE ingestion_queue SET status = ? WHERE id = ?').run(status, id);
}

export function getAllIngestionItems(): IngestionQueueItem[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM ingestion_queue ORDER BY created_at DESC')
    .all() as IngestionQueueItem[];
}

// --- Stats ---

export function getDashboardStats(): DashboardStats {
  const db = getDb();

  const totalEntities = (
    db.prepare("SELECT COUNT(*) as count FROM entities WHERE status = 'approved'").get() as {
      count: number;
    }
  ).count;

  const totalRelationships = (
    db.prepare("SELECT COUNT(*) as count FROM relationships WHERE status = 'approved'").get() as {
      count: number;
    }
  ).count;

  const totalSessions = (
    db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number }
  ).count;

  const pendingReview = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM (
          SELECT id FROM entities WHERE status = 'proposed'
          UNION ALL
          SELECT id FROM relationships WHERE status = 'proposed'
        )`
      )
      .get() as { count: number }
  ).count;

  const unresolvedContradictions = (
    db
      .prepare('SELECT COUNT(*) as count FROM contradictions WHERE resolution IS NULL')
      .get() as { count: number }
  ).count;

  const typeRows = db
    .prepare(
      "SELECT type, COUNT(*) as count FROM entities WHERE status = 'approved' GROUP BY type"
    )
    .all() as { type: EntityType; count: number }[];

  const entitiesByType = {} as Record<EntityType, number>;
  const allTypes: EntityType[] = [
    'character',
    'faction',
    'location',
    'race',
    'event',
    'item',
    'lore',
    'quest',
    'creature',
  ];
  for (const t of allTypes) {
    entitiesByType[t] = 0;
  }
  for (const row of typeRows) {
    entitiesByType[row.type] = row.count;
  }

  return {
    totalEntities,
    totalRelationships,
    totalSessions,
    pendingReview,
    unresolvedContradictions,
    entitiesByType,
  };
}
