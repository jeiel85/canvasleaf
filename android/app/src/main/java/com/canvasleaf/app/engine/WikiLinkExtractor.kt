package com.canvasleaf.app.engine

import com.canvasleaf.app.model.CanvasEdge
import com.canvasleaf.app.model.CanvasNode

/**
 * WikiLink Extractor Engine (SDD Section 4.2).
 * Parses `[[NoteName]]` or `[[relation]] NoteName` or `[[Target|Alias]]`
 * from markdown content to build an adjacency graph of nodes and edges automatically.
 */
object WikiLinkExtractor {
    private val WIKILINK_REGEX = Regex("""\[\[(.*?)\]\]""")
    private val LABELED_LINK_REGEX = Regex("""\[\[([a-zA-Z0-9_\s-]+)\]\]\s*(?:(?:->|-->|──>|─►|—►|-►)\s*|(?:\s*-\s*))?\[\[(.*?)\]\]""")
    private val PREFIX_LABEL_REGEX = Regex("""\[\[([a-zA-Z0-9_\s-]+)\]\]\s+([a-zA-Z0-9_\-\.]+)""")

    data class ExtractedLink(
        val targetTitle: String,
        val label: String? = null
    )

    fun extractLinks(markdown: String): List<ExtractedLink> {
        val links = mutableListOf<ExtractedLink>()
        val seen = mutableSetOf<String>()

        // 1. Check labeled pattern: [[uses]] [[SessionDB]]
        LABELED_LINK_REGEX.findAll(markdown).forEach { match ->
            val label = match.groupValues[1].trim()
            val target = match.groupValues[2].trim().removeSuffix(".md")
            val key = "$target:$label"
            if (seen.add(key)) {
                links.add(ExtractedLink(targetTitle = target, label = label))
            }
        }

        // 2. Check prefix pattern: [[uses]] SessionDB.md
        PREFIX_LABEL_REGEX.findAll(markdown).forEach { match ->
            val label = match.groupValues[1].trim()
            val target = match.groupValues[2].trim().removeSuffix(".md")
            val key = "$target:$label"
            if (seen.add(key)) {
                links.add(ExtractedLink(targetTitle = target, label = label))
            }
        }

        // 3. Check regular [[Target]] or [[Target|Alias]]
        WIKILINK_REGEX.findAll(markdown).forEach { match ->
            val inner = match.groupValues[1].trim()
            val parts = inner.split("|")
            val target = parts[0].trim().removeSuffix(".md")
            val alias = if (parts.size > 1) parts[1].trim() else null

            val key = "$target:${alias ?: ""}"
            if (seen.add(key)) {
                links.add(ExtractedLink(targetTitle = target, label = alias))
            }
        }

        return links
    }

    /**
     * Constructs a directed graph of edges across all loaded nodes
     */
    fun buildAdjacencyGraph(nodes: List<CanvasNode>): List<CanvasEdge> {
        val edges = mutableListOf<CanvasEdge>()
        val nodeMap = mutableMapOf<String, CanvasNode>()

        nodes.forEach { node ->
            nodeMap[node.id.lowercase()] = node
            nodeMap[node.title.lowercase()] = node
            val baseName = node.filePath.substringAfterLast("/").substringAfterLast("\\").removeSuffix(".md").lowercase()
            nodeMap[baseName] = node
        }

        val createdPairs = mutableSetOf<String>()

        nodes.forEach { sourceNode ->
            val extracted = extractLinks(sourceNode.contentSnippet)
            extracted.forEach { link ->
                val targetNode = nodeMap[link.targetTitle.lowercase()]
                if (targetNode != null && targetNode.id != sourceNode.id) {
                    val pairKey = "${sourceNode.id}->${targetNode.id}"
                    if (createdPairs.add(pairKey)) {
                        edges.add(
                            CanvasEdge(
                                edgeId = "edge-${sourceNode.id}-${targetNode.id}",
                                fromNodeId = sourceNode.id,
                                toNodeId = targetNode.id,
                                label = link.label
                            )
                        )
                    }
                }
            }
        }

        return edges
    }
}
