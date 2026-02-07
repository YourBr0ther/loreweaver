'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Pencil, X, Save, Undo2 } from 'lucide-react';
import type { Entity, Relationship, EntityType } from '@/types';
import { entityConfig } from '@/components/dashboard/category-card';

// ── Shared color map for relationship cards ─────────────────────────
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

// ── Confidence bar ──────────────────────────────────────────────────
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? '#6ab4a0' : pct >= 50 ? '#d4c474' : '#c27878';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-[#1e1e2e] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] tabular-nums font-medium" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Entity Review Card ──────────────────────────────────────────────
interface EntityReviewCardProps {
  entity: Entity;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEditApprove: (id: string, edits: { name: string; description: string }) => void;
  removing: boolean;
}

export function EntityReviewCard({
  entity,
  selected,
  onSelect,
  onApprove,
  onReject,
  onEditApprove,
  removing,
}: EntityReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(entity.name);
  const [editDesc, setEditDesc] = useState(entity.description);

  const config = entityConfig[entity.type];
  const color = config?.color ?? '#8b7ec8';

  const handleSave = () => {
    onEditApprove(entity.id, { name: editName, description: editDesc });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(entity.name);
    setEditDesc(entity.description);
    setEditing(false);
  };

  return (
    <div
      className="group relative rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4 transition-all duration-300"
      style={{
        opacity: removing ? 0 : 1,
        maxHeight: removing ? 0 : 500,
        marginBottom: removing ? 0 : undefined,
        padding: removing ? '0 1rem' : undefined,
        overflow: 'hidden',
      }}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(entity.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-4 h-4 rounded border border-[#1e1e2e] bg-[#0a0a0f] peer-checked:bg-[#8b7ec8] peer-checked:border-[#8b7ec8] flex items-center justify-center transition-colors">
            {selected && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
        </label>
      </div>

      <div className="ml-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className="text-[10px] font-medium border-none px-1.5 py-0 capitalize"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {entity.type}
              </Badge>
            </div>
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-md px-2 py-1 text-sm text-[#e2e0ef] focus:border-[#8b7ec8] focus:outline-none transition-colors"
              />
            ) : (
              <h3 className="text-sm font-semibold text-[#e2e0ef] leading-tight">
                {entity.name}
              </h3>
            )}
          </div>
        </div>

        {/* Description */}
        {editing ? (
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={3}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-md px-2 py-1.5 text-xs text-[#e2e0ef]/70 focus:border-[#8b7ec8] focus:outline-none transition-colors resize-none mb-3"
          />
        ) : (
          <p className="text-xs text-[#e2e0ef]/50 leading-relaxed mb-3 line-clamp-3">
            {entity.description}
          </p>
        )}

        {/* Confidence & metadata */}
        <div className="mb-3">
          <div className="text-[10px] text-[#e2e0ef]/30 mb-1">Confidence</div>
          <ConfidenceBar
            value={
              (entity.properties as Record<string, unknown>)?.confidence
                ? Number((entity.properties as Record<string, unknown>).confidence)
                : 0.7
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 px-3 text-xs bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-none"
              >
                <Save className="w-3 h-3 mr-1" />
                Save & Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-7 px-3 text-xs text-[#e2e0ef]/40 hover:text-[#e2e0ef]/70"
              >
                <Undo2 className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(entity.id)}
                className="h-7 px-3 text-xs bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-none"
              >
                <Check className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                onClick={() => setEditing(true)}
                className="h-7 px-3 text-xs bg-[#d4a574]/15 text-[#d4a574] hover:bg-[#d4a574]/25 border-none"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(entity.id)}
                className="h-7 px-3 text-xs text-[#e2e0ef]/30 hover:text-red-400 hover:bg-red-400/10"
              >
                <X className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Relationship Review Card ────────────────────────────────────────
interface RelationshipReviewCardProps {
  relationship: Relationship;
  entityNames: Map<string, { name: string; type: EntityType }>;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  removing: boolean;
}

export function RelationshipReviewCard({
  relationship,
  entityNames,
  selected,
  onSelect,
  onApprove,
  onReject,
  removing,
}: RelationshipReviewCardProps) {
  const source = entityNames.get(relationship.source_entity_id);
  const target = entityNames.get(relationship.target_entity_id);
  const relLabel = relationship.type.replace(/_/g, ' ');

  return (
    <div
      className="group relative rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4 transition-all duration-300"
      style={{
        opacity: removing ? 0 : 1,
        maxHeight: removing ? 0 : 300,
        marginBottom: removing ? 0 : undefined,
        padding: removing ? '0 1rem' : undefined,
        overflow: 'hidden',
      }}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(relationship.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-4 h-4 rounded border border-[#1e1e2e] bg-[#0a0a0f] peer-checked:bg-[#8b7ec8] peer-checked:border-[#8b7ec8] flex items-center justify-center transition-colors">
            {selected && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
        </label>
      </div>

      <div className="ml-7">
        {/* Relationship display */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              color: source ? entityColors[source.type] : '#e2e0ef',
              backgroundColor: source
                ? `${entityColors[source.type]}15`
                : '#1e1e2e',
            }}
          >
            {source?.name ?? 'Unknown'}
          </span>
          <span className="text-[10px] text-[#8b7ec8]/60 italic">{relLabel}</span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              color: target ? entityColors[target.type] : '#e2e0ef',
              backgroundColor: target
                ? `${entityColors[target.type]}15`
                : '#1e1e2e',
            }}
          >
            {target?.name ?? 'Unknown'}
          </span>
        </div>

        {relationship.description && (
          <p className="text-xs text-[#e2e0ef]/40 mb-2 line-clamp-2">
            {relationship.description}
          </p>
        )}

        {/* Confidence */}
        <div className="mb-3 max-w-48">
          <ConfidenceBar value={relationship.confidence} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(relationship.id)}
            className="h-7 px-3 text-xs bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-none"
          >
            <Check className="w-3 h-3 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReject(relationship.id)}
            className="h-7 px-3 text-xs text-[#e2e0ef]/30 hover:text-red-400 hover:bg-red-400/10"
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
