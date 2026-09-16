export interface CanvasNode {
  id: string;
  filePath: string;
  title: string;
  contentSnippet: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  colorHex: string;
  tags?: string[];
  isLocked?: boolean;
}

export interface CanvasEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string | null;
  isBiDirectional?: boolean;
}

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface VaultFile {
  name: string;
  path: string;
  content: string;
  lastModified?: number;
}
