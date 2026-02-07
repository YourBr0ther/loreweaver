# Loreweaver — Design Document

A self-hosted D&D knowledge base that weaves campaign lore into an interconnected web.

## Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Graph:** D3.js force-directed graph with spider-web aesthetic
- **Database:** SQLite via better-sqlite3
- **AI Engine:** Claude Code CLI (primary, free with Max plan) → Anthropic API SDK (optional fallback)
- **File Watching:** chokidar for input/ folder monitoring
- **Containerization:** Dockerfile + docker-compose for k3s

## Entity Categories (13)

| Category | Purpose |
|----------|---------|
| Sessions | Source documents — date, players, summary, raw text |
| Characters | NPCs, PCs — stats, relationships, allegiances, status |
| Factions | Guilds, kingdoms, cults — members, goals, rivalries |
| Locations | Cities, dungeons, planes — descriptions, occupants, events |
| Races & Peoples | Cultures, traits, notable members |
| Events | Battles, treaties, betrayals — when, who, consequences |
| Items & Artifacts | Magic items, quest objects — properties, holders, history |
| Lore & Mythology | Gods, prophecies, creation myths, legends |
| Quests & Plot Hooks | Active/completed/abandoned quests, rumors, dangling threads |
| Creatures & Bestiary | Monsters — weaknesses, abilities, encounter locations |
| Timeline | Chronological ordering across sessions |
| Relationships | Typed connections — allied_with, betrayed, serves, parent_of, etc. |
| Contradictions | Conflicting info flagged for review |

## Data Model

### sessions
- id, title, date, raw_text, summary, source_file, status (pending/processed), created_at

### entities
- id, name, type (character/faction/location/race/event/item/lore/quest/creature)
- description, properties (JSON — flexible per type)
- status (proposed/approved/rejected)
- source_session_id, created_at, updated_at

### relationships
- id, source_entity_id, target_entity_id
- type (allied_with/betrayed/serves/parent_of/member_of/located_in/involved_in/owns/etc)
- description, confidence
- status (proposed/approved/rejected)
- source_session_id, created_at

### timeline_events
- id, entity_id, date_description (text), sort_order (integer), session_number

### contradictions
- id, entity_id, field
- old_value, new_value
- old_source_session_id, new_source_session_id
- resolution (null/kept_old/kept_new/merged), notes, created_at

### tags
- id, entity_id, tag (freeform string)

### ingestion_queue
- id, filename, content, input_method (file/upload/paste)
- status (queued/processing/completed/failed), created_at

## Architecture — Data Flow

```
Input (file drop / upload / paste)
    ↓
Ingestion Queue (staged, not yet processed)
    ↓
Chunker (split into ~1500 word segments with overlap)
    ↓
AI Extraction (Claude Code CLI → structured JSON)
  - Entities, relationships, timeline entries
  - Deduplication against existing entity names
  - Contradiction detection against existing data
  - Confidence scores per extraction
    ↓
Review Stage (approve / edit / merge / reject)
    ↓
Knowledge Base (SQLite)
    ↓
Three Views (Dashboard, Codex, Web)
```

## UI Design

### Visual Theme
- Dark mode primary. Background: #0a0a0f (deep charcoal with purple-blue undertones)
- Primary accent: #8b7ec8 (silver-violet — silk threads)
- Secondary accent: #d4a574 (warm amber — candlelight)
- Spider-web motif: graph edges as silk lines, web-like loading states, spider logo
- Empty states: "No threads woven yet" messaging

### Dashboard View
- Campaign command center
- Category cards in grid (count + recent additions per type)
- Pending Review section at top
- Quick stats: total entities, connections, unresolved contradictions
- Ingestion panel on right (upload/paste)

### Codex View (Wiki Pages)
- Left sidebar: entities grouped by category, collapsible
- Main content: entity page with description, properties, relationships as clickable pills
- Source citations back to sessions
- [[backlink]] style references, clickable
- Inline editing

### Web View (Graph)
- Full-screen force-directed graph (D3.js)
- Nodes colored by entity type, sized by connection count
- Silk-thread edges with type labels on hover
- Click node to open detail panel
- Filter by entity type, search to highlight
- Zoom, pan, cluster

## Ingestion Workflow

### Three Input Methods
1. **File Watcher** — chokidar monitors input/ folder (.txt, .md, .pdf). Files moved to input/processed/ after queuing.
2. **Web Upload** — Drag-and-drop on Dashboard. Same file types.
3. **Paste** — Text area in Dashboard ingestion panel.

### Processing Pipeline
1. Document enters ingestion_queue (status: queued)
2. Chunker splits into ~1500 word segments with overlap
3. For each chunk:
   - Send to Claude Code CLI with extraction prompt
   - Prompt includes existing entity names for deduplication
   - Claude returns structured JSON
   - Contradiction detector compares against existing entities
   - Everything lands in DB with status: proposed
4. Document marked completed

### AI Engine Configuration
- **Primary:** Claude Code CLI (subprocess, uses Max plan)
- **Fallback:** Anthropic API SDK (optional, requires API key)
- Config toggle in settings

## Contradiction Detection

### What Gets Flagged
- Factual conflicts (race, class, origin changes)
- Allegiance shifts (could be plot development or error)
- Status changes (alive/dead discrepancies)
- Location conflicts
- Timeline inconsistencies

### Review Page
- Entity and field in question
- Old value with source session citation
- New value with source session citation
- Side-by-side context view

### Resolution Options
- **Keep Old** — discard new info
- **Keep New** — update entity
- **Merge/Evolve** — both true at different times, creates timeline entry
- **Add Note** — flag for later, don't resolve yet
- Resolved contradictions stay in audit log

## Directory Structure

```
loreweaver/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   │   ├── page.tsx      # Dashboard
│   │   ├── codex/        # Wiki pages
│   │   ├── web/          # Graph view
│   │   ├── review/       # Review queue
│   │   ├── contradictions/ # Contradiction review
│   │   ├── sessions/     # Session browser
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── graph/        # D3 graph components
│   │   ├── codex/        # Wiki/entity page components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── review/       # Review queue components
│   │   └── layout/       # Navigation, sidebar, shell
│   ├── lib/              # Core logic
│   │   ├── db/           # SQLite setup, migrations, queries
│   │   ├── ai/           # Claude Code CLI + API extraction
│   │   ├── ingestion/    # File watcher, chunker, queue
│   │   └── extraction/   # Prompt templates, JSON parsing
│   └── types/            # TypeScript type definitions
├── data/                 # SQLite DB file
├── input/                # Watched folder for file drops
├── public/               # Static assets, logo
├── docs/plans/           # Design docs
├── Dockerfile
├── docker-compose.yml
├── tailwind.config.ts
├── next.config.js
└── package.json
```
