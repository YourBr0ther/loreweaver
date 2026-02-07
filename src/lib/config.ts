import fs from 'fs';
import path from 'path';
import type { AIConfig } from '@/types';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

interface AppConfig {
  ai: AIConfig;
}

const defaultConfig: AppConfig = {
  ai: {
    engine: 'claude-code',
    model: 'claude-sonnet-4-5-20250929',
  },
};

export function getConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(raw) };
    }
  } catch {
    // Fall back to defaults
  }
  return defaultConfig;
}

export function saveConfig(config: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const merged = {
    ...current,
    ...config,
    ai: { ...current.ai, ...(config.ai ?? {}) },
  };

  // Ensure data directory exists
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
}
