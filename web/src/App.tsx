import { useState, useMemo, useCallback } from 'react';
import { CanvasNode, ViewportTransform } from './types/canvas';
import { INITIAL_SAMPLE_NODES } from './data/sampleVault';
import { WikiLinkExtractor } from './engines/WikiLinkExtractor';
import { AutoLayoutEngine } from './engines/AutoLayoutEngine';
import { CoordinateManager } from './engines/CoordinateManager';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { CanvasToolbar } from './components/CanvasToolbar';
import { VaultExplorerModal } from './components/VaultExplorerModal';
import { Minimap } from './components/Minimap';

export function App() {
  // Nodes state
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_SAMPLE_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [vaultName, setVaultName] = useState<string>('Architecture_Design.canvas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);

  // Viewport transformation state (Pan & Zoom)
  const [viewport, setViewport] = useState<ViewportTransform>({
    x: 100,
    y: 80,
    scale: 0.9,
  });

  // Auto-Wire: Automatically compute edges from nodes content
  const edges = useMemo(() => {
    return WikiLinkExtractor.buildEdgesFromNodes(nodes);
  }, [nodes]);

  // Update a single node
  const handleUpdateNode = useCallback((updatedNode: CanvasNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  }, []);

  // Delete a single node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
  }, []);

  // Add a new card
  const handleAddNewCard = useCallback(() => {
    // Place new card near current screen center
    const centerCanvasX = Math.round((-viewport.x + window.innerWidth / 2) / viewport.scale - 160);
    const centerCanvasY = Math.round((-viewport.y + window.innerHeight / 2) / viewport.scale - 120);

    const newId = `note-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newId,
      filePath: `NewNote_${nodes.length + 1}.md`,
      title: `NewNote_${nodes.length + 1}.md`,
      contentSnippet: `# NewNote_${nodes.length + 1}\n\nType markdown here. Connect to other cards with [[TargetNote]]!`,
      posX: centerCanvasX + (Math.random() * 60 - 30),
      posY: centerCanvasY + (Math.random() * 60 - 30),
      width: 320,
      height: 220,
      colorHex: '#3B82F6',
      tags: ['draft'],
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  }, [viewport, nodes.length]);

  // Add card at exact canvas position (e.g. double click)
  const handleAddCardAtPosition = useCallback((canvasX: number, canvasY: number) => {
    const newId = `note-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newId,
      filePath: `Idea_${nodes.length + 1}.md`,
      title: `Idea_${nodes.length + 1}.md`,
      contentSnippet: `# Idea ${nodes.length + 1}\n\nDouble click to edit.\n[[SessionDB]] or [[UserAuth]]`,
      posX: Math.round(canvasX - 160),
      posY: Math.round(canvasY - 110),
      width: 320,
      height: 220,
      colorHex: '#10B981',
      tags: ['idea'],
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  }, [nodes.length]);

  // Auto-Layout
  const handleAutoLayout = useCallback(() => {
    const layouted = AutoLayoutEngine.applyAutoLayout(nodes, edges);
    setNodes([...layouted]);
    // Smoothly re-center
    const fitTransform = CoordinateManager.calculateFitToViewTransform(
      layouted,
      window.innerWidth,
      window.innerHeight
    );
    setViewport(fitTransform);
  }, [nodes, edges]);

  // Navigate / Pan to a specific card by title
  const handleNavigateToNode = useCallback(
    (targetTitle: string) => {
      const cleanTarget = targetTitle.toLowerCase().replace(/\.md$/i, '');
      const target = nodes.find(
        (n) =>
          n.title.toLowerCase().replace(/\.md$/i, '') === cleanTarget ||
          n.id.toLowerCase() === cleanTarget
      );

      if (target) {
        setSelectedNodeId(target.id);
        const targetCenterX = target.posX + target.width / 2;
        const targetCenterY = target.posY + target.height / 2;

        setViewport({
          x: window.innerWidth / 2 - targetCenterX * viewport.scale,
          y: window.innerHeight / 2 - targetCenterY * viewport.scale,
          scale: Math.max(viewport.scale, 0.85),
        });
      }
    },
    [nodes, viewport.scale]
  );

  // Zoom Controls
  const handleZoomIn = useCallback(() => {
    setViewport((prev) => {
      const newScale = Math.min(prev.scale * 1.2, 3.0);
      return {
        ...prev,
        scale: newScale,
      };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport((prev) => {
      const newScale = Math.max(prev.scale * 0.8, 0.15);
      return {
        ...prev,
        scale: newScale,
      };
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: 1.0,
    }));
  }, []);

  const handleFitView = useCallback(() => {
    const fitTransform = CoordinateManager.calculateFitToViewTransform(
      nodes,
      window.innerWidth,
      window.innerHeight
    );
    setViewport(fitTransform);
  }, [nodes]);

  // Reset to Sample Architecture
  const handleResetToSample = useCallback(() => {
    setNodes(INITIAL_SAMPLE_NODES);
    setVaultName('Architecture_Design.canvas');
    setSelectedNodeId(null);
    setViewport({
      x: 100,
      y: 80,
      scale: 0.9,
    });
  }, []);

  // Import files from disk (Drag & Drop or Manual)
  const handleImportFiles = useCallback(async (files: FileList | File[], startPos?: { x: number; y: number }) => {
    const newNodes: CanvasNode[] = [];
    let currentX = startPos ? startPos.x : 100;
    let currentY = startPos ? startPos.y : 100;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt')) {
        const text = await file.text();
        const id = `file-${Date.now()}-${i}`;

        newNodes.push({
          id,
          filePath: file.name,
          title: file.name,
          contentSnippet: text,
          posX: currentX,
          posY: currentY,
          width: 320,
          height: 240,
          colorHex: '#3B82F6',
          tags: ['imported'],
        });

        currentX += 360;
        if (currentX > 1200) {
          currentX = 100;
          currentY += 280;
        }
      }
    }

    if (newNodes.length > 0) {
      setNodes((prev) => [...prev, ...newNodes]);
      setVaultName('Imported_Vault');
    }
  }, []);

  // Handle Drag and Drop files onto canvas
  const handleDropFiles = useCallback(
    (files: FileList, canvasX: number, canvasY: number) => {
      handleImportFiles(files, { x: canvasX, y: canvasY });
    },
    [handleImportFiles]
  );

  // Modern File System Access API (Local Folder Picker)
  const handleOpenDirectoryPicker = useCallback(async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dirHandle = await (window as any).showDirectoryPicker();
        setVaultName(dirHandle.name);

        const loadedNodes: CanvasNode[] = [];
        let startX = 120;
        let startY = 120;

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            const file = await entry.getFile();
            const text = await file.text();
            loadedNodes.push({
              id: `saf-${entry.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
              filePath: entry.name,
              title: entry.name,
              contentSnippet: text,
              posX: startX,
              posY: startY,
              width: 320,
              height: 240,
              colorHex: '#10B981',
              tags: ['local-folder'],
            });

            startX += 360;
            if (startX > 1300) {
              startX = 120;
              startY += 280;
            }
          }
        }

        if (loadedNodes.length > 0) {
          setNodes(loadedNodes);
          const fitTransform = CoordinateManager.calculateFitToViewTransform(
            loadedNodes,
            window.innerWidth,
            window.innerHeight
          );
          setViewport(fitTransform);
        }
      } else {
        alert('File System Access API is not supported in this browser. You can use Drag & Drop or Import Files!');
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Directory picker error:', err);
      }
    }
  }, []);

  // Export as JSON Canvas format
  const handleExportJson = useCallback(() => {
    const canvasData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: 'file',
        file: n.filePath,
        x: n.posX,
        y: n.posY,
        width: n.width,
        height: n.height,
        color: n.colorHex,
      })),
      edges: edges.map((e) => ({
        id: e.edgeId,
        fromNode: e.fromNodeId,
        toNode: e.toNodeId,
        label: e.label || '',
      })),
    };

    const blob = new Blob([JSON.stringify(canvasData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vaultName.replace(/\.canvas$/i, '')}.canvas`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [nodes, edges, vaultName]);

  // Export as High-Resolution PNG
  const handleExportPng = useCallback(() => {
    if (nodes.length === 0) return;

    // Calculate canvas bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const n of nodes) {
      minX = Math.min(minX, n.posX);
      minY = Math.min(minY, n.posY);
      maxX = Math.max(maxX, n.posX + n.width);
      maxY = Math.max(maxY, n.posY + n.height);
    }

    const padding = 60;
    const canvasWidth = maxX - minX + padding * 2;
    const canvasHeight = maxY - minY + padding * 2;

    const exportCanvas = document.createElement('canvas');
    const dpr = 2; // High-res retina
    exportCanvas.width = canvasWidth * dpr;
    exportCanvas.height = canvasHeight * dpr;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Dark Background
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Subtle Dot Grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 0; x < canvasWidth; x += 24) {
      for (let y = 0; y < canvasHeight; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    // Draw Bézier Edges
    const nodeMap = new Map<string, CanvasNode>();
    for (const n of nodes) {
      nodeMap.set(n.id, n);
    }

    for (const edge of edges) {
      const from = nodeMap.get(edge.fromNodeId);
      const to = nodeMap.get(edge.toNodeId);
      if (from && to) {
        const edgePath = CoordinateManager.computeCubicBezierEdge(from, to);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(edgePath.start.x + offsetX, edgePath.start.y + offsetY);
        ctx.bezierCurveTo(
          edgePath.cp1.x + offsetX,
          edgePath.cp1.y + offsetY,
          edgePath.cp2.x + offsetX,
          edgePath.cp2.y + offsetY,
          edgePath.end.x + offsetX,
          edgePath.end.y + offsetY
        );
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Edge label badge if present
        if (edge.label) {
          ctx.fillStyle = '#181B22';
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1;
          const lx = edgePath.labelPos.x + offsetX;
          const ly = edgePath.labelPos.y + offsetY;
          ctx.beginPath();
          ctx.roundRect(lx - 30, ly - 10, 60, 20, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#6EE7B7';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`[[${edge.label}]]`, lx, ly);
        }
        ctx.restore();
      }
    }

    // Draw Nodes
    for (const node of nodes) {
      const nx = node.posX + offsetX;
      const ny = node.posY + offsetY;

      // Card Body
      ctx.save();
      ctx.fillStyle = '#16191E';
      ctx.strokeStyle = '#282C34';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(nx, ny, node.width, node.height, 12);
      ctx.fill();
      ctx.stroke();

      // Top color strip
      ctx.fillStyle = node.colorHex;
      ctx.beginPath();
      ctx.roundRect(nx, ny, node.width, 4, [12, 12, 0, 0]);
      ctx.fill();

      // Title
      ctx.fillStyle = '#F3F4F6';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(node.title, nx + 14, ny + 26);

      // Divider
      ctx.strokeStyle = '#23272F';
      ctx.beginPath();
      ctx.moveTo(nx, ny + 36);
      ctx.lineTo(nx + node.width, ny + 36);
      ctx.stroke();

      // Content preview lines
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px sans-serif';
      const lines = node.contentSnippet.split('\n').slice(0, 7);
      lines.forEach((line, idx) => {
        ctx.fillText(line.substring(0, 38), nx + 14, ny + 56 + idx * 18);
      });

      ctx.restore();
    }

    // Download PNG
    const pngUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `CanvasLeaf-${vaultName.replace(/\.canvas$/i, '')}.png`;
    a.click();
  }, [nodes, edges, vaultName]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0F1115]">
      {/* Top and Bottom Toolbars */}
      <CanvasToolbar
        vaultName={vaultName}
        zoomPercent={Math.round(viewport.scale * 100)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitView={handleFitView}
        onAddNewCard={handleAddNewCard}
        onAutoLayout={handleAutoLayout}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onResetToSample={handleResetToSample}
      />

      {/* 60fps Infinite 2D Viewport */}
      <InfiniteCanvas
        nodes={nodes}
        edges={edges}
        viewport={viewport}
        selectedNodeId={selectedNodeId}
        searchQuery={searchQuery}
        onViewportChange={setViewport}
        onSelectNode={setSelectedNodeId}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onNavigateToNode={handleNavigateToNode}
        onAddCardAtPosition={handleAddCardAtPosition}
        onDropFiles={handleDropFiles}
      />

      {/* Floating Minimap */}
      <Minimap
        nodes={nodes}
        viewport={viewport}
        containerWidth={window.innerWidth}
        containerHeight={window.innerHeight}
        onNavigate={(cx, cy) => {
          setViewport((prev) => ({
            ...prev,
            x: window.innerWidth / 2 - cx * prev.scale,
            y: window.innerHeight / 2 - cy * prev.scale,
          }));
        }}
      />

      {/* Local Vault Explorer Modal */}
      <VaultExplorerModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        nodes={nodes}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          const target = nodes.find((n) => n.id === id);
          if (target) {
            setViewport({
              x: window.innerWidth / 2 - (target.posX + target.width / 2) * viewport.scale,
              y: window.innerHeight / 2 - (target.posY + target.height / 2) * viewport.scale,
              scale: viewport.scale,
            });
          }
        }}
        onImportFiles={handleImportFiles}
        onOpenDirectoryPicker={handleOpenDirectoryPicker}
      />
    </div>
  );
}
