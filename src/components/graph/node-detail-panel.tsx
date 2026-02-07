'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, BookOpen, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GraphNode, GraphEdge, RelationshipType } from '@/types';
import { entityColors } from './force-graph';

const entityLabels: Record<string, string> = {
  character: 'Character',
  faction: 'Faction',
  location: 'Location',
  race: 'Race',
  event: 'Event',
  item: 'Item',
  lore: 'Lore',
  quest: 'Quest',
  creature: 'Creature',
};

function formatRelType(type: RelationshipType): string {
  return type.replace(/_/g, ' ');
}

interface Connection {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  relType: RelationshipType;
  description: string | null;
  direction: 'outgoing' | 'incoming';
}

interface NodeDetailPanelProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNodeClick: (node: GraphNode) => void;
}

export function NodeDetailPanel({
  node,
  edges,
  allNodes,
  onClose,
  onNodeClick,
}: NodeDetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (node) {
      // Trigger enter animation
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [node]);

  if (!node) return null;

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  // Build connections list
  const connections: Connection[] = [];
  for (const edge of edges) {
    if (edge.source === node.id) {
      const target = nodeMap.get(edge.target);
      if (target) {
        connections.push({
          nodeId: target.id,
          nodeName: target.name,
          nodeType: target.type,
          relType: edge.type,
          description: edge.description,
          direction: 'outgoing',
        });
      }
    }
    if (edge.target === node.id) {
      const source = nodeMap.get(edge.source);
      if (source) {
        connections.push({
          nodeId: source.id,
          nodeName: source.name,
          nodeType: source.type,
          relType: edge.type,
          description: edge.description,
          direction: 'incoming',
        });
      }
    }
  }

  const color = entityColors[node.type];

  return (
    <div
      className="absolute top-0 right-0 z-30 h-full w-80 transition-transform duration-300 ease-out"
      style={{ transform: isVisible ? 'translateX(0)' : 'translateX(100%)' }}
    >
      <div className="h-full bg-[#12121a]/95 backdrop-blur-lg border-l border-[#1e1e2e] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#1e1e2e]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <Badge
                className="text-[10px] font-medium border-none px-1.5 py-0"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {entityLabels[node.type] ?? node.type}
              </Badge>
            </div>
            <h3
              className="text-base font-semibold text-[#e2e0ef] leading-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {node.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#e2e0ef]/30 hover:text-[#e2e0ef]/70 hover:bg-[#e2e0ef]/5 transition-colors ml-2 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-4 text-xs text-[#e2e0ef]/50">
            <span>
              <span className="text-[#e2e0ef]/80 font-medium">
                {connections.length}
              </span>{' '}
              connections
            </span>
          </div>
        </div>

        {/* Connections */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-3">
              Connections
            </div>
            {connections.length === 0 ? (
              <p className="text-xs text-[#e2e0ef]/30 italic">
                No connections found
              </p>
            ) : (
              <div className="space-y-1.5">
                {connections.map((conn, i) => {
                  const connColor = entityColors[conn.nodeType as keyof typeof entityColors] ?? '#8b7ec8';
                  const connNode = nodeMap.get(conn.nodeId);
                  return (
                    <button
                      key={`${conn.nodeId}-${conn.relType}-${i}`}
                      onClick={() => connNode && onNodeClick(connNode)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md bg-[#0a0a0f]/50 hover:bg-[#1e1e2e]/50 border border-transparent hover:border-[#1e1e2e] transition-all text-left group"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: connColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#e2e0ef]/80 font-medium truncate group-hover:text-[#e2e0ef]">
                          {conn.nodeName}
                        </div>
                        <div className="text-[10px] text-[#e2e0ef]/30 flex items-center gap-1">
                          {conn.direction === 'outgoing' ? (
                            <>
                              <ArrowRight className="w-2.5 h-2.5" />
                              {formatRelType(conn.relType)}
                            </>
                          ) : (
                            <>
                              {formatRelType(conn.relType)}
                              <ArrowRight className="w-2.5 h-2.5 rotate-180" />
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1e2e]">
          <Link
            href={`/codex/${node.id}`}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              border: `1px solid ${color}30`,
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Open in Codex
          </Link>
        </div>
      </div>
    </div>
  );
}
