'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, GitMerge, MessageSquarePlus, Send } from 'lucide-react';

interface ResolutionActionsProps {
  onResolve: (resolution: 'kept_old' | 'kept_new' | 'merged', notes?: string) => void;
  disabled?: boolean;
}

export function ResolutionActions({ onResolve, disabled }: ResolutionActionsProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [pendingResolution, setPendingResolution] = useState<
    'kept_old' | 'kept_new' | 'merged' | null
  >(null);

  const handleResolve = (resolution: 'kept_old' | 'kept_new' | 'merged') => {
    if (showNotes && notes.trim()) {
      onResolve(resolution, notes.trim());
    } else if (showNotes) {
      // Notes box is open but empty — just resolve without notes
      onResolve(resolution);
    } else {
      onResolve(resolution);
    }
  };

  const handleResolveWithNotes = () => {
    if (pendingResolution) {
      onResolve(pendingResolution, notes.trim() || undefined);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => handleResolve('kept_old')}
          className="h-7 px-3 text-xs bg-[#e2e0ef]/8 text-[#e2e0ef]/60 hover:bg-[#e2e0ef]/15 hover:text-[#e2e0ef] border-none transition-all"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Keep Old
        </Button>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => handleResolve('kept_new')}
          className="h-7 px-3 text-xs bg-[#8b7ec8]/15 text-[#8b7ec8] hover:bg-[#8b7ec8]/25 border-none transition-all"
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          Keep New
        </Button>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => handleResolve('merged')}
          className="h-7 px-3 text-xs bg-[#d4a574]/15 text-[#d4a574] hover:bg-[#d4a574]/25 border-none transition-all"
        >
          <GitMerge className="w-3 h-3 mr-1" />
          Merge
        </Button>

        <div className="w-px h-4 bg-[#1e1e2e]" />

        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            setShowNotes(!showNotes);
            if (!showNotes) setPendingResolution(null);
          }}
          className="h-7 px-2.5 text-xs text-[#e2e0ef]/30 hover:text-[#e2e0ef]/60"
        >
          <MessageSquarePlus className="w-3 h-3 mr-1" />
          {showNotes ? 'Hide Note' : 'Add Note'}
        </Button>
      </div>

      {showNotes && (
        <div className="flex gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add resolution notes..."
            rows={2}
            className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-md px-2.5 py-1.5 text-xs text-[#e2e0ef]/70 placeholder:text-[#e2e0ef]/20 focus:border-[#8b7ec8]/50 focus:outline-none transition-colors resize-none"
          />
          {pendingResolution && (
            <Button
              size="sm"
              onClick={handleResolveWithNotes}
              className="h-auto px-3 text-xs bg-[#8b7ec8]/15 text-[#8b7ec8] hover:bg-[#8b7ec8]/25 border-none"
            >
              <Send className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
