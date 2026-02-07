import { execFile } from 'child_process';
import { buildExtractionPrompt } from './prompts';
import type { ExtractionResult } from '@/types';

const TIMEOUT_MS = 120_000;

export async function extractWithClaudeCode(
  chunkText: string,
  existingEntities: string[]
): Promise<ExtractionResult> {
  const prompt = buildExtractionPrompt(chunkText, existingEntities);

  return new Promise((resolve, reject) => {
    const child = execFile(
      'claude',
      ['--print', '--output-format', 'text'],
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Claude Code CLI failed: ${error.message}. stderr: ${stderr}`));
          return;
        }

        try {
          const result = parseExtractionJson(stdout);
          resolve(result);
        } catch (parseError) {
          reject(
            new Error(
              `Failed to parse Claude Code CLI output: ${parseError instanceof Error ? parseError.message : String(parseError)}`
            )
          );
        }
      }
    );

    if (child.stdin) {
      child.stdin.write(prompt);
      child.stdin.end();
    }
  });
}

function parseExtractionJson(output: string): ExtractionResult {
  // Try to find JSON in the output (Claude may wrap it in markdown code blocks)
  let jsonStr = output.trim();

  // Strip markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find a JSON object
  const objStart = jsonStr.indexOf('{');
  const objEnd = jsonStr.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1) {
    jsonStr = jsonStr.slice(objStart, objEnd + 1);
  }

  const parsed = JSON.parse(jsonStr);

  // Validate structure
  return {
    entities: Array.isArray(parsed.entities) ? parsed.entities : [],
    relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
    timeline_events: Array.isArray(parsed.timeline_events) ? parsed.timeline_events : [],
    contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions : [],
  };
}
