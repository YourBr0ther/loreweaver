import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as count FROM entities').get() as { count: number };
  return Response.json({ status: 'ok', entities: count });
}
