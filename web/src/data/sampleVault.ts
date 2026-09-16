import { CanvasNode } from '../types/canvas';
import { Language, TRANSLATIONS } from '../i18n/translations';

export const getInitialSampleNodes = (lang: Language = 'ko'): CanvasNode[] => {
  const t = TRANSLATIONS[lang];

  return [
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
      filePath: lang === 'ko' ? 'CanvasLeaf_가이드.md' : 'CanvasLeaf_Guide.md',
      title: t.guideTitle,
      contentSnippet: t.guideContent,
      posX: 980,
      posY: 120,
      width: 350,
      height: 310,
      colorHex: '#F59E0B', // Amber
      tags: lang === 'ko' ? ['가이드', 'PKM', '로컬우선'] : ['Guide', 'PKM', 'Local-First']
    }
  ];
};
