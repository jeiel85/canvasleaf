package com.canvasleaf.app

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.canvasleaf.app.ui.CanvasViewModel
import com.canvasleaf.app.ui.InfiniteCanvasViewport

class MainActivity : ComponentActivity() {

    private val viewModel: CanvasViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F1115)
                ) {
                    val nodes by viewModel.nodes.collectAsState()
                    val edges by viewModel.edges.collectAsState()

                    // SAF Folder Picker Launcher
                    val folderPickerLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.OpenDocumentTree()
                    ) { uri: Uri? ->
                        uri?.let {
                            contentResolver.takePersistableUriPermission(
                                it,
                                android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION or
                                        android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                            )
                            viewModel.openVault(it)
                        }
                    }

                    Box(modifier = Modifier.fillMaxSize()) {
                        InfiniteCanvasViewport(
                            nodes = nodes,
                            edges = edges,
                            onNodeMoved = { id, x, y -> viewModel.moveNode(id, x, y) }
                        )

                        // Floating Action Button to Open Local Vault via SAF
                        FloatingActionButton(
                            onClick = { folderPickerLauncher.launch(null) },
                            containerColor = Color(0xFF10B981),
                            contentColor = Color.White,
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Folder,
                                contentDescription = "Open Local Vault"
                            )
                        }
                    }
                }
            }
        }
    }
}
