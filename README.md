# 🍃 CanvasLeaf: Local-First Spatial Markdown Whiteboard

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10B981?style=for-the-badge&logo=github)](https://jeiel85.github.io/canvasleaf/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20Desktop-purple?style=for-the-badge)](https://github.com/jeiel85/canvasleaf)
[![Tech Stack](https://img.shields.io/badge/Stack-Kotlin%202.0%20%7C%20Compose%20%7C%20React%20%7C%20Vite-orange?style=for-the-badge)](https://github.com/jeiel85/canvasleaf)

> **"로컬 마크다운 파일이 그대로 캔버스가 됩니다. GPU 가속 60fps 무한 화이트보드와 양방향 자동 연결"**  
> *Local Markdown files become an infinite visual canvas. 60fps GPU-accelerated whiteboard with bi-directional Auto-Wire connections.*

---

## 🌐 [👉 웹 라이브 데모 바로가기 (Click for Live Demo)](https://jeiel85.github.io/canvasleaf/)

별도의 설치 없이 브라우저에서 바로 **CanvasLeaf**의 무한 2D 캔버스, 위키링크 자동 연결(Auto-Wire), 로컬 폴더 연동, 카드 인라인 편집을 직접 체험하실 수 있습니다!

---

## 💡 왜 CanvasLeaf 인가? (Why CanvasLeaf?)

기존 비주얼 지식 관리(Visual PKM) 및 화이트보드 툴들의 고질적인 문제점을 해결했습니다:

| 비교 항목 | 기존 툴 (Heptabase, Miro 등) | Obsidian Canvas | **CanvasLeaf (캔버스리프)** |
| :--- | :--- | :--- | :--- |
| **가격 정책** | 월 $12 ~ $18 고액 구독료 | 무료/부분 유료 | **100% 무료 & 영구 소장** |
| **데이터 소유권** | 독점 클라우드 DB 락인 (Lock-in) | 로컬 JSON Canvas | **100% 로컬 우선 (순수 `.md` 파일)** |
| **위키링크 시각화** | 수동으로 일일이 선 연결 필요 | 수동 엣지 연결 | **본문 `[[link]]` 작성 시 1초 만에 자동 연결 (Auto-Wire)** |
| **엔진 & 성능** | 무거운 Electron (RAM 1GB+ 소모) | Electron 웹뷰 기반 | **GPU 가속 Skia / Compose / Canvas (60fps 유지)** |
| **태블릿 / 터치** | 모바일/태블릿 터치 제스처 불안정 | 모바일 플러그인 제약 | **Android Tablet / Foldable 네이티브 제스처 최적화** |

---

## ✨ 핵심 기능 (Key Features)

### 1. 🔗 Auto-Wire: 위키링크(`[[link]]`) 시각적 자동 연결
- 마크다운 본문에 적힌 `[[다른문서]]` 또는 `[[uses]] SessionDB.md` 문법을 실시간 감지하여 캔버스 위에서 카드 간 관계선을 **큐빅 베지어 곡선(Cubic Bézier Curve)**으로 자동 연결합니다.
- 카드 위치를 옮겨도 엣지(Edge)와 화살표, 관계 라벨이 60fps로 매끄럽게 따라옵니다.

### 2. 📂 100% Local-First & Zero Lock-in
- 내 컴퓨터/스마트폰의 폴더에 저장된 `.md` 파일들을 그대로 읽어와 화이트보드 카드로 투사합니다.
- 캔버스에서 카드를 수정하면 원본 마크다운 파일에 즉시 양방향 반영됩니다.
- Web 데모에서도 **File System Access API (`showDirectoryPicker`)** 및 **드래그 앤 드롭**을 지원하여 실제 PC 로컬 폴더를 열 수 있습니다.

### 3. 🌐 완벽한 다국어 지원 (한국어 / English i18n)
- 상단 툴바의 언어 전환 버튼(🌐)을 통해 **한국어(기본값)**와 **English** 간 실시간 즉시 전환이 가능합니다.
- 툴바, 팝업, 카드 안내문, 플레이스홀더, 가이드 노트까지 모두 완벽하게 현지화되어 있습니다.

### 4. ⚡ 60fps 무한 2D 캔버스 뷰포트
- 줌 인/아웃 (10% ~ 300%), 자유로운 팬(Pan), 미니맵(Minimap), 빠른 카드 검색(Ctrl+K).
- 터치 핀치 줌 & 두 손가락 팬 제스처 완벽 지원.

### 5. 📐 Auto-Layout (위상 정렬 자동 배치)
- 복잡하게 얽힌 카드들을 DAG(Directed Acyclic Graph) 위상 정렬 알고리즘을 통해 겹침 없이 좌->우 레이어로 자동 정렬합니다.

### 6. 📸 Export PNG & JSON Canvas
- 작업한 화이트보드를 고해상도 Retina PNG 이미지로 즉시 내보내거나, Obsidian Canvas 호환 `.canvas` JSON 포맷으로 저장할 수 있습니다.

---

## 🖼️ 코어 UX 와이어프레임 (PRD Section 3.1)

```text
+-------------------------------------------------------------+
| [CanvasLeaf] ~/Vault/Architecture_Design.canvas   [Zoom: 85%]|
+-------------------------------------------------------------+
|                                                             |
|   +-------------------+                                     |
|   | 📝 UserAuth.md     |                                     |
|   | ----------------- |                                     |
|   | POST /v1/login    | ─────────────┐                      |
|   | JWT Token Issuance|              │ [[uses]]             |
|   +-------------------+              ▼                      |
|                               +-------------------+         |
|                               | 📝 SessionDB.md   |         |
|                               | ----------------- |         |
|   +-------------------+       | Redis Cache Cluster|        |
|   | 📝 ClientApp.md   | ────► | TTL: 3600s        |         |
|   | ----------------- | [[sync]] +-------------------+      |
|   | Android / Compose |                                     |
|   +-------------------+                                     |
|                                                             |
| ----------------------------------------------------------- |
| [ + New Card ]      [ Auto-Layout ]      [ Export PNG / PDF ]|
+-------------------------------------------------------------+
```

---

## 🏗️ 시스템 아키텍처 (Architecture)

```
[Local Vault Directory Selection / Drag & Drop]
       │
       ▼
[VaultScannerEngine] (Read all .md files in directory)
       │
       ├─► [WikiLinkExtractor] (Build Adjacency Graph of Nodes & Edges)
       │
       ▼
[CanvasCoordinateManager] (Compute Node (x, y) & Viewport Transformation Matrix)
       │
       ▼
[Hardware-Accelerated Viewport] (Web Canvas / Jetpack Compose)
       │
       ├─► [Pinch-to-Zoom & Pan Gestures]
       │
       ├─► [Smooth Cubic Bézier Curve Edge Renderer]
       │
       └─► [On Card Content Edit -> Direct File Write via SAF / File System API]
```

---

## 📁 디렉토리 구조 (Repository Layout)

```
canvasleaf/
├── sample_vault/                                  # Section 3.1 아키텍처 디자인 샘플 볼트
│   ├── UserAuth.md
│   ├── SessionDB.md
│   ├── ClientApp.md
│   └── Architecture_Design.canvas
│
├── web/                                           # 🌐 웹 라이브 데모 (Vite + React + TS + Tailwind)
│   ├── src/
│   │   ├── engines/
│   │   │   ├── WikiLinkExtractor.ts               # 위키링크 파싱 & 그래프 생성
│   │   │   ├── CoordinateManager.ts               # 뷰포트 좌표 변환 & 큐빅 베지어 경로 계산
│   │   │   └── AutoLayoutEngine.ts                # 노드 자동 배치 엔진
│   │   ├── components/
│   │   │   ├── InfiniteCanvas.tsx                 # 60fps 무한 캔버스
│   │   │   ├── MarkdownCard.tsx                   # 마크다운 렌더러 & 인라인 에디터
│   │   │   ├── BezierEdgeRenderer.tsx             # 큐빅 베지어 엣지 렌더러
│   │   │   ├── CanvasToolbar.tsx                  # 상단 및 하단 액션 독
│   │   │   ├── VaultExplorerModal.tsx             # 볼트 탐색기 모달
│   │   │   └── Minimap.tsx                        # 미니맵
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── android/                                       # 📱 Android 네이티브 (Jetpack Compose + Kotlin 2.0)
    ├── app/src/main/java/com/canvasleaf/app/
    │   ├── model/ (CanvasNode.kt, CanvasEdge.kt)
    │   ├── engine/ (WikiLinkExtractor.kt, VaultScannerEngine.kt, CanvasCoordinateManager.kt)
    │   ├── ui/ (InfiniteCanvasViewport.kt, CanvasViewModel.kt)
    │   └── MainActivity.kt
    └── build.gradle.kts
```

---

## 🚀 빠른 시작 (Quick Start)

### 1. 웹 라이브 데모 로컬 실행
```bash
cd web
npm install
npm run dev
```
브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 2. 웹 데모 빌드
```bash
cd web
npm run build
```
산출물이 `web/dist` 디렉토리에 생성됩니다.

---

## 📄 라이선스 (License)
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
