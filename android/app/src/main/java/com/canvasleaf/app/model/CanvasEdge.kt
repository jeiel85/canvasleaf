package com.canvasleaf.app.model

/**
 * Core Canvas Edge Entity representing relationship connections between notes.
 * Defined in CanvasLeaf SDD Section 5.2.
 */
data class CanvasEdge(
    val edgeId: String,
    val fromNodeId: String,
    val toNodeId: String,
    val label: String? = null,
    val isBiDirectional: Boolean = false
)
