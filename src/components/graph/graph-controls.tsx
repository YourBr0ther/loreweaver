'use client';

import { useState } from 'react';
import { Search, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
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

interface GraphControlsProps {
  hiddenTypes: Set<EntityType>;
  onToggleType: (type: EntityType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  nodeCount: number;
  edgeCount: number;
}

export function GraphControls({
  hiddenTypes,
  onToggleType,
  searchQuery,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  nodeCount,
  edgeCount,
}: GraphControlsProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-[#12121a]/90 backdrop-blur-md border border-[#1e1e2e] rounded-lg px-3 py-2 shadow-lg">
            <Search className="w-3.5 h-3.5 text-[#8b7ec8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search entities..."
              autoFocus
              className="bg-transparent border-none outline-none text-sm text-[#e2e0ef] placeholder:text-[#e2e0ef]/30 w-48"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                }}
                className="text-[#e2e0ef]/40 hover:text-[#e2e0ef]/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setSearchOpen(false);
                onSearchChange('');
              }}
              className="text-[#e2e0ef]/30 hover:text-[#e2e0ef]/50 text-xs ml-1"
            >
              esc
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-[#12121a]/90 backdrop-blur-md border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e0ef]/50 hover:text-[#e2e0ef]/80 hover:border-[#2e2e3e] transition-all shadow-lg"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search</span>
          </button>
        )}
      </div>

      {/* Entity type filters */}
      <div className="bg-[#12121a]/90 backdrop-blur-md border border-[#1e1e2e] rounded-lg p-3 shadow-lg">
        <div className="text-[10px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-2">
          Filter Types
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTypes.map((type) => {
            const isVisible = !hiddenTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => onToggleType(type)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150"
                style={{
                  backgroundColor: isVisible
                    ? `${entityColors[type]}18`
                    : '#1e1e2e40',
                  color: isVisible ? entityColors[type] : '#e2e0ef30',
                  border: `1px solid ${isVisible ? `${entityColors[type]}30` : '#1e1e2e'}`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full transition-opacity"
                  style={{
                    backgroundColor: entityColors[type],
                    opacity: isVisible ? 1 : 0.2,
                  }}
                />
                {entityLabels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#12121a]/90 backdrop-blur-md border border-[#1e1e2e] rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-3 text-[10px] text-[#e2e0ef]/40">
          <span>
            <span className="text-[#8b7ec8] font-medium">{nodeCount}</span> nodes
          </span>
          <span className="text-[#1e1e2e]">|</span>
          <span>
            <span className="text-[#d4a574] font-medium">{edgeCount}</span> connections
          </span>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 bg-[#12121a]/90 backdrop-blur-md border border-[#1e1e2e] rounded-lg p-1 shadow-lg w-fit">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-md text-[#e2e0ef]/40 hover:text-[#e2e0ef]/80 hover:bg-[#e2e0ef]/5 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-md text-[#e2e0ef]/40 hover:text-[#e2e0ef]/80 hover:bg-[#e2e0ef]/5 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-[#1e1e2e]" />
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-md text-[#e2e0ef]/40 hover:text-[#e2e0ef]/80 hover:bg-[#e2e0ef]/5 transition-colors"
          title="Reset view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
