import { CanvasNode } from '../types/canvas';

export const INITIAL_SAMPLE_NODES: CanvasNode[] = [
  {
    id: 'userauth',
    filePath: 'UserAuth.md',
    title: 'UserAuth.md',
    contentSnippet: `# 📝 UserAuth.md

API Endpoint: \`POST /v1/login\`
- Issues JWT Access & Refresh Token
- Verify credentials against Argon2id hash

## Auto-Wired Link:
[[uses]] SessionDB.md
[[ClientApp.md]]`,
    posX: 120,
    posY: 100,
    width: 320,
    height: 250,
    colorHex: '#3B82F6', // Blue
    tags: ['Backend', 'Auth', 'v1']
  },
  {
    id: 'sessiondb',
    filePath: 'SessionDB.md',
    title: 'SessionDB.md',
    contentSnippet: `# 📝 SessionDB.md

Redis Cache Cluster
- TTL: 3600s
- High availability with sentinel replication
- Token Revocation List (Blacklist)

## Status
- Latency: < 1.2ms (p99)
- Local memory footprint: ~45MB`,
    posX: 580,
    posY: 220,
    width: 320,
    height: 250,
    colorHex: '#10B981', // Leaf Emerald
    tags: ['Database', 'Cache', 'Redis']
  },
  {
    id: 'clientapp',
    filePath: 'ClientApp.md',
    title: 'ClientApp.md',
    contentSnippet: `# 📝 ClientApp.md

Android / Compose Client Application
- Material 3 Spatial Interface
- Offline-first Room Database
- Local File Synchronization via SAF

## Auto-Wired Link:
[[sync]] SessionDB.md`,
    posX: 120,
    posY: 440,
    width: 320,
    height: 250,
    colorHex: '#8B5CF6', // Purple
    tags: ['Frontend', 'Android', 'Compose']
  },
  {
    id: 'canvasleaf-guide',
    filePath: 'CanvasLeaf_Guide.md',
    title: 'CanvasLeaf Quick Guide 🍃',
    contentSnippet: `### 🌿 Welcome to CanvasLeaf!

100% Local-First Spatial Whiteboard.

- **Auto-Wire**: Type \`[[NoteName]]\` in any card to automatically create a bezier connection!
- **Relation Labels**: Try \`[[uses]] NoteName\` or \`[[sync]] NoteName\`.
- **Gesture Control**: Drag anywhere to Pan, Mouse wheel to Zoom (10% ~ 300%).
- **Drag & Drop**: Drop your own \`.md\` files directly onto this canvas!
- **Local Vault**: Click **Open Local Vault** to bind your PC folder.`,
    posX: 980,
    posY: 120,
    width: 340,
    height: 300,
    colorHex: '#F59E0B', // Amber
    tags: ['Guide', 'PKM', 'Local-First']
  }
];
