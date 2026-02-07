'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { TimelineView } from '@/components/timeline/timeline-view';

interface TimelineEventEnriched {
  id: string;
  entity_id: string;
  date_description: string;
  sort_order: number;
  session_number: number | null;
  entity_name: string;
  entity_type: string;
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEventEnriched[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch('/api/timeline');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: TimelineEventEnriched[] = await res.json();
        setEvents(data);
      } catch {
        toast.error('Failed to load timeline');
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8b7ec8]/30 border-t-[#8b7ec8] rounded-full animate-spin" />
          <p className="text-sm text-[#e2e0ef]/30">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1
          className="text-2xl font-semibold text-[#e2e0ef]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Timeline
        </h1>
        {events.length > 0 && (
          <Badge className="bg-[#1e1e2e] text-[#e2e0ef]/50 border-none text-xs tabular-nums">
            {events.length} events
          </Badge>
        )}
      </div>

      {/* Empty state */}
      {events.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#8b7ec8]/8 flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#8b7ec8]/30" />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-[#e2e0ef]/50 mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                No Timeline Events
              </h2>
              <p className="text-sm text-[#e2e0ef]/30 leading-relaxed">
                Timeline events are extracted from session transcripts when
                temporal information is mentioned. Ingest sessions to build your
                campaign chronology.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <TimelineView events={events} />
      )}
    </div>
  );
}
