import Anthropic from '@anthropic-ai/sdk';
import { buildExtractionPrompt } from './prompts';
import type { ExtractionResult } from '@/types';

export async function extractWithAnthropicApi(
  chunkText: string,
  existingEntities: string[],
  apiKey: string,
  model: string = 'claude-sonnet-4-5-20250929'
): Promise<ExtractionResult> {
  const client = new Anthropic({ apiKey });
  const prompt = buildExtractionPrompt(chunkText, existingEntities);

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Anthropic API response');
  }

  return parseExtractionJson(textBlock.text);
}

function parseExtractionJson(output: string): ExtractionResult {
  let jsonStr = output.trim();

  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const objStart = jsonStr.indexOf('{');
  const objEnd = jsonStr.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1) {
    jsonStr = jsonStr.slice(objStart, objEnd + 1);
  }

  const parsed = JSON.parse(jsonStr);

  return {
    entities: Array.isArray(parsed.entities) ? parsed.entities : [],
    relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
    timeline_events: Array.isArray(parsed.timeline_events) ? parsed.timeline_events : [],
    contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions : [],
  };
}
