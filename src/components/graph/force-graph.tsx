'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { EntityType, RelationshipType, GraphNode, GraphEdge } from '@/types';

// ── Entity type color map ──────────────────────────────────────────
export const entityColors: Record<EntityType, string> = {
  character: '#8b7ec8',
  faction: '#d4a574',
  location: '#6ab4a0',
  race: '#c27878',
  event: '#d4c474',
  item: '#74a8d4',
  lore: '#b07ec8',
  quest: '#d49674',
  creature: '#78c28e',
};

// ── Relationship label formatting ──────────────────────────────────
function formatRelType(type: RelationshipType): string {
  return type.replace(/_/g, ' ');
}

// ── D3 simulation node/link types ──────────────────────────────────
interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: EntityType;
  connectionCount: number;
  radius: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: RelationshipType;
  description: string | null;
}

// ── Component props ────────────────────────────────────────────────
interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hiddenTypes: Set<EntityType>;
  searchQuery: string;
  selectedNodeId: string | null;
  onNodeClick: (node: GraphNode | null) => void;
  onZoomChange?: (transform: d3.ZoomTransform) => void;
  zoomRef?: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  } | null>;
}

export function ForceGraph({
  nodes,
  edges,
  hiddenTypes,
  searchQuery,
  selectedNodeId,
  onNodeClick,
  zoomRef,
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Compute node radius from connectionCount
  const getRadius = useCallback((count: number) => {
    return Math.max(6, Math.min(22, 6 + count * 3));
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const container = svg.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // ── Clear previous render ──────────────────────────────────
    d3.select(svg).selectAll('*').remove();

    // ── Filter out hidden types ────────────────────────────────
    const visibleNodes = nodes.filter((n) => !hiddenTypes.has(n.type));
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    if (visibleNodes.length === 0) return;

    // ── Build sim data ─────────────────────────────────────────
    const simNodes: SimNode[] = visibleNodes.map((n) => ({
      ...n,
      radius: getRadius(n.connectionCount),
    }));

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = visibleEdges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
        description: e.description,
      }));

    // ── SVG setup ──────────────────────────────────────────────
    const svgSel = d3
      .select(svg)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // ── Defs: filters & gradients ──────────────────────────────
    const defs = svgSel.append('defs');

    // Glow filter for edges
    const edgeGlow = defs.append('filter').attr('id', 'edge-glow');
    edgeGlow
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'blur');
    edgeGlow
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .join('feMergeNode')
      .attr('in', (d) => d);

    // Node glow filter
    const nodeGlow = defs.append('filter').attr('id', 'node-glow');
    nodeGlow
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    nodeGlow
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .join('feMergeNode')
      .attr('in', (d) => d);

    // Search pulse filter
    const pulseGlow = defs.append('filter').attr('id', 'search-pulse');
    pulseGlow
      .append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'blur');
    pulseGlow
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .join('feMergeNode')
      .attr('in', (d) => d);

    // Vignette gradient overlay
    const vignette = defs
      .append('radialGradient')
      .attr('id', 'vignette')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '70%');
    vignette
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0a0a0f')
      .attr('stop-opacity', 0);
    vignette
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0a0a0f')
      .attr('stop-opacity', 0.6);

    // ── Background ─────────────────────────────────────────────
    svgSel
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent');

    // ── Zoom group ─────────────────────────────────────────────
    const g = svgSel.append('g').attr('class', 'zoom-group');

    // ── Zoom behavior ──────────────────────────────────────────
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svgSel.call(zoom);

    // Expose zoom controls
    if (zoomRef) {
      zoomRef.current = {
        zoomIn: () => svgSel.transition().duration(300).call(zoom.scaleBy, 1.4),
        zoomOut: () => svgSel.transition().duration(300).call(zoom.scaleBy, 0.7),
        resetZoom: () =>
          svgSel
            .transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2)),
      };
    }

    // ── Links (edges) ──────────────────────────────────────────
    const linkGroup = g.append('g').attr('class', 'links');

    // Glow layer (drawn first, behind)
    const linkGlows = linkGroup
      .selectAll<SVGPathElement, SimLink>('.link-glow')
      .data(simLinks)
      .join('path')
      .attr('class', 'link-glow')
      .attr('fill', 'none')
      .attr('stroke', '#8b7ec8')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.08)
      .attr('filter', 'url(#edge-glow)');

    // Actual edge lines
    const linkLines = linkGroup
      .selectAll<SVGPathElement, SimLink>('.link-line')
      .data(simLinks)
      .join('path')
      .attr('class', 'link-line')
      .attr('fill', 'none')
      .attr('stroke', '#8b7ec8')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.25)
      .style('cursor', 'pointer');

    // Edge hover — show tooltip
    linkLines
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('stroke-opacity', 0.6).attr('stroke-width', 2);
        const tooltip = tooltipRef.current;
        if (tooltip) {
          tooltip.textContent = formatRelType(d.type);
          tooltip.style.opacity = '1';
          tooltip.style.left = `${event.clientX + 12}px`;
          tooltip.style.top = `${event.clientY - 8}px`;
        }
      })
      .on('mousemove', function (event) {
        const tooltip = tooltipRef.current;
        if (tooltip) {
          tooltip.style.left = `${event.clientX + 12}px`;
          tooltip.style.top = `${event.clientY - 8}px`;
        }
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke-opacity', 0.25).attr('stroke-width', 1);
        const tooltip = tooltipRef.current;
        if (tooltip) tooltip.style.opacity = '0';
      });

    // ── Nodes ──────────────────────────────────────────────────
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeGs = nodeGroup
      .selectAll<SVGGElement, SimNode>('.node-group')
      .data(simNodes, (d) => d.id)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer');

    // Outer glow circle (ambient)
    nodeGs
      .append('circle')
      .attr('class', 'node-ambient')
      .attr('r', (d) => d.radius + 4)
      .attr('fill', (d) => entityColors[d.type])
      .attr('opacity', 0.08)
      .attr('filter', 'url(#node-glow)');

    // Main circle
    nodeGs
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => entityColors[d.type])
      .attr('stroke', (d) => entityColors[d.type])
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .attr('fill-opacity', 0.85);

    // Inner bright core
    nodeGs
      .append('circle')
      .attr('class', 'node-core')
      .attr('r', (d) => Math.max(2, d.radius * 0.3))
      .attr('fill', '#e2e0ef')
      .attr('opacity', 0.4);

    // Labels
    nodeGs
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', (d) => d.radius + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e0ef')
      .attr('fill-opacity', 0.7)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-geist-sans), sans-serif')
      .attr('pointer-events', 'none')
      .text((d) => (d.name.length > 16 ? d.name.slice(0, 14) + '\u2026' : d.name));

    // ── Node interactions ──────────────────────────────────────
    nodeGs.on('click', function (_event, d) {
      onNodeClick({
        id: d.id,
        name: d.name,
        type: d.type,
        connectionCount: d.connectionCount,
      });
    });

    // Hover: highlight connected, dim others
    nodeGs
      .on('mouseenter', function (_event, d) {
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        simLinks.forEach((l) => {
          const src = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source);
          const tgt = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target);
          if (src === d.id) connectedIds.add(tgt);
          if (tgt === d.id) connectedIds.add(src);
        });

        nodeGs
          .select('.node-circle')
          .transition()
          .duration(150)
          .attr('fill-opacity', (n: SimNode) => (connectedIds.has(n.id) ? 1 : 0.15))
          .attr('stroke-opacity', (n: SimNode) => (connectedIds.has(n.id) ? 0.8 : 0.1));

        nodeGs
          .select('.node-ambient')
          .transition()
          .duration(150)
          .attr('opacity', (n: SimNode) => (connectedIds.has(n.id) ? 0.15 : 0.02));

        nodeGs
          .select('.node-label')
          .transition()
          .duration(150)
          .attr('fill-opacity', (n: SimNode) => (connectedIds.has(n.id) ? 1 : 0.15));

        linkLines
          .transition()
          .duration(150)
          .attr('stroke-opacity', (l: SimLink) => {
            const src = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source);
            const tgt = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target);
            return src === d.id || tgt === d.id ? 0.5 : 0.05;
          });

        linkGlows
          .transition()
          .duration(150)
          .attr('stroke-opacity', (l: SimLink) => {
            const src = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source);
            const tgt = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target);
            return src === d.id || tgt === d.id ? 0.2 : 0.02;
          });
      })
      .on('mouseleave', function () {
        nodeGs
          .select('.node-circle')
          .transition()
          .duration(300)
          .attr('fill-opacity', 0.85)
          .attr('stroke-opacity', 0.4);

        nodeGs
          .select('.node-ambient')
          .transition()
          .duration(300)
          .attr('opacity', 0.08);

        nodeGs
          .select('.node-label')
          .transition()
          .duration(300)
          .attr('fill-opacity', 0.7);

        linkLines.transition().duration(300).attr('stroke-opacity', 0.25);
        linkGlows.transition().duration(300).attr('stroke-opacity', 0.08);
      });

    // ── Drag behavior ──────────────────────────────────────────
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGs.call(drag);

    // ── Force simulation ───────────────────────────────────────
    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200).distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<SimNode>().radius((d) => d.radius + 8)
      )
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03));

    simulationRef.current = simulation;

    // Curved link path generator
    function linkPath(d: SimLink): string {
      const src = d.source as SimNode;
      const tgt = d.target as SimNode;
      const dx = (tgt.x ?? 0) - (src.x ?? 0);
      const dy = (tgt.y ?? 0) - (src.y ?? 0);
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
      return `M${src.x ?? 0},${src.y ?? 0}A${dr},${dr} 0 0,1 ${tgt.x ?? 0},${tgt.y ?? 0}`;
    }

    simulation.on('tick', () => {
      linkGlows.attr('d', linkPath);
      linkLines.attr('d', linkPath);
      nodeGs.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // ── Vignette overlay ───────────────────────────────────────
    svgSel
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#vignette)')
      .attr('pointer-events', 'none');

    // ── Cleanup ────────────────────────────────────────────────
    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [nodes, edges, hiddenTypes, getRadius, onNodeClick, zoomRef]);

  // ── Search highlighting ────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const g = d3.select(svg).select('.nodes');
    if (g.empty()) return;

    const query = searchQuery.toLowerCase().trim();

    g.selectAll<SVGGElement, SimNode>('.node-group').each(function (d) {
      const isMatch = query && d.name.toLowerCase().includes(query);
      const group = d3.select(this);

      group
        .select('.node-circle')
        .attr('filter', isMatch ? 'url(#search-pulse)' : null);

      if (isMatch) {
        group
          .select('.node-ambient')
          .transition()
          .duration(200)
          .attr('opacity', 0.3)
          .attr('r', d.radius + 10);
      } else {
        group
          .select('.node-ambient')
          .transition()
          .duration(200)
          .attr('opacity', 0.08)
          .attr('r', d.radius + 4);
      }
    });
  }, [searchQuery]);

  // ── Selected node highlighting ─────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const g = d3.select(svg).select('.nodes');
    if (g.empty()) return;

    g.selectAll<SVGGElement, SimNode>('.node-group').each(function (d) {
      const group = d3.select(this);
      const isSelected = d.id === selectedNodeId;

      group
        .select('.node-circle')
        .attr('stroke-width', isSelected ? 3 : 1.5)
        .attr('stroke-opacity', isSelected ? 1 : 0.4);
    });
  }, [selectedNodeId]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {/* Tooltip for edge hover */}
      <div
        ref={tooltipRef}
        className="fixed z-50 px-2.5 py-1 rounded-md text-xs font-medium bg-[#12121a] border border-[#1e1e2e] text-[#e2e0ef] pointer-events-none transition-opacity duration-150"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
