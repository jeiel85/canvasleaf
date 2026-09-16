import { CanvasNode, Point, ViewportTransform } from '../types/canvas';

export interface BezierCurvePath {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
  labelPos: Point;
  fromSide: 'top' | 'bottom' | 'left' | 'right';
  toSide: 'top' | 'bottom' | 'left' | 'right';
  svgPath: string;
}

export class CoordinateManager {
  /**
   * Convert screen client coordinates to world canvas coordinates
   */
  public static screenToCanvas(
    screenX: number,
    screenY: number,
    transform: ViewportTransform,
    containerRect: DOMRect
  ): Point {
    const relX = screenX - containerRect.left;
    const relY = screenY - containerRect.top;
    return {
      x: (relX - transform.x) / transform.scale,
      y: (relY - transform.y) / transform.scale,
    };
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  public static canvasToScreen(
    canvasX: number,
    canvasY: number,
    transform: ViewportTransform
  ): Point {
    return {
      x: canvasX * transform.scale + transform.x,
      y: canvasY * transform.scale + transform.y,
    };
  }

  /**
   * Calculate best anchor points on node boundaries and cubic bezier path
   */
  public static computeCubicBezierEdge(
    fromNode: CanvasNode,
    toNode: CanvasNode
  ): BezierCurvePath {
    const fromCenter = {
      x: fromNode.posX + fromNode.width / 2,
      y: fromNode.posY + fromNode.height / 2,
    };
    const toCenter = {
      x: toNode.posX + toNode.width / 2,
      y: toNode.posY + toNode.height / 2,
    };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    let start: Point;
    let end: Point;
    let fromSide: 'top' | 'bottom' | 'left' | 'right';
    let toSide: 'top' | 'bottom' | 'left' | 'right';

    // Determine primary direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal dominant
      if (dx > 0) {
        // From is to the left of To
        fromSide = 'right';
        toSide = 'left';
        start = { x: fromNode.posX + fromNode.width, y: fromCenter.y };
        end = { x: toNode.posX, y: toCenter.y };
      } else {
        fromSide = 'left';
        toSide = 'right';
        start = { x: fromNode.posX, y: fromCenter.y };
        end = { x: toNode.posX + toNode.width, y: toCenter.y };
      }
    } else {
      // Vertical dominant
      if (dy > 0) {
        fromSide = 'bottom';
        toSide = 'top';
        start = { x: fromCenter.x, y: fromNode.posY + fromNode.height };
        end = { x: toCenter.x, y: toNode.posY };
      } else {
        fromSide = 'top';
        toSide = 'bottom';
        start = { x: fromCenter.x, y: fromNode.posY };
        end = { x: toCenter.x, y: toNode.posY + toNode.height };
      }
    }

    // Compute cubic control points based on distance and orientation
    const dist = Math.hypot(end.x - start.x, end.y - start.y);
    const curvature = Math.min(Math.max(dist * 0.45, 60), 240);

    let cp1: Point;
    let cp2: Point;

    if (fromSide === 'right') {
      cp1 = { x: start.x + curvature, y: start.y };
    } else if (fromSide === 'left') {
      cp1 = { x: start.x - curvature, y: start.y };
    } else if (fromSide === 'bottom') {
      cp1 = { x: start.x, y: start.y + curvature };
    } else {
      cp1 = { x: start.x, y: start.y - curvature };
    }

    if (toSide === 'left') {
      cp2 = { x: end.x - curvature, y: end.y };
    } else if (toSide === 'right') {
      cp2 = { x: end.x + curvature, y: end.y };
    } else if (toSide === 'top') {
      cp2 = { x: end.x, y: end.y - curvature };
    } else {
      cp2 = { x: end.x, y: end.y + curvature };
    }

    // Calculate midpoint on cubic bezier curve at t = 0.5 for label positioning
    // B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
    const t = 0.5;
    const labelX =
      Math.pow(1 - t, 3) * start.x +
      3 * Math.pow(1 - t, 2) * t * cp1.x +
      3 * (1 - t) * Math.pow(t, 2) * cp2.x +
      Math.pow(t, 3) * end.x;
    const labelY =
      Math.pow(1 - t, 3) * start.y +
      3 * Math.pow(1 - t, 2) * t * cp1.y +
      3 * (1 - t) * Math.pow(t, 2) * cp2.y +
      Math.pow(t, 3) * end.y;

    const svgPath = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

    return {
      start,
      cp1,
      cp2,
      end,
      labelPos: { x: labelX, y: labelY },
      fromSide,
      toSide,
      svgPath,
    };
  }

  /**
   * Fit all nodes within viewport with nice padding
   */
  public static calculateFitToViewTransform(
    nodes: CanvasNode[],
    viewWidth: number,
    viewHeight: number,
    padding = 80
  ): ViewportTransform {
    if (nodes.length === 0) {
      return { x: 0, y: 0, scale: 1 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.posX);
      minY = Math.min(minY, node.posY);
      maxX = Math.max(maxX, node.posX + node.width);
      maxY = Math.max(maxY, node.posY + node.height);
    }

    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;

    const availableWidth = Math.max(viewWidth - padding * 2, 200);
    const availableHeight = Math.max(viewHeight - padding * 2, 200);

    const scaleX = availableWidth / bboxWidth;
    const scaleY = availableHeight / bboxHeight;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 1.5);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const x = viewWidth / 2 - centerX * scale;
    const y = viewHeight / 2 - centerY * scale;

    return { x, y, scale };
  }
}
