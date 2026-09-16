package com.canvasleaf.app.model

/**
 * Core Canvas Node Entity representing a projected Markdown file on the 2D infinite whiteboard.
 * Defined in CanvasLeaf SDD Section 5.1.
 */
data class CanvasNode(
    val id: String,
    val filePath: String,
    val title: String,
    val contentSnippet: String,
    val posX: Float,
    val posY: Float,
    val width: Float = 320f,
    val height: Float = 240f,
    val colorHex: String = "#1E1E24",
    val isSelected: Boolean = false
)
