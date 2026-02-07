'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsBar } from '@/components/dashboard/stats-bar';
import { CategoryGrid } from '@/components/dashboard/category-grid';
import { PendingReview } from '@/components/dashboard/pending-review';
import { IngestionPanel } from '@/components/dashboard/ingestion-panel';
import { toast } from 'sonner';
import type { DashboardStats, Entity, EntityType, IngestionQueueItem } from '@/types';

const allTypes: EntityType[] = [
  'character', 'faction', 'location', 'race', 'event',
  'item', 'lore', 'quest', 'creature',
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEntities, setPendingEntities] = useState<Entity[]>([]);
  const [queueItems, setQueueItems] = useState<IngestionQueueItem[]>([]);
  const [recentByType, setRecentByType] = useState<Record<EntityType, string[]>>(
    {} as Record<EntityType, string[]>
  );

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, reviewRes, entitiesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/review'),
        fetch('/api/entities'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (reviewRes.ok) {
        const data = await reviewRes.json();
        setPendingEntities(data.entities ?? []);
      }
      if (entitiesRes.ok) {
        const entities: Entity[] = await entitiesRes.json();
        const recent = {} as Record<EntityType, string[]>;
        for (const t of allTypes) {
          recent[t] = entities
            .filter((e) => e.type === t)
            .slice(0, 3)
            .map((e) => e.name);
        }
        setRecentByType(recent);
      }
    } catch {
      // Non-critical fetch failure
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/review/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        toast.success('Entity approved');
        fetchData();
      }
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/review/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (res.ok) {
        toast.success('Entity rejected');
        fetchData();
      }
    } catch {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <StatsBar stats={stats} />

      <PendingReview
        entities={pendingEntities}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryGrid
            entitiesByType={stats?.entitiesByType ?? ({} as Record<EntityType, number>)}
            recentByType={recentByType}
          />
        </div>
        <div>
          <IngestionPanel queueItems={queueItems} onRefresh={fetchData} />
        </div>
      </div>
    </div>
  );
}
