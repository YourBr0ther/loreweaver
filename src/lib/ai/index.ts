import { extractWithAnthropicApi } from './anthropic-api';
import { getConfig } from '@/lib/config';
import type { ExtractionResult } from '@/types';

export async function extractFromChunk(
  text: string,
  existingEntities: string[]
): Promise<ExtractionResult> {
  const { ai } = getConfig();

  if (!ai.apiKey) {
    throw new Error('Anthropic API key is required. Configure it in Settings.');
  }

  return await extractWithAnthropicApi(
    text,
    existingEntities,
    ai.apiKey,
    ai.model
  );
}
