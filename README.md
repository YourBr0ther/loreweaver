<div align="center">

<img src="public/icon.svg" width="120" height="120" alt="Loreweaver" />

# Loreweaver

**A self-hosted D&D knowledge base that weaves your campaign's story.**

Drop in your session notes and let AI extract characters, factions, locations, items, and more into a searchable, interconnected wiki.

---

</div>

## Features

- **AI Extraction** — Claude-powered entity and relationship extraction from session transcripts
- **Codex Wiki** — Browse, edit, and interlink every entity in your campaign
- **Force-Directed Graph** — Visualize connections between characters, factions, locations, and more
- **Review Queue** — Approve, reject, or edit AI-extracted entities before they enter your canon
- **Contradiction Detection** — Surface conflicting facts and resolve them side-by-side
- **Timeline View** — See your campaign's events in chronological order
- **Global Search** — Cmd+K command palette to find anything instantly
- **File Watcher** — Drop notes into the `input/` folder and ingestion starts automatically

## Quick Start

```bash
# Clone and install
git clone https://github.com/YourBr0ther/loreweaver.git
cd loreweaver
npm install

# Create data directories
mkdir -p data input

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

```bash
docker compose up --build
```

Volumes mount `./data` (SQLite database) and `./input` (session notes) automatically.

## Usage

1. Drop `.txt` or `.md` session notes into the `input/` folder
2. The ingestion pipeline chunks and extracts entities via Claude
3. Review extracted entities in the **Review Queue**
4. Approved entities appear in the **Codex** and **Graph**

## Tech Stack

Next.js &middot; TypeScript &middot; Tailwind CSS &middot; shadcn/ui &middot; D3.js &middot; SQLite &middot; Claude AI

## License

MIT
