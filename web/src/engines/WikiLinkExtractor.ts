import { CanvasEdge, CanvasNode } from '../types/canvas';

export interface ExtractedLink {
  targetTitle: string;
  label?: string;
  isBiDirectional?: boolean;
}

export class WikiLinkExtractor {
  /**
   * Extract all outbound links from markdown text
   */
  public static extractLinks(markdown: string): ExtractedLink[] {
    const links: ExtractedLink[] = [];
    const seen = new Set<string>();

    // 1. Check for labeled pattern like: [[uses]] [[SessionDB]] or [[uses]] SessionDB.md
    const labeledMatches = markdown.matchAll(/\[\[([a-zA-Z0-9_\s-]+)\]\]\s*(?:(?:->|-->|──>|─►|—►|-►)\s*|(?:\s*-\s*))?\[\[([a-zA-Z0-9_\-\.\s]+)\]\]/g);
    for (const m of labeledMatches) {
      const label = m[1].trim();
      const target = m[2].trim().replace(/\.md$/i, '');
      const key = `${target}:${label}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push({ targetTitle: target, label });
      }
    }

    // Pattern: [[uses]] TargetName.md (without second brackets)
    const relPrefixMatches = markdown.matchAll(/\[\[([a-zA-Z0-9_\s-]+)\]\]\s+([a-zA-Z0-9_\-]+(?:\.md)?)/g);
    for (const m of relPrefixMatches) {
      const label = m[1].trim();
      const target = m[2].trim().replace(/\.md$/i, '');
      const key = `${target}:${label}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push({ targetTitle: target, label });
      }
    }

    // 2. Standard [[Target]] or [[Target|Alias]] or [[Target]] - label
    const lines = markdown.split('\n');
    for (const line of lines) {
      const lineMatches = line.matchAll(/\[\[(.*?)\]\]/g);
      for (const m of lineMatches) {
        let inside = m[1].trim();
        let label: string | undefined = undefined;

        // Check if it has an alias [[Target|Alias]]
        if (inside.includes('|')) {
          const parts = inside.split('|');
          inside = parts[0].trim();
          label = parts[1].trim();
        }

        const cleanTarget = inside.replace(/\.md$/i, '');
        
        // Check if there's a relation label in the line: e.g. [[Target]] - sync or [[Target]] - [[sync]]
        const afterMatch = line.substring((m.index || 0) + m[0].length).trim();
        const labelMatch = afterMatch.match(/^(?:-\s*|:\s*|—\s*|──►\s*|─►\s*)(?:\[\[([a-zA-Z0-9_\s-]+)\]\]|([a-zA-Z0-9_\s-]+))/);
        if (labelMatch) {
          label = (labelMatch[1] || labelMatch[2] || '').trim();
        }

        const key = `${cleanTarget}:${label || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          links.push({ targetTitle: cleanTarget, label });
        }
      }
    }

    return links;
  }

  /**
   * Build graph edges automatically across all canvas nodes
   */
  public static buildEdgesFromNodes(nodes: CanvasNode[]): CanvasEdge[] {
    const edges: CanvasEdge[] = [];
    const nodeMap = new Map<string, CanvasNode>();

    // Normalize map lookup by id, title, and base filename
    for (const node of nodes) {
      nodeMap.set(node.id.toLowerCase(), node);
      nodeMap.set(node.title.toLowerCase(), node);
      const baseName = node.filePath.split(/[\\/]/).pop()?.replace(/\.md$/i, '').toLowerCase();
      if (baseName) {
        nodeMap.set(baseName, node);
      }
    }

    const createdEdgeKeys = new Set<string>();

    for (const sourceNode of nodes) {
      const links = this.extractLinks(sourceNode.contentSnippet);
      for (const link of links) {
        const targetLookupKey = link.targetTitle.toLowerCase();
        const targetNode = nodeMap.get(targetLookupKey);

        if (targetNode && targetNode.id !== sourceNode.id) {
          const edgeKey = `${sourceNode.id}->${targetNode.id}`;
          if (!createdEdgeKeys.has(edgeKey)) {
            createdEdgeKeys.add(edgeKey);
            edges.push({
              edgeId: `edge-${sourceNode.id}-${targetNode.id}-${edges.length}`,
              fromNodeId: sourceNode.id,
              toNodeId: targetNode.id,
              label: link.label || null,
              isBiDirectional: false,
            });
          }
        }
      }
    }

    return edges;
  }
}
