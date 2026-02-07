'use client';

import { useState, useMemo } from 'react';
import type { Entity, Relationship, EntityType } from '@/types';
import { EntityReviewCard, RelationshipReviewCard } from './review-card';
import { BatchActions } from './batch-actions';
import { Badge } from '@/components/ui/badge';

// ── Entity type colors ──────────────────────────────────────────────
const entityColors: Record<EntityType, string> = {
  character: '#8b7ec8',
  faction: '#d4a574',
  location: '#6ab4a0',
  race: '#c27878',
  event: '#d4c474',
  item: '#74a8d4',
  lore: '#b07ec8',
  quest: '#d49674',
  creature: '#78c28e',
};

const entityLabels: Record<EntityType, string> = {
  character: 'Characters',
  faction: 'Factions',
  location: 'Locations',
  race: 'Races',
  event: 'Events',
  item: 'Items',
  lore: 'Lore',
  quest: 'Quests',
  creature: 'Creatures',
};

const allTypes: EntityType[] = [
  'character', 'faction', 'location', 'race', 'event',
  'item', 'lore', 'quest', 'creature',
];

type SortMode = 'newest' | 'type' | 'name';

interface ReviewListProps {
  entities: Entity[];
  relationships: Relationship[];
  onApproveEntity: (id: string) => void;
  onRejectEntity: (id: string) => void;
  onEditApproveEntity: (id: string, edits: { name: string; description: string }) => void;
  onApproveRelationship: (id: string) => void;
  onRejectRelationship: (id: string) => void;
  onBatchAction: (ids: string[], action: 'approve' | 'reject') => void;
  removingIds: Set<string>;
}

export function ReviewList({
  entities,
  relationships,
  onApproveEntity,
  onRejectEntity,
  onEditApproveEntity,
  onApproveRelationship,
  onRejectRelationship,
  onBatchAction,
  removingIds,
}: ReviewListProps) {
  const [filterType, setFilterType] = useState<EntityType | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Build entity name lookup for relationship display
  const entityNameMap = useMemo(() => {
    const map = new Map<string, { name: string; type: EntityType }>();
    entities.forEach((e) => map.set(e.id, { name: e.name, type: e.type }));
    return map;
  }, [entities]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;
    if (filterType) {
      filtered = filtered.filter((e) => e.type === filterType);
    }
    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [entities, filterType, sortMode]);

  // Count per type for filter badges
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<EntityType, number>> = {};
    entities.forEach((e) => {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
    });
    return counts;
  }, [entities]);

  // All IDs for batch
  const allItemIds = useMemo(() => {
    const ids = filteredEntities.map((e) => e.id);
    relationships.forEach((r) => ids.push(r.id));
    return ids;
  }, [filteredEntities, relationships]);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(allItemIds));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Filters & sort */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
            style={{
              backgroundColor: filterType === null ? '#8b7ec818' : 'transparent',
              color: filterType === null ? '#8b7ec8' : '#e2e0ef50',
              border: `1px solid ${filterType === null ? '#8b7ec830' : '#1e1e2e'}`,
            }}
          >
            All
            <span className="ml-1 text-[10px] opacity-60">{entities.length}</span>
          </button>
          {allTypes
            .filter((t) => (typeCounts[t] ?? 0) > 0)
            .map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? null : type)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    filterType === type
                      ? `${entityColors[type]}18`
                      : 'transparent',
                  color:
                    filterType === type ? entityColors[type] : '#e2e0ef40',
                  border: `1px solid ${
                    filterType === type ? `${entityColors[type]}30` : '#1e1e2e'
                  }`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: entityColors[type],
                    opacity: filterType === type ? 1 : 0.4,
                  }}
                />
                {entityLabels[type]}
                <span className="text-[10px] opacity-60">
                  {typeCounts[type]}
                </span>
              </button>
            ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-[#12121a] border border-[#1e1e2e] rounded-lg p-0.5">
          {(
            [
              ['newest', 'Newest'],
              ['type', 'Type'],
              ['name', 'Name'],
            ] as [SortMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
              style={{
                backgroundColor: sortMode === mode ? '#8b7ec815' : 'transparent',
                color: sortMode === mode ? '#8b7ec8' : '#e2e0ef40',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Entity cards */}
      {filteredEntities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs uppercase tracking-wider text-[#e2e0ef]/30 font-medium">
              Entities
            </h3>
            <Badge className="bg-[#1e1e2e] text-[#e2e0ef]/50 border-none text-[10px]">
              {filteredEntities.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {filteredEntities.map((entity) => (
              <EntityReviewCard
                key={entity.id}
                entity={entity}
                selected={selectedIds.has(entity.id)}
                onSelect={handleSelect}
                onApprove={onApproveEntity}
                onReject={onRejectEntity}
                onEditApprove={onEditApproveEntity}
                removing={removingIds.has(entity.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Relationship cards */}
      {relationships.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs uppercase tracking-wider text-[#e2e0ef]/30 font-medium">
              Relationships
            </h3>
            <Badge className="bg-[#1e1e2e] text-[#e2e0ef]/50 border-none text-[10px]">
              {relationships.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {relationships.map((rel) => (
              <RelationshipReviewCard
                key={rel.id}
                relationship={rel}
                entityNames={entityNameMap}
                selected={selectedIds.has(rel.id)}
                onSelect={handleSelect}
                onApprove={onApproveRelationship}
                onReject={onRejectRelationship}
                removing={removingIds.has(rel.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Batch actions bar */}
      <BatchActions
        selectedCount={selectedIds.size}
        totalCount={allItemIds.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBatchApprove={() => {
          onBatchAction(Array.from(selectedIds), 'approve');
          setSelectedIds(new Set());
        }}
        onBatchReject={() => {
          onBatchAction(Array.from(selectedIds), 'reject');
          setSelectedIds(new Set());
        }}
      />
    </div>
  );
}
