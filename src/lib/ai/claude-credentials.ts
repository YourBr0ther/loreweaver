import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const CREDS_PATH = join(process.cwd(), 'data', 'claude-credentials.json');

interface ClaudeCredentials {
  claudeAiOauth: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scopes?: string[];
    subscriptionType?: string;
    rateLimitTier?: string;
  };
  [key: string]: unknown;
}

export function getCredentials(): ClaudeCredentials | null {
  try {
    if (!existsSync(CREDS_PATH)) return null;
    const raw = readFileSync(CREDS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCredentials(json: string): { success: boolean; error?: string } {
  try {
    // Validate it's proper JSON with the expected structure
    const parsed = JSON.parse(json);
    if (!parsed.claudeAiOauth?.accessToken) {
      return { success: false, error: 'Missing claudeAiOauth.accessToken' };
    }

    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    writeFileSync(CREDS_PATH, JSON.stringify(parsed, null, 2));
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function getAccessToken(): string | null {
  const creds = getCredentials();
  return creds?.claudeAiOauth?.accessToken ?? null;
}

export function isAuthenticated(): boolean {
  const creds = getCredentials();
  if (!creds?.claudeAiOauth?.accessToken) return false;
  // Check if token is expired (with 5 min buffer)
  if (creds.claudeAiOauth.expiresAt && creds.claudeAiOauth.expiresAt < Date.now() + 300_000) {
    return false;
  }
  return true;
}
