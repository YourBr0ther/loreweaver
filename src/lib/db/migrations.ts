import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      summary TEXT,
      source_file TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      properties TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'proposed',
      source_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (source_session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      source_entity_id TEXT NOT NULL,
      target_entity_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      confidence REAL NOT NULL DEFAULT 1.0,
      status TEXT NOT NULL DEFAULT 'proposed',
      source_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (source_entity_id) REFERENCES entities(id),
      FOREIGN KEY (target_entity_id) REFERENCES entities(id),
      FOREIGN KEY (source_session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      date_description TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      session_number INTEGER,
      FOREIGN KEY (entity_id) REFERENCES entities(id)
    );

    CREATE TABLE IF NOT EXISTS contradictions (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      field TEXT NOT NULL,
      old_value TEXT NOT NULL,
      new_value TEXT NOT NULL,
      old_source_session_id TEXT,
      new_source_session_id TEXT,
      resolution TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (entity_id) REFERENCES entities(id),
      FOREIGN KEY (old_source_session_id) REFERENCES sessions(id),
      FOREIGN KEY (new_source_session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (entity_id) REFERENCES entities(id)
    );

    CREATE TABLE IF NOT EXISTS ingestion_queue (
      id TEXT PRIMARY KEY,
      filename TEXT,
      content TEXT NOT NULL,
      input_method TEXT NOT NULL DEFAULT 'file',
      status TEXT NOT NULL DEFAULT 'queued',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
    CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
    CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
    CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_entity_id);
    CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_entity_id);
    CREATE INDEX IF NOT EXISTS idx_relationships_status ON relationships(status);
    CREATE INDEX IF NOT EXISTS idx_timeline_entity ON timeline_events(entity_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_order ON timeline_events(sort_order);
    CREATE INDEX IF NOT EXISTS idx_contradictions_entity ON contradictions(entity_id);
    CREATE INDEX IF NOT EXISTS idx_contradictions_resolution ON contradictions(resolution);
    CREATE INDEX IF NOT EXISTS idx_tags_entity ON tags(entity_id);
    CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
    CREATE INDEX IF NOT EXISTS idx_ingestion_status ON ingestion_queue(status);
  `);
}
