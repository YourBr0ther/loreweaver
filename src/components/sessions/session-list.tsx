'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight } from 'lucide-react';
import type { Session } from '@/types';

interface SessionListProps {
  sessions: Session[];
}

export function SessionList({ sessions }: SessionListProps) {
  return (
    <div className="space-y-1.5">
      {sessions.map((session, i) => {
        const dateStr = session.date
          ? new Date(session.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'Unknown date';

        const isPending = session.status === 'pending';

        return (
          <Link
            key={session.id}
            href={`/sessions/${session.id}`}
            className="group flex items-center gap-4 rounded-xl border border-[#1e1e2e] bg-[#12121a] px-4 py-3.5 hover:border-[#2e2e3e] hover:bg-[#16161f] transition-all"
            style={{
              animationDelay: `${i * 40}ms`,
            }}
          >
            {/* Index number */}
            <span className="text-xs tabular-nums text-[#e2e0ef]/15 font-mono w-6 text-right flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8b7ec8]/8 flex-shrink-0">
              <FileText className="w-4 h-4 text-[#8b7ec8]/50" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-medium text-[#e2e0ef] truncate group-hover:text-[#8b7ec8] transition-colors">
                  {session.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#e2e0ef]/30">
                <span>{dateStr}</span>
                {session.source_file && (
                  <>
                    <span className="text-[#1e1e2e]">|</span>
                    <span className="truncate max-w-40">{session.source_file}</span>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <Badge
              className="text-[10px] border-none flex-shrink-0"
              style={{
                backgroundColor: isPending ? '#d4a57415' : '#6ab4a015',
                color: isPending ? '#d4a574' : '#6ab4a0',
              }}
            >
              {isPending ? 'Pending' : 'Processed'}
            </Badge>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-[#e2e0ef]/10 group-hover:text-[#e2e0ef]/30 transition-colors flex-shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
