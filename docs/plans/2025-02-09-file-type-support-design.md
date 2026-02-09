# Extended File Type Support for Ingestion Pipeline

**Date:** 2025-02-09
**Status:** Approved

## Summary

Add support for PDF, DOCX, HTML, and JSON file imports alongside existing TXT and MD support.

## Architecture

New parser module (`src/lib/ingestion/parsers.ts`) sits between file upload and existing chunker:

```
File upload → parsers.ts (new) → chunker.ts (existing) → AI extraction (existing)
```

### Parsers

| Extension    | Library        | Notes                                      |
| ------------ | -------------- | ------------------------------------------ |
| `.pdf`       | `pdf-parse`    | Extracts text from PDF buffer              |
| `.docx`      | `mammoth`      | Extracts raw text, ignores formatting      |
| `.html/.htm` | `html-to-text` | Strips tags, preserves paragraph structure  |
| `.json`      | Native         | Recursive string value extraction           |
| `.txt/.md`   | Native         | Direct UTF-8 decode (existing behavior)     |

### Files Changed

1. **New:** `src/lib/ingestion/parsers.ts` — `parseFile(buffer, extension) → string`
2. **Edit:** `src/app/api/ingest/route.ts` — read as Buffer, call parser, validate extension
3. **Edit:** `src/lib/ingestion/file-watcher.ts` — expand SUPPORTED_EXTENSIONS, read as Buffer
4. **Edit:** `src/components/dashboard/ingestion-panel.tsx` — update accept attribute and label
5. **Edit:** `next.config.ts` — add packages to serverExternalPackages if needed

### Dependencies

- `pdf-parse` — PDF text extraction
- `mammoth` — DOCX to text
- `html-to-text` — HTML to text
