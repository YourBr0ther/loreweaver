import { NextRequest } from 'next/server';
import { searchEntities } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return Response.json([]);
  }

  const results = searchEntities(q.trim());
  return Response.json(results);
}
