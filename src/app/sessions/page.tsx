'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import type { Session } from '@/types';
import { SessionList } from '@/components/sessions/session-list';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/sessions');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: Session[] = await res.json();
        setSessions(data);
      } catch {
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8b7ec8]/30 border-t-[#8b7ec8] rounded-full animate-spin" />
          <p className="text-sm text-[#e2e0ef]/30">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1
          className="text-2xl font-semibold text-[#e2e0ef]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Sessions
        </h1>
        {sessions.length > 0 && (
          <Badge className="bg-[#1e1e2e] text-[#e2e0ef]/50 border-none text-xs tabular-nums">
            {sessions.length}
          </Badge>
        )}
      </div>

      {/* Empty state */}
      {sessions.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#8b7ec8]/8 flex items-center justify-center">
              <ScrollText className="w-8 h-8 text-[#8b7ec8]/30" />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-[#e2e0ef]/50 mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                No Sessions Yet
              </h2>
              <p className="text-sm text-[#e2e0ef]/30 leading-relaxed">
                Ingest session transcripts from the Dashboard to populate your
                campaign archive.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}
