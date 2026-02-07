'use client';

import Link from 'next/link';
import { ScrollText } from 'lucide-react';

interface SourceCitationProps {
  sessionId: string | null;
  sessionTitle?: string;
}

export function SourceCitation({ sessionId, sessionTitle }: SourceCitationProps) {
  if (!sessionId) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-[#e2e0ef]/30">
      <ScrollText className="w-3 h-3" />
      <span>Source:</span>
      <Link
        href={`/sessions/${sessionId}`}
        className="text-[#8b7ec8]/60 hover:text-[#8b7ec8] transition-colors"
      >
        {sessionTitle || sessionId.slice(0, 8)}
      </Link>
    </div>
  );
}
