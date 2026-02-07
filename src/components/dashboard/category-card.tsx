'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EntityType } from '@/types';
import {
  User,
  Shield,
  MapPin,
  Dna,
  Zap,
  Gem,
  BookOpen,
  Swords,
  Bug,
} from 'lucide-react';

const entityConfig: Record<
  EntityType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  character: { label: 'Characters', icon: User, color: '#8b7ec8' },
  faction: { label: 'Factions', icon: Shield, color: '#d4a574' },
  location: { label: 'Locations', icon: MapPin, color: '#6ab4a0' },
  race: { label: 'Races', icon: Dna, color: '#c27878' },
  event: { label: 'Events', icon: Zap, color: '#d4c474' },
  item: { label: 'Items', icon: Gem, color: '#74a8d4' },
  lore: { label: 'Lore', icon: BookOpen, color: '#b07ec8' },
  quest: { label: 'Quests', icon: Swords, color: '#d49674' },
  creature: { label: 'Creatures', icon: Bug, color: '#78c28e' },
};

interface CategoryCardProps {
  type: EntityType;
  count: number;
  recentNames: string[];
}

export function CategoryCard({ type, count, recentNames }: CategoryCardProps) {
  const config = entityConfig[type];
  const Icon = config.icon;

  return (
    <Link href={`/codex?type=${type}`}>
      <Card className="group relative overflow-hidden border-[#1e1e2e] bg-[#12121a] p-4 transition-all duration-200 hover:border-[#2e2e3e] hover:bg-[#16161f] cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <span style={{ color: config.color }}>
              <Icon className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#e2e0ef]">{config.label}</h3>
          </div>
          <Badge
            variant="secondary"
            className="bg-[#1e1e2e] text-[#e2e0ef]/70 border-none text-xs tabular-nums"
          >
            {count}
          </Badge>
        </div>

        {recentNames.length > 0 ? (
          <div className="space-y-1">
            {recentNames.map((name) => (
              <p
                key={name}
                className="text-xs text-[#e2e0ef]/40 truncate"
              >
                {name}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#e2e0ef]/25 italic">No entries yet</p>
        )}

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${config.color}08 0%, transparent 70%)`,
          }}
        />
      </Card>
    </Link>
  );
}

export { entityConfig };
