import { extractWithClaudeCode } from './claude-code';
import { extractWithAnthropicApi } from './anthropic-api';
import type { ExtractionResult, AIConfig } from '@/types';

let config: AIConfig = {
  engine: 'claude-code',
};

export function setAIConfig(newConfig: AIConfig): void {
  config = newConfig;
}

export function getAIConfig(): AIConfig {
  return { ...config };
}

export async function extractFromChunk(
  text: string,
  existingEntities: string[]
): Promise<ExtractionResult> {
  if (config.engine === 'claude-code') {
    try {
      return await extractWithClaudeCode(text, existingEntities);
    } catch (error) {
      console.error('Claude Code CLI extraction failed:', error);

      // Fallback to API if configured
      if (config.apiKey) {
        console.log('Falling back to Anthropic API...');
        return await extractWithAnthropicApi(
          text,
          existingEntities,
          config.apiKey,
          config.model
        );
      }

      throw error;
    }
  }

  // Anthropic API engine
  if (!config.apiKey) {
    throw new Error('Anthropic API key is required when using the API engine');
  }

  return await extractWithAnthropicApi(
    text,
    existingEntities,
    config.apiKey,
    config.model
  );
}
