# [PRD / SDD] 바이럴 무한 캔버스 노트 분석 및 《CanvasLeaf》 상세 제품 설계서

- **문서 버전**: v1.0.0
- **작성 일자**: 2026-09-16
- **프로젝트 명**: CanvasLeaf: Local-First Spatial Markdown Whiteboard (캔버스리프)
- **카테고리**: 지식노동자/개발자용 100% 로컬 우선 무한 2D 캔버스 & 마크다운 화이트보드
- **타깃 플랫폼**: Android (Tablet/Foldable 최적화, Jetpack Compose) + Desktop (Windows/macOS)

---

## 1. 벤치마크 바이럴 인디 앱 심층 분석

### 1.1 분석 대상
- **대표 레퍼런스**: 《Heptabase》, 《Scrintal》, 《Obsidian Canvas》
- **장르 특성**: 2D 무한 화이트보드 캔버스 위에 마크다운 카드를 배치하고 선(Edge)으로 연결하는 시각적 개인 지식 관리(Visual PKM)

### 1.2 바이럴 핵심 요인 (Viral Drivers)
1. **선형 텍스트의 한계를 넘는 '공간 기억(Spatial Memory)' 활용**:
   - 복잡한 시스템 아키텍처, 논문 연구, 기획서의 인과 관계를 화이트보드에 펼쳐두고 한눈에 조망할 수 있어 Product Hunt 및 연구자/개발자 트위터에서 열광적 지지.
2. **카드 분할과 카드 간 시각적 연결**:
   - 한 장의 긴 문서 대신 원자적(Atomic) 카드들을 선으로 이어 마인드맵처럼 구조화하는 사고의 확장.

### 1.3 나쁜 요소 및 기존 앱의 결함 (Pain Points)
1. **일렉트론(Electron) 기반의 극심한 메모리 누수와 버벅임**:
   - 카드가 50개만 넘어가도 1GB 이상의 RAM을 소모하며 줌인/줌아웃 시 프레임 드랍 발생.
2. **월 $12~$18에 달하는 비싼 구독료 (Heptabase)**:
   - 단순 화이트보드 툴임에도 연 20만 원 이상의 구독료를 청구하며 유저 부담 가중.
3. **모바일/태블릿 터치 제스처 경험의 열악함**:
   - 데스크톱 마우스/키보드 위주로 설계되어 태블릿 펜슬이나 터치 조작 시 제스처 충돌 빈번.
4. **독점 클라우드 DB 락인(Vendor Lock-in)**:
   - 데이터가 로컬 `.md` 파일이 아닌 proprietary 데이터베이스에 묶여 있어 파일 추출이 번거로움.

---

## 2. +α 혁신 프로젝트: 《CanvasLeaf》 제품 개요

> **"로컬 마크다운 파일이 그대로 캔버스가 됩니다. GPU 가속 60fps 무한 화이트보드와 양방향 자동 연결"**

### 2.1 핵심 가치 제안 (Value Proposition)
1. **100% Local-First & Zero Lock-in**:
   - 내 컴퓨터/폰의 로컬 폴더(`.md` 파일들)를 그대로 읽어 캔버스 카드로 투사. 캔버스에서 수정하면 원본 마크다운 파일에 실시간 양방향 반영.
2. **Auto-Wire: 위키링크(`[[link]]`) 시각적 자동 연결**:
   - 마크다운 본문에 적힌 `[[다른문서]]` 문법을 감지하여 캔버스 위에서 카드 간 관계선을 자동으로 연결해 주는 스마트 다이어그램.
3. **GPU 가속 Skia / Compose 고성능 렌더링**:
   - 수천 개의 카드가 로드되어도 60fps 부드러운 줌/팬 유지, 메모리 점유율 50MB 미만.
4. **1회 영구 라이선스 ($19.99)**:
   - 구독료 없는 영구 소장 라이선스.

---

## 3. 코어 UX 및 화면 텍스트 와이어프레임

### 3.1 태블릿/데스크톱 2D 캔버스 뷰포트

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

## 4. 시스템 아키텍처 및 안드로이드 컴포넌트

### 4.1 기술 스택
- **Language**: Kotlin 2.0+
- **Canvas Engine**: Jetpack Compose Custom `Canvas` + `androidx.compose.ui.geometry`
- **File Access**: Android Storage Access Framework (SAF) 직접 로컬 폴더 바인딩
- **Parser**: CommonMark-Java + Regex WikiLink Extractor (`\\[\\[(.*?)\\]\\]`)

### 4.2 아키텍처 데이터 파이프라인

```
[Local Vault Directory Selection]
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
[Compose Hardware-Accelerated Viewport]
       │
       ├─► [Pinch-to-Zoom & Two-Finger Pan Gestures]
       │
       └─► [On Card Content Edit -> Direct File Write via SAF]
```

---

## 5. 핵심 엔티티 및 클래스 설계

```kotlin
// 1. 캔버스 노드(카드) 엔티티
data class CanvasNode(
    val id: String,
    val filePath: String,
    val title: String,
    val contentSnippet: String,
    val posX: Float,
    val posY: Float,
    val width: Float = 320f,
    val height: Float = 240f,
    val colorHex: String = "#1E1E24"
)

// 2. 캔버스 엣지(관계선) 데이터
data class CanvasEdge(
    val edgeId: String,
    val fromNodeId: String,
    val toNodeId: String,
    val label: String? = null,
    val isBiDirectional: Boolean = false
)
```

---

## 6. 4주 완성 MVP 로드맵

- **Sprint 1 (Week 1): 무한 캔버스 제스처 엔진 & 노드 렌더링**
  - Compose 기반 줌(Zoom), 팬(Pan) 변환 매트릭스 및 사각형 카드 렌더링 파이프라인 완성.
- **Sprint 2 (Week 2): 로컬 마크다운 SAF 파일 I/O & 카드 편집**
  - 로컬 `.md` 파일 드래그 앤 드롭 로드 및 캔버스 인라인 텍스트 편집 즉시 파일 저장.
- **Sprint 3 (Week 3): 위키링크 자동 감지 & 베지어 곡선 관계선**
  - `[[문서명]]` 링크 감지 시 카드 간 부드러운 큐빅 베지어 연결선 렌더링.
- **Sprint 4 (Week 4): 성능 프로파일링 & 1회 라이선스 패키징**
  - 100개 노드 기준 60fps 유지 최적화, 인앱결제 바인딩 후 구글 플레이 릴리즈.
