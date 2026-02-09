// Entity types
export type EntityType =
  | 'character'
  | 'faction'
  | 'location'
  | 'race'
  | 'event'
  | 'item'
  | 'lore'
  | 'quest'
  | 'creature';

export type EntityStatus = 'proposed' | 'approved' | 'rejected';

export type RelationshipType =
  | 'allied_with'
  | 'enemy_of'
  | 'betrayed'
  | 'serves'
  | 'parent_of'
  | 'child_of'
  | 'member_of'
  | 'located_in'
  | 'involved_in'
  | 'owns'
  | 'created'
  | 'knows'
  | 'employs'
  | 'worships'
  | 'rules'
  | 'guards'
  | 'hunts'
  | 'trades_with';

export type ContradictionResolution = 'kept_old' | 'kept_new' | 'merged';

export type IngestionMethod = 'file' | 'upload' | 'paste';
export type IngestionStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type SessionStatus = 'pending' | 'processed';

// Core interfaces
export interface Session {
  id: string;
  title: string;
  date: string;
  raw_text: string;
  summary: string | null;
  source_file: string | null;
  status: SessionStatus;
  created_at: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  properties: Record<string, unknown>;
  status: EntityStatus;
  source_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  type: RelationshipType;
  description: string | null;
  confidence: number;
  status: EntityStatus;
  source_session_id: string | null;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  entity_id: string;
  date_description: string;
  sort_order: number;
  session_number: number | null;
}

export interface Contradiction {
  id: string;
  entity_id: string;
  field: string;
  old_value: string;
  new_value: string;
  old_source_session_id: string | null;
  new_source_session_id: string | null;
  resolution: ContradictionResolution | null;
  notes: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  entity_id: string;
  tag: string;
}

export interface IngestionQueueItem {
  id: string;
  filename: string | null;
  content: string;
  input_method: IngestionMethod;
  status: IngestionStatus;
  created_at: string;
}

// AI Extraction types
export interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
  timeline_events: ExtractedTimelineEvent[];
  contradictions: ExtractedContradiction[];
}

export interface ExtractedEntity {
  name: string;
  type: EntityType;
  description: string;
  properties: Record<string, unknown>;
  confidence: number;
  is_existing: boolean;
  existing_entity_id?: string;
}

export interface ExtractedRelationship {
  source_entity_name: string;
  target_entity_name: string;
  type: RelationshipType;
  description: string;
  confidence: number;
}

export interface ExtractedTimelineEvent {
  entity_name: string;
  date_description: string;
  sort_order: number;
}

export interface ExtractedContradiction {
  entity_name: string;
  field: string;
  old_value: string;
  new_value: string;
  explanation: string;
}

// View types
export interface GraphNode {
  id: string;
  name: string;
  type: EntityType;
  connectionCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: RelationshipType;
  description: string | null;
}

// Stats
export interface DashboardStats {
  totalEntities: number;
  totalRelationships: number;
  totalSessions: number;
  pendingReview: number;
  unresolvedContradictions: number;
  entitiesByType: Record<EntityType, number>;
}

// AI Engine config
export interface AIConfig {
  engine: 'claude-code' | 'anthropic-api';
  apiKey?: string;
  model?: string;
}
