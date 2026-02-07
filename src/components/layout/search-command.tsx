'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Entity, EntityType } from '@/types';

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

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data: Entity[] = await res.json();
        setResults(data);
        setSelectedIndex(0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // Navigate to result
  const navigateTo = useCallback(
    (entity: Entity) => {
      router.push(`/codex/${entity.id}`);
      onClose();
    },
    [router, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex]);
    }
  };

  // Group results by type
  const grouped = results.reduce(
    (acc, entity) => {
      if (!acc[entity.type]) acc[entity.type] = [];
      acc[entity.type].push(entity);
      return acc;
    },
    {} as Record<EntityType, Entity[]>
  );

  // Flat list for index tracking
  const flatResults = results;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-lg bg-[#12121a] border border-[#1e1e2e] rounded-xl shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="relative">
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="w-4 h-4 text-[#8b7ec8]/60 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search entities..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#e2e0ef] placeholder:text-[#e2e0ef]/20"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-[#8b7ec8]/20 border-t-[#8b7ec8] rounded-full animate-spin flex-shrink-0" />
              )}
              {query && !loading && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="text-[#e2e0ef]/20 hover:text-[#e2e0ef]/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#e2e0ef]/15 bg-[#0a0a0f] border border-[#1e1e2e]">
                esc
              </kbd>
            </div>
            {/* Glowing underline */}
            <div
              className="absolute bottom-0 left-4 right-4 h-px transition-opacity duration-300"
              style={{
                background: `linear-gradient(90deg, transparent, ${loading ? '#8b7ec8' : '#8b7ec880'}, transparent)`,
                opacity: query ? 1 : 0.3,
              }}
            />
          </div>

          {/* Results */}
          {query.trim() && (
            <div className="max-h-[50vh] overflow-y-auto">
              {results.length === 0 && !loading && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-[#e2e0ef]/25">No entities found</p>
                </div>
              )}

              {Object.entries(grouped).map(([type, entities]) => {
                const color = entityColors[type as EntityType] ?? '#8b7ec8';
                return (
                  <div key={type}>
                    {/* Type header */}
                    <div className="px-4 py-1.5 bg-[#0a0a0f]/50">
                      <span
                        className="text-[10px] uppercase tracking-wider font-medium"
                        style={{ color: `${color}70` }}
                      >
                        {type}s
                      </span>
                    </div>
                    {/* Entity results */}
                    {entities.map((entity) => {
                      const flatIndex = flatResults.indexOf(entity);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <button
                          key={entity.id}
                          onClick={() => navigateTo(entity)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{
                            backgroundColor: isSelected ? '#8b7ec810' : 'transparent',
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#e2e0ef] truncate">
                                {entity.name}
                              </span>
                              <Badge
                                className="text-[9px] border-none px-1 py-0 flex-shrink-0"
                                style={{
                                  backgroundColor: `${color}15`,
                                  color: `${color}99`,
                                }}
                              >
                                {entity.type}
                              </Badge>
                            </div>
                            {entity.description && (
                              <p className="text-[11px] text-[#e2e0ef]/25 truncate mt-0.5">
                                {entity.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <kbd className="hidden sm:inline-flex items-center px-1 py-0 rounded text-[9px] font-mono text-[#e2e0ef]/10 bg-[#0a0a0f] border border-[#1e1e2e]">
                              &crarr;
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer hint */}
          {!query.trim() && (
            <div className="px-4 py-3 border-t border-[#1e1e2e]">
              <p className="text-[11px] text-[#e2e0ef]/15">
                Type to search across all entities, locations, items, and lore...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
