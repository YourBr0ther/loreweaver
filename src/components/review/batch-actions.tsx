'use client';

import { Button } from '@/components/ui/button';
import { Check, X, CheckCheck, Square } from 'lucide-react';

interface BatchActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchApprove: () => void;
  onBatchReject: () => void;
}

export function BatchActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBatchApprove,
  onBatchReject,
}: BatchActionsProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div className="sticky bottom-4 z-30 flex justify-center">
      <div className="flex items-center gap-3 bg-[#12121a]/95 backdrop-blur-lg border border-[#1e1e2e] rounded-xl px-4 py-2.5 shadow-2xl shadow-black/40">
        {/* Selection info */}
        <span className="text-xs text-[#e2e0ef]/50">
          <span className="text-[#8b7ec8] font-medium">{selectedCount}</span> of{' '}
          {totalCount} selected
        </span>

        <div className="w-px h-5 bg-[#1e1e2e]" />

        {/* Select all / deselect */}
        <Button
          size="sm"
          variant="ghost"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="h-7 px-2.5 text-xs text-[#e2e0ef]/50 hover:text-[#e2e0ef]/80"
        >
          {allSelected ? (
            <>
              <Square className="w-3 h-3 mr-1" />
              Deselect all
            </>
          ) : (
            <>
              <CheckCheck className="w-3 h-3 mr-1" />
              Select all
            </>
          )}
        </Button>

        <div className="w-px h-5 bg-[#1e1e2e]" />

        {/* Batch actions */}
        <Button
          size="sm"
          onClick={onBatchApprove}
          className="h-7 px-3 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none"
        >
          <Check className="w-3 h-3 mr-1" />
          Approve {selectedCount}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onBatchReject}
          className="h-7 px-3 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
        >
          <X className="w-3 h-3 mr-1" />
          Reject {selectedCount}
        </Button>
      </div>
    </div>
  );
}
