'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Entity, Relationship } from '@/types';
import { ReviewList } from '@/components/review/review-list';

export default function ReviewPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const fetchReview = useCallback(async () => {
    try {
      const res = await fetch('/api/review');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntities(data.entities ?? []);
      setRelationships(data.relationships ?? []);
    } catch {
      toast.error('Failed to load review items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  // Animate out then remove from state
  const animateRemove = useCallback(
    (id: string, callback: () => void) => {
      setRemovingIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        callback();
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 350);
    },
    []
  );

  const handleApproveEntity = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/review/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        });
        if (!res.ok) throw new Error();
        const entity = entities.find((e) => e.id === id);
        animateRemove(id, () => {
          setEntities((prev) => prev.filter((e) => e.id !== id));
        });
        toast.success(`Approved "${entity?.name ?? 'entity'}"`);
      } catch {
        toast.error('Failed to approve entity');
      }
    },
    [entities, animateRemove]
  );

  const handleRejectEntity = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/review/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject' }),
        });
        if (!res.ok) throw new Error();
        const entity = entities.find((e) => e.id === id);
        animateRemove(id, () => {
          setEntities((prev) => prev.filter((e) => e.id !== id));
        });
        toast('Rejected', {
          description: entity?.name ?? 'entity',
        });
      } catch {
        toast.error('Failed to reject entity');
      }
    },
    [entities, animateRemove]
  );

  const handleEditApproveEntity = useCallback(
    async (id: string, edits: { name: string; description: string }) => {
      try {
        const res = await fetch(`/api/review/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'edit_approve', edits }),
        });
        if (!res.ok) throw new Error();
        animateRemove(id, () => {
          setEntities((prev) => prev.filter((e) => e.id !== id));
        });
        toast.success(`Edited and approved "${edits.name}"`);
      } catch {
        toast.error('Failed to edit and approve');
      }
    },
    [animateRemove]
  );

  const handleApproveRelationship = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/review/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        });
        if (!res.ok) throw new Error();
        animateRemove(id, () => {
          setRelationships((prev) => prev.filter((r) => r.id !== id));
        });
        toast.success('Relationship approved');
      } catch {
        toast.error('Failed to approve relationship');
      }
    },
    [animateRemove]
  );

  const handleRejectRelationship = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/review/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject' }),
        });
        if (!res.ok) throw new Error();
        animateRemove(id, () => {
          setRelationships((prev) => prev.filter((r) => r.id !== id));
        });
        toast('Relationship rejected');
      } catch {
        toast.error('Failed to reject relationship');
      }
    },
    [animateRemove]
  );

  const handleBatchAction = useCallback(
    async (ids: string[], action: 'approve' | 'reject') => {
      try {
        const res = await fetch('/api/review/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, action }),
        });
        if (!res.ok) throw new Error();
        const result = await res.json();
        // Animate all out
        ids.forEach((id) => {
          setRemovingIds((prev) => new Set(prev).add(id));
        });
        setTimeout(() => {
          setEntities((prev) => prev.filter((e) => !ids.includes(e.id)));
          setRelationships((prev) => prev.filter((r) => !ids.includes(r.id)));
          setRemovingIds(new Set());
        }, 350);
        toast.success(
          `${action === 'approve' ? 'Approved' : 'Rejected'} ${result.updated} items`
        );
      } catch {
        toast.error('Batch action failed');
      }
    },
    []
  );

  const totalPending = entities.length + relationships.length;

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8b7ec8]/30 border-t-[#8b7ec8] rounded-full animate-spin" />
          <p className="text-sm text-[#e2e0ef]/30">Loading review queue...</p>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (totalPending === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
          </div>
          <div>
            <h2
              className="text-lg font-semibold text-[#e2e0ef]/60 mb-1"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              All Clear
            </h2>
            <p className="text-sm text-[#e2e0ef]/30 leading-relaxed">
              No items pending review. New entities will appear here after
              ingesting session transcripts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Review queue ───────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1
          className="text-2xl font-semibold text-[#e2e0ef]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Review Queue
        </h1>
        <Badge className="bg-[#d4a574]/15 text-[#d4a574] border-none text-xs">
          {totalPending} pending
        </Badge>
      </div>

      {/* Review list */}
      <ReviewList
        entities={entities}
        relationships={relationships}
        onApproveEntity={handleApproveEntity}
        onRejectEntity={handleRejectEntity}
        onEditApproveEntity={handleEditApproveEntity}
        onApproveRelationship={handleApproveRelationship}
        onRejectRelationship={handleRejectRelationship}
        onBatchAction={handleBatchAction}
        removingIds={removingIds}
      />
    </div>
  );
}
