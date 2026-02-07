'use client';

import { Card } from '@/components/ui/card';
import { Users, Link2, ScrollText, AlertCircle, AlertTriangle } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsBarProps {
  stats: DashboardStats | null;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    {
      label: 'Entities',
      value: stats?.totalEntities ?? 0,
      icon: Users,
      color: '#8b7ec8',
    },
    {
      label: 'Connections',
      value: stats?.totalRelationships ?? 0,
      icon: Link2,
      color: '#8b7ec8',
    },
    {
      label: 'Sessions',
      value: stats?.totalSessions ?? 0,
      icon: ScrollText,
      color: '#8b7ec8',
    },
    {
      label: 'Pending Review',
      value: stats?.pendingReview ?? 0,
      icon: AlertCircle,
      color: stats?.pendingReview ? '#d4a574' : '#8b7ec8',
    },
    {
      label: 'Contradictions',
      value: stats?.unresolvedContradictions ?? 0,
      icon: AlertTriangle,
      color: stats?.unresolvedContradictions ? '#d4a574' : '#8b7ec8',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="relative overflow-hidden border-[#1e1e2e] bg-[#12121a] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#e2e0ef]/50 uppercase tracking-wider">
                  {item.label}
                </p>
                <p
                  className="mt-1.5 text-2xl font-bold tabular-nums"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
              </div>
              <Icon
                className="w-5 h-5 opacity-30"
                style={{ color: item.color }}
              />
            </div>
            {/* Decorative bottom accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
              style={{ background: `linear-gradient(to right, transparent, ${item.color}, transparent)` }}
            />
          </Card>
        );
      })}
    </div>
  );
}
