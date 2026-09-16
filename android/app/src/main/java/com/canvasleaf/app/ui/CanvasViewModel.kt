package com.canvasleaf.app.ui

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.canvasleaf.app.engine.VaultScannerEngine
import com.canvasleaf.app.engine.WikiLinkExtractor
import com.canvasleaf.app.model.CanvasEdge
import com.canvasleaf.app.model.CanvasNode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Canvas View Model managing the vault reactive state, SAF persistence, and edge re-computation.
 */
class CanvasViewModel(application: Application) : AndroidViewModel(application) {

    private val vaultScanner = VaultScannerEngine(application.applicationContext)

    private val _nodes = MutableStateFlow<List<CanvasNode>>(emptyList())
    val nodes: StateFlow<List<CanvasNode>> = _nodes.asStateFlow()

    private val _edges = MutableStateFlow<List<CanvasEdge>>(emptyList())
    val edges: StateFlow<List<CanvasEdge>> = _edges.asStateFlow()

    private val _currentVaultUri = MutableStateFlow<Uri?>(null)
    val currentVaultUri: StateFlow<Uri?> = _currentVaultUri.asStateFlow()

    init {
        loadSampleVault()
    }

    fun loadSampleVault() {
        val sample = listOf(
            CanvasNode(
                id = "node-auth",
                filePath = "UserAuth.md",
                title = "UserAuth.md",
                contentSnippet = "# UserAuth\nPOST /v1/login\n[[uses]] SessionDB.md",
                posX = 120f,
                posY = 100f,
                colorHex = "#3B82F6"
            ),
            CanvasNode(
                id = "node-session",
                filePath = "SessionDB.md",
                title = "SessionDB.md",
                contentSnippet = "# SessionDB\nRedis Cache Cluster\nTTL: 3600s",
                posX = 580f,
                posY = 220f,
                colorHex = "#10B981"
            ),
            CanvasNode(
                id = "node-client",
                filePath = "ClientApp.md",
                title = "ClientApp.md",
                contentSnippet = "# ClientApp\nAndroid / Compose\n[[sync]] SessionDB.md",
                posX = 120f,
                posY = 420f,
                colorHex = "#8B5CF6"
            )
        )
        _nodes.value = sample
        rebuildEdges(sample)
    }

    fun openVault(treeUri: Uri) {
        _currentVaultUri.value = treeUri
        viewModelScope.launch {
            val scannedNodes = vaultScanner.scanVaultDirectory(treeUri)
            _nodes.value = scannedNodes
            rebuildEdges(scannedNodes)
        }
    }

    fun updateNodeContent(nodeId: String, newContent: String) {
        val updatedList = _nodes.value.map { node ->
            if (node.id == nodeId) {
                val updated = node.copy(contentSnippet = newContent)
                _currentVaultUri.value?.let { uri ->
                    viewModelScope.launch {
                        vaultScanner.writeNodeToFile(uri, updated)
                    }
                }
                updated
            } else {
                node
            }
        }
        _nodes.value = updatedList
        rebuildEdges(updatedList)
    }

    fun moveNode(nodeId: String, newX: Float, newY: Float) {
        val updated = _nodes.value.map {
            if (it.id == nodeId) it.copy(posX = newX, posY = newY) else it
        }
        _nodes.value = updated
    }

    private fun rebuildEdges(nodes: List<CanvasNode>) {
        _edges.value = WikiLinkExtractor.buildAdjacencyGraph(nodes)
    }
}
