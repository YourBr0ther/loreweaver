'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { EntityType } from '@/types';
import { entityColors } from './force-graph';

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
  'character',
  'faction',
  'location',
  'race',
  'event',
  'item',
  'lore',
  'quest',
  'creature',
];

export function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-20">
      <div className="bg-[#12121a]/90 backdrop-blur-md border border-[#1e1e2e] rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-between w-full px-3 py-2 text-[10px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium hover:text-[#e2e0ef]/50 transition-colors"
        >
          <span>Legend</span>
          {collapsed ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {!collapsed && (
          <div className="px-3 pb-3 space-y-1.5">
            {allTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entityColors[type] }}
                />
                <span className="text-[11px] text-[#e2e0ef]/50">
                  {entityLabels[type]}
                </span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-[#1e1e2e]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-px bg-[#8b7ec8]/40" />
                <span className="text-[10px] text-[#e2e0ef]/30">
                  Relationship
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e2e0ef]/30" />
                  <span className="text-[10px] text-[#e2e0ef]/20 mx-1">&rarr;</span>
                  <span className="w-3 h-3 rounded-full border border-[#e2e0ef]/20" />
                </div>
                <span className="text-[10px] text-[#e2e0ef]/30">
                  Size = connections
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
