'use client';

import { useEffect, useState, use } from 'react';
import { EntitySidebar } from '@/components/codex/entity-sidebar';
import { EntityPage } from '@/components/codex/entity-page';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Entity } from '@/types';

export default function CodexEntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    async function fetchEntities() {
      const res = await fetch('/api/entities');
      if (res.ok) setEntities(await res.json());
    }
    fetchEntities();
  }, []);

  return (
    <div className="flex -mx-4 -mt-6" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <EntitySidebar entities={entities} />

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6">
          <EntityPage entityId={id} />
        </div>
      </ScrollArea>
    </div>
  );
}
