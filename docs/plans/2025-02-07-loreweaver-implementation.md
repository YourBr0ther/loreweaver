# Loreweaver Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-hosted D&D knowledge base that ingests session transcripts, extracts entities/relationships via Claude Code CLI, and presents them through Dashboard, Codex (wiki), and Web (graph) views.

**Architecture:** Next.js 14 App Router with SQLite database. AI extraction via Claude Code CLI (primary) with Anthropic API fallback. File watcher for input/ folder ingestion. Review-first workflow — all AI-proposed entities require user approval before entering the knowledge base.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, D3.js, better-sqlite3, chokidar, @anthropic-ai/sdk

---

## Phase 1: Foundation

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.gitignore`
- Create: `input/.gitkeep`
- Create: `data/.gitkeep`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest loreweaver --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Then move contents from `loreweaver/` up to root project directory.

**Step 2: Install core dependencies**

Run:
```bash
npm install better-sqlite3 chokidar d3 @anthropic-ai/sdk uuid
npm install -D @types/better-sqlite3 @types/d3 @types/uuid
```

**Step 3: Install shadcn/ui**

Run:
```bash
npx shadcn@latest init
```

Choose: New York style, Zinc base color, CSS variables enabled.

Then install needed components:
```bash
npx shadcn@latest add button card badge tabs dialog input textarea select dropdown-menu separator scroll-area sheet toast sonner tooltip
```

**Step 4: Set up Loreweaver theme colors in globals.css**

Update `src/app/globals.css` with custom dark theme:
- Background: `#0a0a0f`
- Primary accent (violet-silver): `#8b7ec8`
- Secondary accent (amber): `#d4a574`
- Card backgrounds: `#12121a`
- Border: `#1e1e2e`
- Text: `#e2e0ef`

**Step 5: Create input/ and data/ directories**

```bash
mkdir -p input data
touch input/.gitkeep data/.gitkeep
```

**Step 6: Update .gitignore**

Add:
```
data/*.db
input/*.txt
input/*.md
input/*.pdf
input/processed/
node_modules/
.next/
```

**Step 7: Verify app runs**

Run: `npm run dev`
Expected: App loads at localhost:3000

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, and dependencies"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Step 1: Define all core types**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions for all entities"
```

---

### Task 3: Database Setup

**Files:**
- Create: `src/lib/db/index.ts`
- Create: `src/lib/db/migrations.ts`
- Create: `src/lib/db/queries.ts`

**Step 1: Create database initialization and migration system**

`src/lib/db/index.ts`:
```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { runMigrations } from './migrations';

const DB_PATH = path.join(process.cwd(), 'data', 'loreweaver.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}
```

**Step 2: Create migrations**

`src/lib/db/migrations.ts` — Creates all tables as defined in the design doc:
- sessions, entities, relationships, timeline_events, contradictions, tags, ingestion_queue
- Indexes on entity type, status, name, relationship source/target

**Step 3: Create query functions**

`src/lib/db/queries.ts` — CRUD operations for:
- Sessions: create, getById, getAll, updateStatus
- Entities: create, getById, getAll, getByType, getByStatus, update, updateStatus, search
- Relationships: create, getByEntityId, getAll, updateStatus
- Timeline: create, getAll, getByEntityId
- Contradictions: create, getAll, getUnresolved, resolve
- Tags: create, getByEntityId, delete
- IngestionQueue: create, getNext, updateStatus, getAll
- Stats: getDashboardStats

**Step 4: Verify database creates on first run**

Add a test API route `src/app/api/health/route.ts`:
```typescript
import { getDb } from '@/lib/db';
export async function GET() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as count FROM entities').get();
  return Response.json({ status: 'ok', entities: count });
}
```

Run: `npm run dev` then `curl http://localhost:3000/api/health`
Expected: `{"status":"ok","entities":{"count":0}}`

**Step 5: Commit**

```bash
git add src/lib/db/ src/app/api/health/
git commit -m "feat: add SQLite database with migrations and query layer"
```

---

### Task 4: API Routes

**Files:**
- Create: `src/app/api/entities/route.ts`
- Create: `src/app/api/entities/[id]/route.ts`
- Create: `src/app/api/sessions/route.ts`
- Create: `src/app/api/sessions/[id]/route.ts`
- Create: `src/app/api/relationships/route.ts`
- Create: `src/app/api/contradictions/route.ts`
- Create: `src/app/api/contradictions/[id]/route.ts`
- Create: `src/app/api/review/route.ts`
- Create: `src/app/api/review/[id]/route.ts`
- Create: `src/app/api/ingest/route.ts`
- Create: `src/app/api/ingest/paste/route.ts`
- Create: `src/app/api/stats/route.ts`
- Create: `src/app/api/graph/route.ts`
- Create: `src/app/api/timeline/route.ts`
- Create: `src/app/api/search/route.ts`

**Step 1: Entity routes**

- `GET /api/entities` — list all approved entities, optional `?type=` filter
- `GET /api/entities/[id]` — get entity by id with relationships and tags
- `PUT /api/entities/[id]` — update entity
- `DELETE /api/entities/[id]` — delete entity

**Step 2: Session routes**

- `GET /api/sessions` — list all sessions
- `GET /api/sessions/[id]` — get session with extracted entities
- `POST /api/sessions` — create session manually

**Step 3: Review routes**

- `GET /api/review` — get all proposed entities and relationships
- `PUT /api/review/[id]` — approve, reject, or edit a proposed entity/relationship
- `POST /api/review/batch` — batch approve/reject

**Step 4: Contradiction routes**

- `GET /api/contradictions` — list all, optional `?unresolved=true`
- `PUT /api/contradictions/[id]` — resolve contradiction

**Step 5: Ingestion routes**

- `POST /api/ingest` — upload file
- `POST /api/ingest/paste` — paste text content

**Step 6: Data view routes**

- `GET /api/stats` — dashboard statistics
- `GET /api/graph` — nodes and edges for graph view
- `GET /api/timeline` — timeline events ordered
- `GET /api/search?q=` — full-text search across entities

**Step 7: Commit**

```bash
git add src/app/api/
git commit -m "feat: add REST API routes for all entities and views"
```

---

## Phase 2: AI Extraction Engine

### Task 5: Claude Code CLI Integration

**Files:**
- Create: `src/lib/ai/claude-code.ts`
- Create: `src/lib/ai/anthropic-api.ts`
- Create: `src/lib/ai/index.ts`
- Create: `src/lib/ai/prompts.ts`

**Step 1: Create extraction prompt template**

`src/lib/ai/prompts.ts` — The system prompt instructs Claude to:
- Extract entities (characters, factions, locations, etc.) with name, type, description, properties
- Identify relationships between entities with typed connections
- Place events on a timeline if dates/ordering is mentioned
- Compare against a list of known entity names to flag existing entities
- Detect contradictions against provided existing entity data
- Return structured JSON matching ExtractionResult type
- Include confidence scores

**Step 2: Create Claude Code CLI engine**

`src/lib/ai/claude-code.ts`:
- Uses `child_process.execFile` to invoke `claude` CLI (safe against shell injection)
- Pipes the chunk text + prompt via stdin using `--print` flag
- Parses JSON output from stdout
- Handles errors and timeouts (120s default)
- Returns ExtractionResult

**Step 3: Create Anthropic API engine**

`src/lib/ai/anthropic-api.ts`:
- Uses `@anthropic-ai/sdk`
- Sends same prompt and chunk text
- Parses JSON from response
- Returns ExtractionResult

**Step 4: Create unified AI interface**

`src/lib/ai/index.ts`:
- Reads config to determine engine (claude-code or anthropic-api)
- Exports `extractFromChunk(text: string, existingEntities: string[]): Promise<ExtractionResult>`
- Falls back to API if CLI fails (when API key is configured)

**Step 5: Commit**

```bash
git add src/lib/ai/
git commit -m "feat: add AI extraction engine with Claude Code CLI and API fallback"
```

---

### Task 6: Ingestion Pipeline

**Files:**
- Create: `src/lib/ingestion/chunker.ts`
- Create: `src/lib/ingestion/processor.ts`
- Create: `src/lib/ingestion/file-watcher.ts`
- Create: `src/app/api/ingest/process/route.ts`

**Step 1: Create document chunker**

`src/lib/ingestion/chunker.ts`:
- Takes raw text, splits into ~1500 word chunks
- Maintains paragraph boundaries (don't split mid-paragraph)
- Includes ~200 word overlap between chunks for context continuity
- Returns array of chunks with index

**Step 2: Create ingestion processor**

`src/lib/ingestion/processor.ts`:
- Takes an ingestion queue item
- Creates a session record from it
- Chunks the content
- For each chunk: calls AI extraction, saves proposed entities/relationships/contradictions
- Updates ingestion queue status (processing -> completed/failed)
- Sends existing entity names to AI for dedup

**Step 3: Create file watcher**

`src/lib/ingestion/file-watcher.ts`:
- Uses chokidar to watch `input/` directory
- On new file: read contents, create ingestion queue entry, move file to `input/processed/`
- Supports .txt, .md files (PDF as stretch goal)

**Step 4: Create process API route**

`POST /api/ingest/process` — Triggers processing of next queued item. Called by the UI or by a background interval.

**Step 5: Commit**

```bash
git add src/lib/ingestion/ src/app/api/ingest/process/
git commit -m "feat: add ingestion pipeline with chunking, processing, and file watcher"
```

---

## Phase 3: UI — Layout & Dashboard

### Task 7: App Shell & Navigation

**Files:**
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/nav-bar.tsx`
- Create: `src/components/layout/logo.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Build the app shell**

- Top navigation bar with Loreweaver logo (spider web icon) and app name
- Tab navigation: Dashboard, Codex, Web, Sessions
- Notification badge on Dashboard tab showing pending review count
- Dark theme applied globally

**Step 2: Build the logo component**

- SVG spider sitting on a minimal geometric web
- Silver-violet (#8b7ec8) color scheme
- Small version for nav, larger for loading/empty states

**Step 3: Wire up layout.tsx**

- Apply global dark theme
- Wrap with app shell
- Add Toaster for notifications

**Step 4: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add app shell with navigation and Loreweaver branding"
```

---

### Task 8: Dashboard View

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/stats-bar.tsx`
- Create: `src/components/dashboard/category-grid.tsx`
- Create: `src/components/dashboard/category-card.tsx`
- Create: `src/components/dashboard/pending-review.tsx`
- Create: `src/components/dashboard/ingestion-panel.tsx`

**Step 1: Build stats bar**

- Row of stat cards: Total Entities, Connections, Sessions, Pending Review, Contradictions
- Amber accent for contradiction count if > 0
- Fetches data from `/api/stats`

**Step 2: Build category grid**

- Grid of cards, one per entity type (character, faction, location, etc.)
- Each card shows: icon, name, count, 3 most recent entity names
- Click navigates to Codex filtered by type

**Step 3: Build pending review section**

- Shows at top of dashboard when there are proposed entities
- Preview list: entity name, type badge, source session
- Quick approve/reject buttons
- "Review All" button navigates to full review page

**Step 4: Build ingestion panel**

- Right sidebar or collapsible panel
- Drag-and-drop file upload zone
- Text area for paste input with submit button
- Ingestion queue status list (queued, processing, completed)
- "Process Next" button to trigger extraction

**Step 5: Wire up Dashboard page**

- Compose all components into page.tsx
- Fetch stats, pending items, queue status on mount

**Step 6: Commit**

```bash
git add src/app/page.tsx src/components/dashboard/
git commit -m "feat: add Dashboard view with stats, categories, review preview, and ingestion"
```

---

## Phase 4: UI — Codex (Wiki) View

### Task 9: Codex View

**Files:**
- Create: `src/app/codex/page.tsx`
- Create: `src/app/codex/[id]/page.tsx`
- Create: `src/components/codex/entity-sidebar.tsx`
- Create: `src/components/codex/entity-page.tsx`
- Create: `src/components/codex/relationship-pills.tsx`
- Create: `src/components/codex/entity-editor.tsx`
- Create: `src/components/codex/source-citation.tsx`
- Create: `src/components/codex/backlinks.tsx`

**Step 1: Build entity sidebar**

- Left sidebar listing entities grouped by type
- Collapsible type sections (Characters, Factions, etc.)
- Entity count per section
- Search/filter input at top
- Click entity to navigate to its page

**Step 2: Build entity page**

- Header: entity name, type badge, status badge
- Description section (markdown-rendered)
- Properties section (key-value display based on entity type)
- Relationship pills (clickable badges showing connected entities)
- Timeline section (if entity has timeline events)
- Tags section
- Source citation (link to originating session)
- Backlinks section (other entities that reference this one)
- Edit button to toggle inline editing

**Step 3: Build entity editor**

- Inline edit mode for entity pages
- Edit name, description, properties
- Add/remove tags
- Save/cancel buttons

**Step 4: Build the Codex listing page**

- Main page at /codex shows all entities with sidebar
- Default view: most recently updated entities
- Filter by type via sidebar clicks or URL params

**Step 5: Commit**

```bash
git add src/app/codex/ src/components/codex/
git commit -m "feat: add Codex wiki view with entity pages, sidebar, and editing"
```

---

## Phase 5: UI — Web (Graph) View

### Task 10: Graph View

**Files:**
- Create: `src/app/web/page.tsx`
- Create: `src/components/graph/force-graph.tsx`
- Create: `src/components/graph/graph-controls.tsx`
- Create: `src/components/graph/node-detail-panel.tsx`
- Create: `src/components/graph/graph-legend.tsx`

**Step 1: Build force-directed graph component**

- D3.js force simulation
- Nodes: circles colored by entity type, sized by connection count
- Edges: curved silk-like lines with subtle glow (#8b7ec8 tint)
- Physics: gentle force, collision detection, centering
- Interactions: zoom, pan, drag nodes
- Click node: open detail panel
- Hover edge: show relationship type label

**Step 2: Build graph controls**

- Filter toggles per entity type (show/hide)
- Search input to highlight matching nodes
- Zoom in/out/reset buttons
- Layout options (force-directed, radial, hierarchical)

**Step 3: Build node detail panel**

- Slide-in panel from right when node is clicked
- Shows entity summary: name, type, description
- Lists connections
- "Open in Codex" button
- Close button

**Step 4: Build legend**

- Color key for entity types
- Edge style key for relationship types

**Step 5: Wire up Web page**

- Full-screen graph with controls overlay
- Fetches data from `/api/graph`
- Graph legend in corner

**Step 6: Commit**

```bash
git add src/app/web/ src/components/graph/
git commit -m "feat: add Web graph view with D3 force-directed visualization"
```

---

## Phase 6: Review & Contradictions

### Task 11: Review Queue UI

**Files:**
- Create: `src/app/review/page.tsx`
- Create: `src/components/review/review-list.tsx`
- Create: `src/components/review/review-card.tsx`
- Create: `src/components/review/batch-actions.tsx`

**Step 1: Build review card**

- Shows: entity name, type badge, description, properties preview
- Source session reference
- Confidence score indicator
- Three action buttons: Approve, Edit & Approve, Reject
- Merge button (opens merge dialog with entity search)

**Step 2: Build review list**

- Filterable by entity type
- Sortable by confidence, date, type
- Grouped by source session

**Step 3: Build batch actions**

- Select all / deselect all
- Batch approve selected
- Batch reject selected
- Filter before batch: "Approve all with confidence > 0.8"

**Step 4: Wire up review page**

- Fetches proposed entities from `/api/review`
- Real-time count update after actions

**Step 5: Commit**

```bash
git add src/app/review/ src/components/review/
git commit -m "feat: add review queue UI with approve/reject/merge workflow"
```

---

### Task 12: Contradiction Review UI

**Files:**
- Create: `src/app/contradictions/page.tsx`
- Create: `src/components/contradictions/contradiction-card.tsx`
- Create: `src/components/contradictions/side-by-side.tsx`
- Create: `src/components/contradictions/resolution-actions.tsx`

**Step 1: Build contradiction card**

- Entity name and field in question
- Old value with session source link
- New value with session source link
- Visual diff highlighting

**Step 2: Build side-by-side view**

- Two columns showing source session context
- Highlighted relevant passages
- Entity field comparison

**Step 3: Build resolution actions**

- Keep Old button
- Keep New button
- Merge/Evolve button (creates timeline entry showing change over time)
- Add Note button (flag for later, add text note)

**Step 4: Wire up contradictions page**

- Tab: Unresolved | Resolved
- Unresolved count in page header
- Resolution history log

**Step 5: Commit**

```bash
git add src/app/contradictions/ src/components/contradictions/
git commit -m "feat: add contradiction review page with side-by-side comparison"
```

---

## Phase 7: Sessions & Timeline

### Task 13: Sessions View

**Files:**
- Create: `src/app/sessions/page.tsx`
- Create: `src/app/sessions/[id]/page.tsx`
- Create: `src/components/sessions/session-list.tsx`
- Create: `src/components/sessions/session-detail.tsx`

**Step 1: Build session list**

- Table/list view of all sessions
- Columns: title, date, status (pending/processed), entity count extracted
- Click to view detail

**Step 2: Build session detail**

- Raw text display (scrollable)
- Summary (if generated)
- List of entities extracted from this session
- Reprocess button

**Step 3: Commit**

```bash
git add src/app/sessions/ src/components/sessions/
git commit -m "feat: add Sessions view with list and detail pages"
```

---

### Task 14: Timeline View

**Files:**
- Create: `src/app/timeline/page.tsx`
- Create: `src/components/timeline/timeline-view.tsx`
- Create: `src/components/timeline/timeline-entry.tsx`

**Step 1: Build timeline**

- Vertical timeline layout
- Entries ordered by sort_order
- Each entry shows: date description, event name, involved entities as clickable pills
- Session number badge
- Color-coded by event type

**Step 2: Commit**

```bash
git add src/app/timeline/ src/components/timeline/
git commit -m "feat: add Timeline view with chronological event display"
```

---

## Phase 8: Search & Polish

### Task 15: Global Search

**Files:**
- Create: `src/components/layout/search-command.tsx`
- Modify: `src/components/layout/nav-bar.tsx`

**Step 1: Build command palette search**

- Cmd+K / Ctrl+K to open
- Searches across all entity names and descriptions
- Results grouped by type
- Click result to navigate to Codex page
- Uses `/api/search` endpoint

**Step 2: Commit**

```bash
git add src/components/layout/search-command.tsx src/components/layout/nav-bar.tsx
git commit -m "feat: add global search with command palette (Cmd+K)"
```

---

### Task 16: Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/components/settings/ai-config.tsx`
- Create: `src/lib/config.ts`

**Step 1: Build settings page**

- AI Engine toggle: Claude Code CLI / Anthropic API
- API Key input (for API fallback)
- Model selection (when using API)
- File watcher status indicator (watching/stopped)
- Database stats (size, entity counts)

**Step 2: Create config manager**

- Reads/writes config from `data/config.json`
- API route: `GET/PUT /api/settings`

**Step 3: Commit**

```bash
git add src/app/settings/ src/components/settings/ src/lib/config.ts
git commit -m "feat: add settings page with AI engine configuration"
```

---

## Phase 9: Containerization

### Task 17: Docker Setup

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Create Dockerfile**

- Multi-stage build: deps -> build -> production
- Node 20 Alpine base
- Install better-sqlite3 native dependencies
- Copy built Next.js app
- Expose port 3000
- Volume mounts for data/ and input/

**Step 2: Create docker-compose.yml**

```yaml
version: '3.8'
services:
  loreweaver:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./input:/app/input
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Step 3: Create .dockerignore**

```
node_modules
.next
.git
data/*.db
```

**Step 4: Test build**

Run: `docker-compose up --build`
Expected: App accessible at localhost:3000

**Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "feat: add Docker configuration for k3s deployment"
```

---

## Task Dependency Order

```
Task 1 (Scaffolding)
  -> Task 2 (Types)
    -> Task 3 (Database)
      -> Task 4 (API Routes)
        -> Task 5 (AI Engine)
          -> Task 6 (Ingestion Pipeline)
  -> Task 7 (App Shell) [parallel with 3-6]
    -> Task 8 (Dashboard)
    -> Task 9 (Codex)
    -> Task 10 (Graph)
    -> Task 11 (Review Queue)
    -> Task 12 (Contradictions)
    -> Task 13 (Sessions)
    -> Task 14 (Timeline)
    -> Task 15 (Search)
    -> Task 16 (Settings)
-> Task 17 (Docker) [after all above]
```

Tasks 7-16 depend on tasks 1-6 but can be parallelized among themselves to some degree (all UI views can be built concurrently once the API layer exists).
