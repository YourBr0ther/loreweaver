import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { convert } from 'html-to-text';

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.html', '.htm', '.json'];

export function isSupportedExtension(ext: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(ext.toLowerCase());
}

export function getSupportedExtensions(): string[] {
  return [...SUPPORTED_EXTENSIONS];
}

export async function parseFile(buffer: Buffer, extension: string): Promise<string> {
  const ext = extension.toLowerCase();

  switch (ext) {
    case '.txt':
    case '.md':
      return buffer.toString('utf-8');

    case '.pdf':
      return parsePdf(buffer);

    case '.docx':
      return parseDocx(buffer);

    case '.html':
    case '.htm':
      return parseHtml(buffer);

    case '.json':
      return parseJson(buffer);

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function parseHtml(buffer: Buffer): string {
  const html = buffer.toString('utf-8');
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'img', format: 'skip' },
      { selector: 'a', options: { ignoreHref: true } },
    ],
  });
}

function parseJson(buffer: Buffer): string {
  const raw = buffer.toString('utf-8');
  const parsed = JSON.parse(raw);
  const strings = extractStrings(parsed);
  return strings.join('\n\n');
}

function extractStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(extractStrings);
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(extractStrings);
  }
  return [];
}
