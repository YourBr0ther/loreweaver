import { processNextQueueItem } from '@/lib/ingestion/processor';

export async function POST() {
  const result = await processNextQueueItem();

  if (result.success) {
    return Response.json({
      success: true,
      sessionId: result.sessionId,
      message: 'Processing complete',
    });
  }

  return Response.json(
    { success: false, error: result.error },
    { status: result.error === 'No items in queue' ? 404 : 500 }
  );
}
