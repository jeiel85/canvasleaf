import React from 'react';
import { CanvasNode, ViewportTransform } from '../types/canvas';

interface MinimapProps {
  nodes: CanvasNode[];
  viewport: ViewportTransform;
  containerWidth: number;
  containerHeight: number;
  onNavigate: (canvasX: number, canvasY: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  nodes,
  viewport,
  containerWidth,
  containerHeight,
  onNavigate,
}) => {
  if (nodes.length === 0 || containerWidth <= 0 || containerHeight <= 0) return null;

  // Compute bounding box of all nodes + padding
  let minX = -1000;
  let maxX = 2000;
  let minY = -1000;
  let maxY = 2000;

  for (const n of nodes) {
    minX = Math.min(minX, n.posX - 400);
    maxX = Math.max(maxX, n.posX + n.width + 400);
    minY = Math.min(minY, n.posY - 400);
    maxY = Math.max(maxY, n.posY + n.height + 400);
  }

  const mapWidth = 160;
  const mapHeight = 110;
  const worldWidth = maxX - minX;
  const worldHeight = maxY - minY;

  const scaleX = mapWidth / worldWidth;
  const scaleY = mapHeight / worldHeight;
  const mapScale = Math.min(scaleX, scaleY);

  // Viewport bounds in world coordinates
  const viewWorldX = -viewport.x / viewport.scale;
  const viewWorldY = -viewport.y / viewport.scale;
  const viewWorldWidth = containerWidth / viewport.scale;
  const viewWorldHeight = containerHeight / viewport.scale;

  // Viewport rect on minimap
  const viewMapX = (viewWorldX - minX) * mapScale;
  const viewMapY = (viewWorldY - minY) * mapScale;
  const viewMapW = Math.max(viewWorldWidth * mapScale, 10);
  const viewMapH = Math.max(viewWorldHeight * mapScale, 10);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = minX + clickX / mapScale;
    const targetWorldY = minY + clickY / mapScale;
    onNavigate(targetWorldX, targetWorldY);
  };

  return (
    <div
      onClick={handleClick}
      title="Click to jump on canvas"
      className="absolute bottom-6 right-6 z-20 w-[160px] h-[110px] bg-[#12141A]/90 backdrop-blur-md border border-[#2B303C] rounded-xl overflow-hidden shadow-2xl cursor-crosshair select-none hidden sm:block hover:border-gray-600 transition-colors"
    >
      <div className="relative w-full h-full">
        {/* Render nodes */}
        {nodes.map((n) => {
          const nx = (n.posX - minX) * mapScale;
          const ny = (n.posY - minY) * mapScale;
          const nw = Math.max(n.width * mapScale, 4);
          const nh = Math.max(n.height * mapScale, 4);

          return (
            <div
              key={n.id}
              style={{
                left: `${nx}px`,
                top: `${ny}px`,
                width: `${nw}px`,
                height: `${nh}px`,
                backgroundColor: n.colorHex,
              }}
              className="absolute rounded-sm opacity-80"
            />
          );
        })}

        {/* Viewport Viewfinder box */}
        <div
          style={{
            left: `${viewMapX}px`,
            top: `${viewMapY}px`,
            width: `${viewMapW}px`,
            height: `${viewMapH}px`,
          }}
          className="absolute border border-emerald-400 bg-emerald-500/15 rounded pointer-events-none transition-all duration-75 shadow-sm"
        />
      </div>
    </div>
  );
};
