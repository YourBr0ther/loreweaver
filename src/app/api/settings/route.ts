import { NextRequest } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';

export async function GET() {
  const config = getConfig();
  // Mask API key for security
  const masked = {
    ...config,
    ai: {
      ...config.ai,
      apiKey: config.ai.apiKey ? '****' + config.ai.apiKey.slice(-4) : undefined,
    },
  };
  return Response.json(masked);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const updated = saveConfig(body);
  return Response.json({
    ...updated,
    ai: {
      ...updated.ai,
      apiKey: updated.ai.apiKey ? '****' + updated.ai.apiKey.slice(-4) : undefined,
    },
  });
}
