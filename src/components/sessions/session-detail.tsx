'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import type { Session, Entity, EntityType } from '@/types';
import { entityConfig } from '@/components/dashboard/category-card';

interface SessionDetailProps {
  session: Session & { entities: Entity[] };
}

export function SessionDetail({ session }: SessionDetailProps) {
  const isPending = session.status === 'pending';
  const dateStr = session.date
    ? new Date(session.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';

  // Split raw text into lines for the journal display
  const textLines = session.raw_text.split('\n');

  // Group entities by type
  const entitiesByType = session.entities.reduce(
    (acc, e) => {
      if (!acc[e.type]) acc[e.type] = [];
      acc[e.type].push(e);
      return acc;
    },
    {} as Record<EntityType, Entity[]>
  );

  return (
    <div>
      {/* Back link */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 text-xs text-[#e2e0ef]/30 hover:text-[#e2e0ef]/60 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sessions
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1
            className="text-2xl font-semibold text-[#e2e0ef]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {session.title}
          </h1>
          <Badge
            className="text-[10px] border-none"
            style={{
              backgroundColor: isPending ? '#d4a57415' : '#6ab4a015',
              color: isPending ? '#d4a574' : '#6ab4a0',
            }}
          >
            {isPending ? 'Pending' : 'Processed'}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#e2e0ef]/30">
          <span>{dateStr}</span>
          {session.source_file && (
            <>
              <span className="text-[#1e1e2e]">|</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {session.source_file}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {session.summary && (
        <div className="mb-6 rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4">
          <h2 className="text-[10px] uppercase tracking-wider text-[#8b7ec8]/50 font-medium mb-2">
            Summary
          </h2>
          <p className="text-sm text-[#e2e0ef]/70 leading-relaxed">
            {session.summary}
          </p>
        </div>
      )}

      {/* Raw text — journal style */}
      <div className="mb-6 rounded-xl border border-[#1e1e2e] bg-[#12121a] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1e1e2e] flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-wider text-[#e2e0ef]/25 font-medium">
            Session Transcript
          </h2>
          <span className="text-[10px] text-[#e2e0ef]/15 tabular-nums">
            {textLines.length} lines
          </span>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-4">
            <div className="font-mono text-xs leading-6">
              {textLines.map((line, i) => (
                <div key={i} className="flex group">
                  <span className="text-[#e2e0ef]/10 select-none w-8 text-right mr-4 flex-shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-[#e2e0ef]/55 group-hover:text-[#e2e0ef]/75 transition-colors break-all">
                    {line || '\u00A0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Extracted entities */}
      {session.entities.length > 0 && (
        <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1e1e2e] flex items-center justify-between">
            <h2 className="text-[10px] uppercase tracking-wider text-[#e2e0ef]/25 font-medium">
              Extracted Entities
            </h2>
            <Badge className="bg-[#1e1e2e] text-[#e2e0ef]/40 border-none text-[10px]">
              {session.entities.length}
            </Badge>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(entitiesByType).map(([type, entities]) => {
              const config = entityConfig[type as EntityType];
              const color = config?.color ?? '#8b7ec8';
              return (
                <div key={type}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: `${color}99` }}
                    >
                      {config?.label ?? type}
                    </span>
                  </div>
                  <div className="space-y-1 ml-3.5">
                    {entities.map((entity) => (
                      <Link
                        key={entity.id}
                        href={`/codex/${entity.id}`}
                        className="group flex items-center gap-2 py-1 text-sm text-[#e2e0ef]/60 hover:text-[#e2e0ef] transition-colors"
                      >
                        <span className="font-medium">{entity.name}</span>
                        <Badge
                          className="text-[9px] border-none px-1 py-0"
                          style={{
                            backgroundColor: entity.status === 'approved'
                              ? '#6ab4a015'
                              : entity.status === 'proposed'
                                ? '#d4a57415'
                                : '#c2787815',
                            color: entity.status === 'approved'
                              ? '#6ab4a0'
                              : entity.status === 'proposed'
                                ? '#d4a574'
                                : '#c27878',
                          }}
                        >
                          {entity.status}
                        </Badge>
                        <ExternalLink className="w-3 h-3 text-[#e2e0ef]/0 group-hover:text-[#e2e0ef]/30 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
