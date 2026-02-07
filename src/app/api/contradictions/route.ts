import { NextRequest } from 'next/server';
import { getAllContradictions, getUnresolvedContradictions } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const unresolved = request.nextUrl.searchParams.get('unresolved');

  if (unresolved === 'true') {
    return Response.json(getUnresolvedContradictions());
  }

  return Response.json(getAllContradictions());
}
