'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight } from 'lucide-react';
import type { Entity } from '@/types';
import { entityConfig } from './category-card';

interface PendingReviewProps {
  entities: Entity[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingReview({ entities, onApprove, onReject }: PendingReviewProps) {
  if (entities.length === 0) return null;

  return (
    <Card className="border-[#d4a574]/20 bg-[#12121a] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4a574] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#d4a574]" />
          </span>
          <h2
            className="text-lg font-semibold text-[#d4a574]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Pending Review
          </h2>
          <Badge className="bg-[#d4a574]/15 text-[#d4a574] border-none text-xs">
            {entities.length}
          </Badge>
        </div>
        <Link href="/review">
          <Button variant="ghost" size="sm" className="text-[#d4a574] hover:text-[#d4a574] hover:bg-[#d4a574]/10">
            Review All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {entities.slice(0, 5).map((entity) => {
          const config = entityConfig[entity.type];
          return (
            <div
              key={entity.id}
              className="flex items-center gap-3 rounded-lg bg-[#0a0a0f]/50 px-3 py-2.5"
            >
              <Badge
                variant="outline"
                className="text-[10px] border-[#1e1e2e] capitalize"
                style={{ color: config?.color }}
              >
                {entity.type}
              </Badge>
              <span className="flex-1 text-sm text-[#e2e0ef] truncate font-medium">
                {entity.name}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApprove(entity.id)}
                  className="h-7 w-7 p-0 text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/10"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(entity.id)}
                  className="h-7 w-7 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
