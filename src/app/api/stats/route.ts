import { getDashboardStats } from '@/lib/db/queries';

export async function GET() {
  return Response.json(getDashboardStats());
}
