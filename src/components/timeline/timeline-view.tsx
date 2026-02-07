'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { EntityType } from '@/types';

const entityColors: Record<string, string> = {
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

const entityLabels: Record<string, string> = {
  character: 'Character',
  faction: 'Faction',
  location: 'Location',
  race: 'Race',
  event: 'Event',
  item: 'Item',
  lore: 'Lore',
  quest: 'Quest',
  creature: 'Creature',
};

interface TimelineEventEnriched {
  id: string;
  entity_id: string;
  date_description: string;
  sort_order: number;
  session_number: number | null;
  entity_name: string;
  entity_type: string;
}

interface TimelineViewProps {
  events: TimelineEventEnriched[];
}

export function TimelineView({ events }: TimelineViewProps) {
  const sorted = [...events].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="relative">
      {/* The vertical thread */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-[#8b7ec8]/30 via-[#8b7ec8]/15 to-[#8b7ec8]/5" />

      {/* Events */}
      <div className="space-y-1">
        {sorted.map((event, i) => {
          const color = entityColors[event.entity_type] ?? '#8b7ec8';

          return (
            <div
              key={event.id}
              className="relative flex items-start gap-4 pl-0 group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Dot on the thread */}
              <div className="relative flex-shrink-0 w-[39px] flex items-center justify-center pt-3">
                {/* Ambient halo */}
                <div
                  className="absolute w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    backgroundColor: color,
                    filter: 'blur(6px)',
                    opacity: 0.15,
                  }}
                />
                {/* Dot */}
                <div
                  className="relative w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 group-hover:scale-125"
                  style={{
                    backgroundColor: `${color}40`,
                    borderColor: color,
                  }}
                />
              </div>

              {/* Content card */}
              <div className="flex-1 pb-4 pt-1">
                <div className="rounded-lg border border-transparent group-hover:border-[#1e1e2e] group-hover:bg-[#12121a]/50 px-3 py-2 -ml-1 transition-all duration-200">
                  {/* Date description */}
                  <div className="text-[11px] text-[#e2e0ef]/30 mb-1 font-medium">
                    {event.date_description}
                  </div>

                  {/* Entity link + type */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/codex/${event.entity_id}`}
                      className="text-sm font-medium hover:underline underline-offset-2 transition-colors"
                      style={{ color }}
                    >
                      {event.entity_name}
                    </Link>
                    <Badge
                      className="text-[9px] border-none px-1.5 py-0"
                      style={{
                        backgroundColor: `${color}12`,
                        color: `${color}99`,
                      }}
                    >
                      {entityLabels[event.entity_type] ?? event.entity_type}
                    </Badge>
                    {event.session_number !== null && (
                      <Badge className="text-[9px] bg-[#1e1e2e] text-[#e2e0ef]/30 border-none px-1.5 py-0">
                        Session {event.session_number}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thread end cap */}
      <div className="absolute left-[17px] bottom-0 w-[5px] h-[5px] rounded-full bg-[#8b7ec8]/10" />
    </div>
  );
}
