'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, ArrowRight, GitMerge, ExternalLink } from 'lucide-react';
import type { Contradiction, ContradictionResolution } from '@/types';
import { ResolutionActions } from './resolution-actions';

const resolutionLabels: Record<ContradictionResolution, { label: string; color: string }> = {
  kept_old: { label: 'Kept old value', color: '#e2e0ef' },
  kept_new: { label: 'Kept new value', color: '#8b7ec8' },
  merged: { label: 'Merged', color: '#d4a574' },
};

function ResolutionIcon({ resolution }: { resolution: ContradictionResolution }) {
  switch (resolution) {
    case 'kept_old':
      return <ArrowLeft className="w-3 h-3" />;
    case 'kept_new':
      return <ArrowRight className="w-3 h-3" />;
    case 'merged':
      return <GitMerge className="w-3 h-3" />;
  }
}

interface ContradictionCardProps {
  contradiction: Contradiction;
  entityName?: string;
  onResolve: (
    id: string,
    resolution: 'kept_old' | 'kept_new' | 'merged',
    notes?: string
  ) => void;
  removing: boolean;
}

export function ContradictionCard({
  contradiction,
  entityName,
  onResolve,
  removing,
}: ContradictionCardProps) {
  const isResolved = contradiction.resolution !== null;
  const resInfo = isResolved
    ? resolutionLabels[contradiction.resolution!]
    : null;

  return (
    <div
      className="rounded-xl border border-[#1e1e2e] bg-[#12121a] overflow-hidden transition-all duration-300"
      style={{
        opacity: removing ? 0 : 1,
        maxHeight: removing ? 0 : 800,
        marginBottom: removing ? 0 : undefined,
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e] bg-[#0a0a0f]/40">
        <div className="flex items-center gap-2.5">
          {entityName ? (
            <Link
              href={`/codex/${contradiction.entity_id}`}
              className="text-sm font-medium text-[#e2e0ef] hover:text-[#8b7ec8] transition-colors flex items-center gap-1"
            >
              {entityName}
              <ExternalLink className="w-3 h-3 opacity-40" />
            </Link>
          ) : (
            <span className="text-sm font-medium text-[#e2e0ef]/50">
              Entity
            </span>
          )}
          <span className="text-[#e2e0ef]/20">/</span>
          <Badge className="bg-[#d4a574]/12 text-[#d4a574] border-none text-[10px] font-medium capitalize">
            {contradiction.field}
          </Badge>
        </div>

        {isResolved && resInfo && (
          <div
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: resInfo.color }}
          >
            <Check className="w-3 h-3" />
            <ResolutionIcon resolution={contradiction.resolution!} />
            {resInfo.label}
          </div>
        )}
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 divide-x divide-[#1e1e2e]">
        {/* Old value */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e2e0ef]/25" />
            <span className="text-[10px] uppercase tracking-wider text-[#e2e0ef]/25 font-medium">
              Previous
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{
              color:
                isResolved && contradiction.resolution === 'kept_new'
                  ? '#e2e0ef30'
                  : '#e2e0ef99',
              textDecoration:
                isResolved && contradiction.resolution === 'kept_new'
                  ? 'line-through'
                  : 'none',
            }}
          >
            {contradiction.old_value}
          </p>
          {contradiction.old_source_session_id && (
            <p className="text-[10px] text-[#e2e0ef]/20 mt-2">
              Session: {contradiction.old_source_session_id.slice(0, 8)}...
            </p>
          )}
        </div>

        {/* New value */}
        <div className="p-4 relative">
          {/* Glowing divider accent */}
          <div className="absolute left-0 top-3 bottom-3 w-px bg-gradient-to-b from-transparent via-[#8b7ec8]/30 to-transparent" />

          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8b7ec8]/60" />
            <span className="text-[10px] uppercase tracking-wider text-[#8b7ec8]/50 font-medium">
              New
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{
              color:
                isResolved && contradiction.resolution === 'kept_old'
                  ? '#e2e0ef30'
                  : '#e2e0ef',
              textDecoration:
                isResolved && contradiction.resolution === 'kept_old'
                  ? 'line-through'
                  : 'none',
            }}
          >
            {contradiction.new_value}
          </p>
          {contradiction.new_source_session_id && (
            <p className="text-[10px] text-[#e2e0ef]/20 mt-2">
              Session: {contradiction.new_source_session_id.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>

      {/* Resolution notes (if resolved) */}
      {isResolved && contradiction.notes && (
        <div className="px-4 py-2.5 border-t border-[#1e1e2e] bg-[#0a0a0f]/30">
          <p className="text-xs text-[#e2e0ef]/40 italic">
            {contradiction.notes}
          </p>
        </div>
      )}

      {/* Actions (if unresolved) */}
      {!isResolved && (
        <div className="px-4 py-3 border-t border-[#1e1e2e]">
          <ResolutionActions
            onResolve={(resolution, notes) =>
              onResolve(contradiction.id, resolution, notes)
            }
          />
        </div>
      )}
    </div>
  );
}
