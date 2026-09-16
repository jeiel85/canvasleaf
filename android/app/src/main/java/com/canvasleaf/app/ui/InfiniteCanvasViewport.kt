package com.canvasleaf.app.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.canvasleaf.app.engine.CanvasCoordinateManager
import com.canvasleaf.app.model.CanvasEdge
import com.canvasleaf.app.model.CanvasNode
import kotlin.math.roundToInt

/**
 * 60fps Compose Hardware-Accelerated Viewport (SDD Section 4.2).
 * Handles pinch-to-zoom, two-finger pan, and smooth Skia rendering of nodes and Bézier lines.
 */
@Composable
fun InfiniteCanvasViewport(
    nodes: List<CanvasNode>,
    edges: List<CanvasEdge>,
    onNodeMoved: (id: String, newX: Float, newY: Float) -> Unit,
    modifier: Modifier = Modifier
) {
    var pan by remember { mutableStateOf(Offset(200f, 200f)) }
    var zoom by remember { mutableFloatStateOf(0.9f) }
    val coordinateManager = remember { CanvasCoordinateManager() }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F1115))
            .pointerInput(Unit) {
                detectTransformGestures { _, panDelta, zoomDelta, _ ->
                    zoom = (zoom * zoomDelta).coerceIn(0.15f, 3.0f)
                    pan += panDelta
                }
            }
    ) {
        // 1. Skia / Compose GPU Accelerated Layer for Edges and Dot Grid
        Canvas(modifier = Modifier.fillMaxSize()) {
            withTransform({
                translate(pan.x, pan.y)
                scale(zoom, zoom, Offset.Zero)
            }) {
                // Draw Background Dots
                val dotColor = Color(0x1FFFFFFF)
                val step = 40f
                for (x in -2000..4000 step step.toInt()) {
                    for (y in -2000..4000 step step.toInt()) {
                        drawCircle(dotColor, radius = 1.5f, center = Offset(x.toFloat(), y.toFloat()))
                    }
                }

                // Draw Cubic Bezier Edges
                val nodeMap = nodes.associateBy { it.id }
                edges.forEach { edge ->
                    val from = nodeMap[edge.fromNodeId]
                    val to = nodeMap[edge.toNodeId]
                    if (from != null && to != null) {
                        val bezier = coordinateManager.computeCubicBezier(from, to)

                        // Smooth gradient curve
                        drawPath(
                            path = bezier.path,
                            brush = Brush.linearGradient(
                                colors = listOf(Color(0xFF10B981), Color(0xFF3B82F6)),
                                start = bezier.start,
                                end = bezier.end
                            ),
                            style = Stroke(width = 3f, cap = StrokeCap.Round)
                        )

                        // Draw End Anchor Indicator
                        drawCircle(
                            color = Color(0xFF10B981),
                            radius = 5f,
                            center = bezier.end
                        )
                    }
                }
            }
        }

        // 2. Render Canvas Cards (Nodes)
        nodes.forEach { node ->
            val screenX = (node.posX * zoom + pan.x).roundToInt()
            val screenY = (node.posY * zoom + pan.y).roundToInt()
            val cardW = (node.width * zoom).dp
            val cardH = (node.height * zoom).dp

            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF16191E)),
                modifier = Modifier
                    .offset { IntOffset(screenX, screenY) }
                    .size(cardW, cardH)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Text(
                        text = node.title,
                        color = Color.White,
                        fontSize = (12 * zoom).sp,
                        modifier = Modifier.offset(8.dp, 8.dp)
                    )
                }
            }
        }
    }
}
