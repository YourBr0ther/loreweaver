'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import type { Session, Entity } from '@/types';
import { SessionDetail } from '@/components/sessions/session-detail';

export default function SessionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<(Session & { entities: Entity[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Session not found');
          } else {
            throw new Error('Failed to fetch');
          }
          return;
        }
        const data = await res.json();
        setSession(data);
      } catch {
        toast.error('Failed to load session');
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8b7ec8]/30 border-t-[#8b7ec8] rounded-full animate-spin" />
          <p className="text-sm text-[#e2e0ef]/30">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-red-400/70">{error ?? 'Session not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SessionDetail session={session} />
    </div>
  );
}
