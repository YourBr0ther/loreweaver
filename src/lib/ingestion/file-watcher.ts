import { watch } from 'chokidar';
import fs from 'fs';
import path from 'path';
import { createIngestionQueueItem } from '@/lib/db/queries';

const INPUT_DIR = path.join(process.cwd(), 'input');
const PROCESSED_DIR = path.join(INPUT_DIR, 'processed');
const SUPPORTED_EXTENSIONS = ['.txt', '.md'];

let watcher: ReturnType<typeof watch> | null = null;

export function startFileWatcher(): void {
  if (watcher) return;

  // Ensure processed directory exists
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  watcher = watch(INPUT_DIR, {
    ignoreInitial: true,
    depth: 0,
    ignored: [PROCESSED_DIR, /(^|[/\\])\./],
  });

  watcher.on('add', (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) return;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const filename = path.basename(filePath);

      createIngestionQueueItem({
        filename,
        content,
        input_method: 'file',
      });

      // Move to processed
      const destPath = path.join(PROCESSED_DIR, filename);
      fs.renameSync(filePath, destPath);

      console.log(`[FileWatcher] Queued: ${filename}`);
    } catch (error) {
      console.error(`[FileWatcher] Error processing ${filePath}:`, error);
    }
  });

  console.log(`[FileWatcher] Watching ${INPUT_DIR}`);
}

export function stopFileWatcher(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log('[FileWatcher] Stopped');
  }
}

export function isWatcherRunning(): boolean {
  return watcher !== null;
}
