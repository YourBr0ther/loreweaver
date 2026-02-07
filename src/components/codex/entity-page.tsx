'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil } from 'lucide-react';
import { RelationshipPills } from './relationship-pills';
import { SourceCitation } from './source-citation';
import { Backlinks } from './backlinks';
import { EntityEditor } from './entity-editor';
import { entityConfig } from '@/components/dashboard/category-card';
import type { Entity, Relationship, Tag, TimelineEvent } from '@/types';

interface EntityPageData extends Entity {
  relationships: Relationship[];
  tags: Tag[];
  timeline: TimelineEvent[];
}

interface EntityPageProps {
  entityId: string;
}

export function EntityPage({ entityId }: EntityPageProps) {
  const [entity, setEntity] = useState<EntityPageData | null>(null);
  const [editing, setEditing] = useState(false);
  const [entityMap, setEntityMap] = useState<Record<string, Entity>>({});
  const [backlinks, setBacklinks] = useState<Entity[]>([]);

  useEffect(() => {
    async function fetchEntity() {
      const res = await fetch(`/api/entities/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setEntity(data);
      }
    }

    async function fetchAllEntities() {
      const res = await fetch('/api/entities');
      if (res.ok) {
        const entities: Entity[] = await res.json();
        const map: Record<string, Entity> = {};
        for (const e of entities) map[e.id] = e;
        setEntityMap(map);
      }
    }

    fetchEntity();
    fetchAllEntities();
  }, [entityId]);

  useEffect(() => {
    if (!entity || !entityMap) return;
    // Find backlinks: entities that have relationships pointing to this entity
    const linkedIds = new Set(
      entity.relationships
        .map((r) =>
          r.source_entity_id === entityId ? r.target_entity_id : r.source_entity_id
        )
    );
    setBacklinks(
      Object.values(entityMap).filter((e) => linkedIds.has(e.id) && e.id !== entityId)
    );
  }, [entity, entityMap, entityId]);

  if (!entity) {
    return (
      <div className="flex items-center justify-center h-64 text-[#e2e0ef]/30">
        Loading...
      </div>
    );
  }

  const config = entityConfig[entity.type];
  const properties = entity.properties as Record<string, unknown>;
  const propertyEntries = Object.entries(properties).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );

  if (editing) {
    return (
      <EntityEditor
        entity={entity}
        tags={entity.tags}
        onSave={() => {
          setEditing(false);
          // Refetch
          fetch(`/api/entities/${entityId}`)
            .then((r) => r.json())
            .then(setEntity);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-[#1e1e2e]"
              style={{ color: config?.color }}
            >
              {entity.type}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] border-[#1e1e2e] ${
                entity.status === 'approved'
                  ? 'text-emerald-400'
                  : entity.status === 'proposed'
                    ? 'text-[#d4a574]'
                    : 'text-red-400'
              }`}
            >
              {entity.status}
            </Badge>
          </div>
          <h1
            className="text-2xl font-bold text-[#e2e0ef]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {entity.name}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          className="text-[#e2e0ef]/40 hover:text-[#e2e0ef]"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
      </div>

      {/* Description */}
      <Card className="border-[#1e1e2e] bg-[#12121a] p-5">
        <p className="text-sm leading-relaxed text-[#e2e0ef]/80 whitespace-pre-wrap">
          {entity.description || 'No description yet.'}
        </p>
      </Card>

      {/* Properties */}
      {propertyEntries.length > 0 && (
        <Card className="border-[#1e1e2e] bg-[#12121a] p-5">
          <h3 className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider mb-3">
            Properties
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {propertyEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="text-[#e2e0ef]/40 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="text-[#e2e0ef]/80">{String(value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Relationships */}
      <RelationshipPills
        relationships={entity.relationships}
        currentEntityId={entityId}
        entityMap={entityMap}
      />

      {/* Timeline */}
      {entity.timeline.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider mb-2">
            Timeline
          </h3>
          <div className="space-y-2">
            {entity.timeline.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 text-sm pl-4 border-l-2 border-[#8b7ec8]/20"
              >
                <span className="text-[#8b7ec8]/60">{event.date_description}</span>
                {event.session_number && (
                  <Badge className="bg-[#1e1e2e] text-[#e2e0ef]/40 border-none text-[10px]">
                    Session {event.session_number}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {entity.tags.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider mb-2">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {entity.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="border-[#1e1e2e] text-[#e2e0ef]/50 text-xs"
              >
                {tag.tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-[#1e1e2e]" />

      {/* Backlinks */}
      <Backlinks entities={backlinks} />

      {/* Source */}
      <SourceCitation sessionId={entity.source_session_id} />
    </div>
  );
}
