'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Entity } from '@/types';
import { entityConfig } from '@/components/dashboard/category-card';

interface BacklinksProps {
  entities: Entity[];
}

export function Backlinks({ entities }: BacklinksProps) {
  if (entities.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider mb-2">
        Referenced By
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {entities.map((entity) => {
          const config = entityConfig[entity.type];
          return (
            <Link key={entity.id} href={`/codex/${entity.id}`}>
              <Badge
                variant="outline"
                className="border-[#1e1e2e] hover:border-[#8b7ec8]/30 hover:bg-[#8b7ec8]/5 transition-colors cursor-pointer text-xs"
                style={{ color: config?.color }}
              >
                {entity.name}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
