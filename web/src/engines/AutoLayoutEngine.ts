import { CanvasEdge, CanvasNode } from '../types/canvas';

export class AutoLayoutEngine {
  /**
   * Automatically arranges nodes in a clean topological DAG layout (left to right)
   * with collision avoidance.
   */
  public static applyAutoLayout(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    horizontalSpacing = 420,
    verticalSpacing = 300
  ): CanvasNode[] {
    if (nodes.length <= 1) return nodes;

    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    const nodeMap = new Map<string, CanvasNode>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
      nodeMap.set(node.id, node);
    }

    for (const edge of edges) {
      if (nodeMap.has(edge.fromNodeId) && nodeMap.has(edge.toNodeId)) {
        adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
        inDegree.set(edge.toNodeId, (inDegree.get(edge.toNodeId) || 0) + 1);
      }
    }

    // Determine layers (Kahn's algorithm-based ranking)
    const layers: string[][] = [];
    const assignedLayer = new Map<string, number>();

    // Start with root nodes (inDegree === 0)
    let currentLayer = nodes
      .filter((n) => (inDegree.get(n.id) || 0) === 0)
      .map((n) => n.id);

    // If there is a cycle and no 0 in-degree nodes, pick the first node
    if (currentLayer.length === 0) {
      currentLayer = [nodes[0].id];
    }

    let layerIndex = 0;
    const visited = new Set<string>();

    while (currentLayer.length > 0) {
      layers.push(currentLayer);
      const nextLayerSet = new Set<string>();

      for (const id of currentLayer) {
        visited.add(id);
        assignedLayer.set(id, layerIndex);

        const neighbors = adjacency.get(id) || [];
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            nextLayerSet.add(neighborId);
          }
        }
      }

      currentLayer = Array.from(nextLayerSet);
      layerIndex++;
    }

    // Add any remaining unvisited nodes into the last layer or separate column
    const unvisited = nodes.filter((n) => !visited.has(n.id)).map((n) => n.id);
    if (unvisited.length > 0) {
      layers.push(unvisited);
    }

    // Calculate (x, y) coordinates for each node
    const updatedNodes: CanvasNode[] = [];
    const startX = 100;
    const startY = 100;

    layers.forEach((layerNodeIds, colIndex) => {
      const colX = startX + colIndex * horizontalSpacing;
      const totalHeight = layerNodeIds.length * verticalSpacing;
      const layerStartY = Math.max(startY, 300 - totalHeight / 2);

      layerNodeIds.forEach((nodeId, rowIndex) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          updatedNodes.push({
            ...node,
            posX: colX,
            posY: layerStartY + rowIndex * verticalSpacing,
          });
        }
      });
    });

    return updatedNodes;
  }
}
