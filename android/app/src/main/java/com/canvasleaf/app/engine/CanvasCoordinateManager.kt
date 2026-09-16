package com.canvasleaf.app.engine

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import com.canvasleaf.app.model.CanvasNode
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * Canvas Coordinate Manager (SDD Section 4.2).
 * Manages 2D viewport matrix transformations, screen-to-world mapping,
 * and hardware-accelerated Cubic Bezier curve geometries.
 */
class CanvasCoordinateManager {

    data class BezierCurve(
        val start: Offset,
        val cp1: Offset,
        val cp2: Offset,
        val end: Offset,
        val labelPosition: Offset,
        val path: Path
    )

    fun screenToCanvas(screenPoint: Offset, pan: Offset, zoom: Float): Offset {
        return Offset(
            x = (screenPoint.x - pan.x) / zoom,
            y = (screenPoint.y - pan.y) / zoom
        )
    }

    fun canvasToScreen(canvasPoint: Offset, pan: Offset, zoom: Float): Offset {
        return Offset(
            x = canvasPoint.x * zoom + pan.x,
            y = canvasPoint.y * zoom + pan.y
        )
    }

    /**
     * Computes cubic bezier curve between two cards with automatic boundary anchor detection
     */
    fun computeCubicBezier(from: CanvasNode, to: CanvasNode): BezierCurve {
        val fromCenter = Offset(from.posX + from.width / 2, from.posY + from.height / 2)
        val toCenter = Offset(to.posX + to.width / 2, to.posY + to.height / 2)

        val dx = toCenter.x - fromCenter.x
        val dy = toCenter.y - fromCenter.y

        val start: Offset
        val end: Offset
        val cp1: Offset
        val cp2: Offset

        val dist = sqrt((dx * dx + dy * dy).toDouble()).toFloat()
        val curvature = min(max(dist * 0.45f, 60f), 240f)

        if (abs(dx) > abs(dy)) {
            // Horizontal connection
            if (dx > 0) {
                start = Offset(from.posX + from.width, fromCenter.y)
                end = Offset(to.posX, toCenter.y)
                cp1 = Offset(start.x + curvature, start.y)
                cp2 = Offset(end.x - curvature, end.y)
            } else {
                start = Offset(from.posX, fromCenter.y)
                end = Offset(to.posX + to.width, toCenter.y)
                cp1 = Offset(start.x - curvature, start.y)
                cp2 = Offset(end.x + curvature, end.y)
            }
        } else {
            // Vertical connection
            if (dy > 0) {
                start = Offset(fromCenter.x, from.posY + from.height)
                end = Offset(toCenter.x, to.posY)
                cp1 = Offset(start.x, start.y + curvature)
                cp2 = Offset(end.x, end.y - curvature)
            } else {
                start = Offset(fromCenter.x, from.posY)
                end = Offset(toCenter.x, to.posY + to.height)
                cp1 = Offset(start.x, start.y - curvature)
                cp2 = Offset(end.x, end.y + curvature)
            }
        }

        // Midpoint at t = 0.5
        val t = 0.5f
        val oneMinusT = 1f - t
        val labelX = oneMinusT * oneMinusT * oneMinusT * start.x +
                3 * oneMinusT * oneMinusT * t * cp1.x +
                3 * oneMinusT * t * t * cp2.x +
                t * t * t * end.x
        val labelY = oneMinusT * oneMinusT * oneMinusT * start.y +
                3 * oneMinusT * oneMinusT * t * cp1.y +
                3 * oneMinusT * t * t * cp2.y +
                t * t * t * end.y

        val path = Path().apply {
            moveTo(start.x, start.y)
            cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y)
        }

        return BezierCurve(
            start = start,
            cp1 = cp1,
            cp2 = cp2,
            end = end,
            labelPosition = Offset(labelX, labelY),
            path = path
        )
    }
}
