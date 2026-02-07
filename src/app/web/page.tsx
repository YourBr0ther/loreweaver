'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { GraphNode, GraphEdge, EntityType } from '@/types';
import { ForceGraph } from '@/components/graph/force-graph';
import { GraphControls } from '@/components/graph/graph-controls';
import { NodeDetailPanel } from '@/components/graph/node-detail-panel';
import { GraphLegend } from '@/components/graph/graph-legend';
import { LoreweaverLogo } from '@/components/layout/logo';

export default function WebPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controls state
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Zoom controls ref
  const zoomRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  } | null>(null);

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch('/api/graph');
        if (!res.ok) throw new Error('Failed to fetch graph data');
        const data = await res.json();
        setNodes(data.nodes ?? []);
        setEdges(data.edges ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  const handleToggleType = useCallback((type: EntityType) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
  }, []);

  // Visible counts for controls display
  const visibleNodes = nodes.filter((n) => !hiddenTypes.has(n.type));
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="-mx-4 -my-6 h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoreweaverLogo size="lg" className="animate-pulse opacity-40" />
          <p className="text-sm text-[#e2e0ef]/30">Weaving the web...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="-mx-4 -my-6 h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoreweaverLogo size="lg" className="opacity-20" />
          <p className="text-sm text-red-400/70">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────
  if (nodes.length === 0) {
    return (
      <div className="-mx-4 -my-6 h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <LoreweaverLogo size="lg" className="opacity-20" />
          <div>
            <h2
              className="text-lg font-semibold text-[#e2e0ef]/50 mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              No entities yet
            </h2>
            <p className="text-sm text-[#e2e0ef]/30 leading-relaxed">
              Ingest session transcripts from the Dashboard to populate your
              knowledge web. Entities and their relationships will appear here as
              glowing nodes in the web.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Graph view ───────────────────────────────────────────────────
  return (
    <div className="-mx-4 -my-6 relative h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0a0f]">
      {/* Ambient background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#8b7ec808_0%,_transparent_70%)] pointer-events-none" />

      {/* D3 Force Graph */}
      <ForceGraph
        nodes={nodes}
        edges={edges}
        hiddenTypes={hiddenTypes}
        searchQuery={searchQuery}
        selectedNodeId={selectedNode?.id ?? null}
        onNodeClick={handleNodeClick}
        zoomRef={zoomRef}
      />

      {/* Controls overlay */}
      <GraphControls
        hiddenTypes={hiddenTypes}
        onToggleType={handleToggleType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onZoomIn={() => zoomRef.current?.zoomIn()}
        onZoomOut={() => zoomRef.current?.zoomOut()}
        onResetZoom={() => zoomRef.current?.resetZoom()}
        nodeCount={visibleNodes.length}
        edgeCount={visibleEdges.length}
      />

      {/* Legend */}
      <GraphLegend />

      {/* Node detail panel */}
      <NodeDetailPanel
        node={selectedNode}
        edges={edges}
        allNodes={nodes}
        onClose={() => setSelectedNode(null)}
        onNodeClick={(n) => setSelectedNode(n)}
      />
    </div>
  );
}
