'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntitySidebar } from '@/components/codex/entity-sidebar';
import { LoreweaverLogo } from '@/components/layout/logo';
import type { Entity } from '@/types';

function CodexContent() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get('type');

  useEffect(() => {
    async function fetchEntities() {
      const url = typeFilter
        ? `/api/entities?type=${typeFilter}`
        : '/api/entities';
      const res = await fetch(url);
      if (res.ok) {
        setEntities(await res.json());
      }
    }
    fetchEntities();
  }, [typeFilter]);

  return (
    <div className="flex -mx-4 -mt-6" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <EntitySidebar entities={entities} />

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoreweaverLogo size="lg" className="mx-auto mb-4 opacity-20" />
          <p className="text-[#e2e0ef]/30 text-sm">
            Select an entity from the sidebar to view its details
          </p>
          {entities.length === 0 && (
            <p className="text-[#e2e0ef]/20 text-xs mt-2">
              No entities yet. Ingest a session transcript to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodexPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#e2e0ef]/30">Loading...</div>}>
      <CodexContent />
    </Suspense>
  );
}
