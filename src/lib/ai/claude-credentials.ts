import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const TOKEN_PATH = join(process.cwd(), 'data', 'claude-token.txt');

export function getToken(): string | null {
  try {
    if (!existsSync(TOKEN_PATH)) return null;
    const token = readFileSync(TOKEN_PATH, 'utf-8').replace(/\s+/g, '');
    return token || null;
  } catch {
    return null;
  }
}

export function saveToken(token: string): { success: boolean; error?: string } {
  try {
    // Strip all whitespace — tokens can get split across lines when pasted
    const trimmed = token.replace(/\s+/g, '');
    if (!trimmed) {
      return { success: false, error: 'Token is empty' };
    }

    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    writeFileSync(TOKEN_PATH, trimmed);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save token' };
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
