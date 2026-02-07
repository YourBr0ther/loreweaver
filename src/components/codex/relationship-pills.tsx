'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Relationship, Entity } from '@/types';

interface RelationshipPillsProps {
  relationships: Relationship[];
  currentEntityId: string;
  entityMap: Record<string, Entity>;
}

const relationshipLabels: Record<string, string> = {
  allied_with: 'Allied with',
  enemy_of: 'Enemy of',
  betrayed: 'Betrayed',
  serves: 'Serves',
  parent_of: 'Parent of',
  child_of: 'Child of',
  member_of: 'Member of',
  located_in: 'Located in',
  involved_in: 'Involved in',
  owns: 'Owns',
  created: 'Created',
  knows: 'Knows',
  employs: 'Employs',
  worships: 'Worships',
  rules: 'Rules',
  guards: 'Guards',
  hunts: 'Hunts',
  trades_with: 'Trades with',
};

export function RelationshipPills({
  relationships,
  currentEntityId,
  entityMap,
}: RelationshipPillsProps) {
  if (relationships.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider mb-2">
        Connections
      </h3>
      <div className="flex flex-wrap gap-2">
        {relationships.map((rel) => {
          const isSource = rel.source_entity_id === currentEntityId;
          const otherId = isSource ? rel.target_entity_id : rel.source_entity_id;
          const other = entityMap[otherId];
          const label = relationshipLabels[rel.type] || rel.type.replace(/_/g, ' ');

          return (
            <Link key={rel.id} href={`/codex/${otherId}`}>
              <Badge
                variant="outline"
                className="border-[#1e1e2e] hover:border-[#8b7ec8]/30 hover:bg-[#8b7ec8]/5 transition-colors cursor-pointer text-xs py-1 px-2.5"
              >
                <span className="text-[#e2e0ef]/40 mr-1">{label}</span>
                <span className="text-[#8b7ec8]">{other?.name ?? 'Unknown'}</span>
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
