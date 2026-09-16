import React from 'react';
import { CanvasEdge, CanvasNode } from '../types/canvas';
import { CoordinateManager } from '../engines/CoordinateManager';

interface BezierEdgeRendererProps {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  selectedNodeId: string | null;
}

export const BezierEdgeRenderer: React.FC<BezierEdgeRendererProps> = ({
  edges,
  nodes,
  selectedNodeId,
}) => {
  const nodeMap = new Map<string, CanvasNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-10">
      <defs>
        {/* Directional Arrow Marker */}
        <marker
          id="edge-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
        </marker>

        {/* Selected / Highlighted Arrow Marker */}
        <marker
          id="edge-arrow-highlight"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
        </marker>

        {/* Edge Gradient */}
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {edges.map((edge) => {
        const fromNode = nodeMap.get(edge.fromNodeId);
        const toNode = nodeMap.get(edge.toNodeId);

        if (!fromNode || !toNode) return null;

        const pathData = CoordinateManager.computeCubicBezierEdge(fromNode, toNode);
        const isRelated =
          selectedNodeId === edge.fromNodeId || selectedNodeId === edge.toNodeId;

        return (
          <g key={edge.edgeId} className="transition-all duration-200">
            {/* Background Glow when highlighted */}
            {isRelated && (
              <path
                d={pathData.svgPath}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="6"
                strokeOpacity="0.3"
                className="animate-pulse"
              />
            )}

            {/* Main Bezier Curve */}
            <path
              d={pathData.svgPath}
              fill="none"
              stroke={isRelated ? '#38BDF8' : 'url(#edge-gradient)'}
              strokeWidth={isRelated ? '2.5' : '1.8'}
              strokeDasharray={edge.label === 'sync' ? '4 3' : 'none'}
              markerEnd={isRelated ? 'url(#edge-arrow-highlight)' : 'url(#edge-arrow)'}
              className="transition-colors duration-150"
            />

            {/* Relationship Label Badge */}
            {edge.label && (
              <g
                transform={`translate(${pathData.labelPos.x}, ${pathData.labelPos.y})`}
                className="pointer-events-auto"
              >
                {/* Badge Background */}
                <rect
                  x="-36"
                  y="-11"
                  width="72"
                  height="22"
                  rx="11"
                  className={`${
                    isRelated
                      ? 'fill-cyan-950 stroke-cyan-500'
                      : 'fill-[#181B22] stroke-emerald-500/50'
                  } stroke-[1px] shadow-lg`}
                />
                {/* Badge Text */}
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  className="fill-emerald-300 text-[10px] font-mono font-medium tracking-tight select-none"
                >
                  {edge.label.startsWith('[[') ? edge.label : `[[${edge.label}]]`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
