package com.canvasleaf.app.engine

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import com.canvasleaf.app.model.CanvasNode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Vault Scanner Engine (SDD Section 4.2).
 * Traverses Android Storage Access Framework (SAF) folder URIs
 * to read all markdown (.md) documents and projects them into CanvasNodes.
 */
class VaultScannerEngine(private val context: Context) {

    suspend fun scanVaultDirectory(treeUri: Uri): List<CanvasNode> = withContext(Dispatchers.IO) {
        val rootDir = DocumentFile.fromTreeUri(context, treeUri) ?: return@withContext emptyList()
        val nodes = mutableListOf<CanvasNode>()
        val files = rootDir.listFiles().filter { it.isFile && (it.name?.endsWith(".md", ignoreCase = true) == true) }

        var currentX = 120f
        var currentY = 120f
        val horizontalGap = 380f
        val verticalGap = 280f
        val maxCols = 4

        files.forEachIndexed { index, docFile ->
            val fileName = docFile.name ?: "Untitled.md"
            val content = readDocumentContent(docFile.uri)

            val col = index % maxCols
            val row = index / maxCols

            nodes.add(
                CanvasNode(
                    id = "saf-${docFile.uri.hashCode()}",
                    filePath = fileName,
                    title = fileName,
                    contentSnippet = content,
                    posX = currentX + col * horizontalGap,
                    posY = currentY + row * verticalGap,
                    width = 320f,
                    height = 240f,
                    colorHex = pickColorForIndex(index)
                )
            )
        }

        nodes
    }

    suspend fun writeNodeToFile(treeUri: Uri, node: CanvasNode) = withContext(Dispatchers.IO) {
        val rootDir = DocumentFile.fromTreeUri(context, treeUri) ?: return@withContext
        val targetFile = rootDir.findFile(node.filePath)
            ?: rootDir.createFile("text/markdown", node.filePath)
            ?: return@withContext

        context.contentResolver.openOutputStream(targetFile.uri, "wt")?.use { output ->
            output.write(node.contentSnippet.toByteArray(Charsets.UTF_8))
            output.flush()
        }
    }

    private fun readDocumentContent(fileUri: Uri): String {
        return try {
            context.contentResolver.openInputStream(fileUri)?.bufferedReader()?.use { it.readText() } ?: ""
        } catch (e: Exception) {
            "# Error reading file\n${e.localizedMessage}"
        }
    }

    private fun pickColorForIndex(index: Int): String {
        val colors = listOf("#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#64748B")
        return colors[index % colors.size]
    }
}
