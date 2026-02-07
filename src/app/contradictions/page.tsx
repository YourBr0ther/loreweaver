'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Scale } from 'lucide-react';
import { toast } from 'sonner';
import type { Contradiction, ContradictionResolution } from '@/types';
import { ContradictionCard } from '@/components/contradictions/contradiction-card';

export default function ContradictionsPage() {
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unresolved' | 'resolved'>('unresolved');
  const [entityNames, setEntityNames] = useState<Map<string, string>>(new Map());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const fetchContradictions = useCallback(async () => {
    try {
      const res = await fetch('/api/contradictions');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Contradiction[] = await res.json();
      setContradictions(data);

      // Fetch entity names for all unique entity_ids
      const uniqueIds = [...new Set(data.map((c) => c.entity_id))];
      const names = new Map<string, string>();
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const entityRes = await fetch(`/api/entities/${id}`);
            if (entityRes.ok) {
              const entity = await entityRes.json();
              names.set(id, entity.name);
            }
          } catch {
            // Entity may have been deleted
          }
        })
      );
      setEntityNames(names);
    } catch {
      toast.error('Failed to load contradictions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContradictions();
  }, [fetchContradictions]);

  const handleResolve = useCallback(
    async (
      id: string,
      resolution: ContradictionResolution,
      notes?: string
    ) => {
      try {
        const res = await fetch(`/api/contradictions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution, notes }),
        });
        if (!res.ok) throw new Error();

        const updated: Contradiction = await res.json();

        // Animate the transition
        setRemovingIds((prev) => new Set(prev).add(id));
        setTimeout(() => {
          setContradictions((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
          );
          setRemovingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 350);

        const resLabel =
          resolution === 'kept_old'
            ? 'Kept old value'
            : resolution === 'kept_new'
              ? 'Kept new value'
              : 'Merged';
        toast.success(`Resolved: ${resLabel}`);
      } catch {
        toast.error('Failed to resolve contradiction');
      }
    },
    []
  );

  const unresolved = useMemo(
    () => contradictions.filter((c) => c.resolution === null),
    [contradictions]
  );
  const resolved = useMemo(
    () => contradictions.filter((c) => c.resolution !== null),
    [contradictions]
  );

  const displayed = activeTab === 'unresolved' ? unresolved : resolved;

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#d4a574]/30 border-t-[#d4a574] rounded-full animate-spin" />
          <p className="text-sm text-[#e2e0ef]/30">
            Loading contradictions...
          </p>
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
          Contradictions
        </h1>
        {unresolved.length > 0 && (
          <Badge className="bg-[#d4a574]/15 text-[#d4a574] border-none text-xs">
            {unresolved.length} unresolved
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#12121a] border border-[#1e1e2e] rounded-lg p-0.5 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('unresolved')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor:
              activeTab === 'unresolved' ? '#d4a57415' : 'transparent',
            color:
              activeTab === 'unresolved' ? '#d4a574' : '#e2e0ef40',
          }}
        >
          Unresolved
          <span
            className="text-[10px] tabular-nums px-1.5 py-0 rounded-full"
            style={{
              backgroundColor:
                activeTab === 'unresolved' ? '#d4a57420' : '#1e1e2e',
              color:
                activeTab === 'unresolved' ? '#d4a574' : '#e2e0ef30',
            }}
          >
            {unresolved.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor:
              activeTab === 'resolved' ? '#8b7ec815' : 'transparent',
            color:
              activeTab === 'resolved' ? '#8b7ec8' : '#e2e0ef40',
          }}
        >
          Resolved
          <span
            className="text-[10px] tabular-nums px-1.5 py-0 rounded-full"
            style={{
              backgroundColor:
                activeTab === 'resolved' ? '#8b7ec820' : '#1e1e2e',
              color:
                activeTab === 'resolved' ? '#8b7ec8' : '#e2e0ef30',
            }}
          >
            {resolved.length}
          </span>
        </button>
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#8b7ec8]/8 flex items-center justify-center">
              <Scale className="w-8 h-8 text-[#8b7ec8]/30" />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-[#e2e0ef]/50 mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {activeTab === 'unresolved'
                  ? 'No Contradictions'
                  : 'No Resolved Items'}
              </h2>
              <p className="text-sm text-[#e2e0ef]/30 leading-relaxed">
                {activeTab === 'unresolved'
                  ? 'No conflicting information has been detected. Contradictions appear when new session data conflicts with existing entity information.'
                  : 'Resolved contradictions will appear here after you make decisions on conflicting data.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contradiction cards */}
      {displayed.length > 0 && (
        <div className="space-y-3">
          {displayed.map((contradiction) => (
            <ContradictionCard
              key={contradiction.id}
              contradiction={contradiction}
              entityName={entityNames.get(contradiction.entity_id)}
              onResolve={handleResolve}
              removing={removingIds.has(contradiction.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
