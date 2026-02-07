'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Entity, EntityType } from '@/types';
import { entityConfig } from '@/components/dashboard/category-card';

const typeOrder: EntityType[] = [
  'character', 'faction', 'location', 'race', 'event',
  'item', 'lore', 'quest', 'creature',
];

interface EntitySidebarProps {
  entities: Entity[];
}

export function EntitySidebar({ entities }: EntitySidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = search
    ? entities.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    : entities;

  const grouped = typeOrder.reduce(
    (acc, type) => {
      acc[type] = filtered.filter((e) => e.type === type);
      return acc;
    },
    {} as Record<EntityType, Entity[]>
  );

  const toggleCollapse = (type: string) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-[#1e1e2e] bg-[#0e0e14]">
      <div className="p-3 border-b border-[#1e1e2e]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#e2e0ef]/30" />
          <Input
            placeholder="Filter entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-[#0a0a0f] border-[#1e1e2e] placeholder:text-[#e2e0ef]/25 focus-visible:ring-[#8b7ec8]/30"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          {typeOrder.map((type) => {
            const items = grouped[type];
            const config = entityConfig[type];
            const isCollapsed = collapsed[type];

            if (items.length === 0 && search) return null;

            return (
              <div key={type} className="mb-1">
                <button
                  onClick={() => toggleCollapse(type)}
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-xs font-medium text-[#e2e0ef]/50 hover:text-[#e2e0ef]/70 hover:bg-[#e2e0ef]/5 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span className="uppercase tracking-wider">{config.label}</span>
                  <Badge className="ml-auto bg-transparent text-[#e2e0ef]/30 border-none text-[10px] px-1">
                    {items.length}
                  </Badge>
                </button>

                {!isCollapsed && (
                  <div className="ml-2 space-y-0.5">
                    {items.map((entity) => {
                      const isActive = pathname === `/codex/${entity.id}`;
                      return (
                        <Link
                          key={entity.id}
                          href={`/codex/${entity.id}`}
                          className={cn(
                            'block px-3 py-1.5 rounded text-sm truncate transition-colors',
                            isActive
                              ? 'bg-[#8b7ec8]/15 text-[#8b7ec8]'
                              : 'text-[#e2e0ef]/60 hover:text-[#e2e0ef] hover:bg-[#e2e0ef]/5'
                          )}
                        >
                          {entity.name}
                        </Link>
                      );
                    })}
                    {items.length === 0 && (
                      <p className="px-3 py-1 text-xs text-[#e2e0ef]/20 italic">Empty</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
