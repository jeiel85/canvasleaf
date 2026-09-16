import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasEdge, CanvasNode, ViewportTransform } from '../types/canvas';
import { MarkdownCard } from './MarkdownCard';
import { BezierEdgeRenderer } from './BezierEdgeRenderer';
import { CoordinateManager } from '../engines/CoordinateManager';

interface InfiniteCanvasProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: ViewportTransform;
  selectedNodeId: string | null;
  searchQuery: string;
  onViewportChange: (newViewport: ViewportTransform) => void;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNode: (updatedNode: CanvasNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onNavigateToNode: (targetTitle: string) => void;
  onAddCardAtPosition: (x: number, y: number) => void;
  onDropFiles: (files: FileList, x: number, y: number) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  nodes,
  edges,
  viewport,
  selectedNodeId,
  searchQuery,
  onViewportChange,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onNavigateToNode,
  onAddCardAtPosition,
  onDropFiles,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ screenX: number; screenY: number; viewX: number; viewY: number }>({
    screenX: 0,
    screenY: 0,
    viewX: 0,
    viewY: 0,
  });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    screenX: number;
    screenY: number;
    origX: number;
    origY: number;
  }>({ screenX: 0, screenY: 0, origX: 0, origY: 0 });

  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const resizeStartRef = useRef<{
    screenX: number;
    screenY: number;
    origW: number;
    origH: number;
  }>({ screenX: 0, screenY: 0, origW: 0, origH: 0 });

  // 1. Zoom Wheel Listener (Pivot around mouse cursor)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Pinch zoom trackpad or wheel
      const zoomFactor = e.ctrlKey ? 0.05 : 0.0015;
      const delta = -e.deltaY * zoomFactor;
      const newScale = Math.min(Math.max(viewport.scale * (1 + delta), 0.1), 3.0);

      // Pivot zoom around cursor
      const newX = cursorX - (cursorX - viewport.x) * (newScale / viewport.scale);
      const newY = cursorY - (cursorY - viewport.y) * (newScale / viewport.scale);

      onViewportChange({
        x: newX,
        y: newY,
        scale: newScale,
      });
    },
    [viewport, onViewportChange]
  );

  // 2. Start Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background (not inside a card)
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      onSelectNode(null);
      panStartRef.current = {
        screenX: e.clientX,
        screenY: e.clientY,
        viewX: viewport.x,
        viewY: viewport.y,
      };
    }
  };

  // 3. Start Dragging Card
  const handleStartDrag = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    onSelectNode(nodeId);
    dragStartRef.current = {
      screenX: e.clientX,
      screenY: e.clientY,
      origX: node.posX,
      origY: node.posY,
    };
  };

  // 4. Start Resizing Card
  const handleStartResize = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setResizingNodeId(nodeId);
    onSelectNode(nodeId);
    resizeStartRef.current = {
      screenX: e.clientX,
      screenY: e.clientY,
      origW: node.width,
      origH: node.height,
    };
  };

  // 5. Global Mouse Move & Up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle Panning
      if (isPanning) {
        const dx = e.clientX - panStartRef.current.screenX;
        const dy = e.clientY - panStartRef.current.screenY;
        onViewportChange({
          ...viewport,
          x: panStartRef.current.viewX + dx,
          y: panStartRef.current.viewY + dy,
        });
      }

      // Handle Node Dragging
      if (draggingNodeId) {
        const dx = (e.clientX - dragStartRef.current.screenX) / viewport.scale;
        const dy = (e.clientY - dragStartRef.current.screenY) / viewport.scale;
        const targetNode = nodes.find((n) => n.id === draggingNodeId);
        if (targetNode) {
          onUpdateNode({
            ...targetNode,
            posX: Math.round(dragStartRef.current.origX + dx),
            posY: Math.round(dragStartRef.current.origY + dy),
          });
        }
      }

      // Handle Node Resizing
      if (resizingNodeId) {
        const dx = (e.clientX - resizeStartRef.current.screenX) / viewport.scale;
        const dy = (e.clientY - resizeStartRef.current.screenY) / viewport.scale;
        const targetNode = nodes.find((n) => n.id === resizingNodeId);
        if (targetNode) {
          onUpdateNode({
            ...targetNode,
            width: Math.max(Math.round(resizeStartRef.current.origW + dx), 200),
            height: Math.max(Math.round(resizeStartRef.current.origH + dy), 140),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
      setResizingNodeId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingNodeId, resizingNodeId, viewport, nodes, onViewportChange, onUpdateNode]);

  // 6. Double Click on Background to Add New Card
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasPoint = CoordinateManager.screenToCanvas(
      e.clientX,
      e.clientY,
      viewport,
      rect
    );
    onAddCardAtPosition(canvasPoint.x, canvasPoint.y);
  };

  // 7. Drag & Drop external .md files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current || !e.dataTransfer.files.length) return;

    const rect = containerRef.current.getBoundingClientRect();
    const canvasPoint = CoordinateManager.screenToCanvas(
      e.clientX,
      e.clientY,
      viewport,
      rect
    );
    onDropFiles(e.dataTransfer.files, canvasPoint.x, canvasPoint.y);
  };

  // Filter nodes if search query provided
  const visibleNodes = nodes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.contentSnippet.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      ref={containerRef}
      id="canvasleaf-viewport-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full h-full overflow-hidden bg-[#0F1115] canvas-background select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${24 * viewport.scale}px ${24 * viewport.scale}px`,
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {/* World Coordinate Transform Wrapper */}
      <div
        id="canvasleaf-world-layer"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* SVG Bezier Edges Layer */}
        <BezierEdgeRenderer
          edges={edges}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
        />

        {/* Markdown Cards Layer */}
        {visibleNodes.map((node) => (
          <MarkdownCard
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onUpdate={onUpdateNode}
            onDelete={onDeleteNode}
            onNavigateToNode={onNavigateToNode}
            onStartDrag={handleStartDrag}
            onStartResize={handleStartResize}
          />
        ))}
      </div>
    </div>
  );
};
