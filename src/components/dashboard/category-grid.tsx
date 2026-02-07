'use client';

import { CategoryCard } from './category-card';
import type { EntityType, Entity } from '@/types';

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

interface CategoryGridProps {
  entitiesByType: Record<EntityType, number>;
  recentByType: Record<EntityType, string[]>;
}

export function CategoryGrid({ entitiesByType, recentByType }: CategoryGridProps) {
  return (
    <div>
      <h2
        className="text-lg font-semibold text-[#e2e0ef] mb-4"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Knowledge Base
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTypes.map((type) => (
          <CategoryCard
            key={type}
            type={type}
            count={entitiesByType[type] ?? 0}
            recentNames={recentByType[type] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
