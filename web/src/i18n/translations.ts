export type Language = 'ko' | 'en';

export const TRANSLATIONS = {
  ko: {
    brandSub: '로컬 우선 무한 화이트보드',
    searchPlaceholder: '카드 검색 (Ctrl+K)...',
    newCard: '새 카드',
    autoLayout: '자동 정렬',
    autoLayoutTip: '카드들을 최적의 구조로 자동 정렬합니다',
    exportPng: 'PNG 내보내기',
    exportPngTip: '화이트보드를 고해상도 Retina PNG 이미지로 저장',
    exportJson: '.canvas 내보내기',
    exportJsonTip: 'JSON Canvas 표준 규격으로 내보내기',
    openVault: '볼트 열기',
    openVaultTip: '로컬 볼트 폴더 또는 마크다운 파일 열기',
    resetDemo: '데모 리셋',
    resetDemoTip: '기본 아키텍처 디자인 데모로 리셋',
    zoomIn: '확대 (+)',
    zoomOut: '축소 (-)',
    resetZoom: '100%로 리셋',
    fitView: '화면 맞춤',
    cardColor: '카드 색상',
    editMarkdown: '마크다운 편집',
    doneEditing: '편집 완료',
    deleteCard: '카드 삭제',
    dragResize: '드래그하여 크기 조절',
    doubleClickHint: '더블 클릭하여 편집',
    typeMarkdownPlaceholder: '마크다운을 작성하세요. [[위키링크]]로 다른 카드와 연결할 수 있습니다...',
    vaultModalTitle: '로컬 볼트 매니저',
    vaultModalSub: '100% 로컬 우선 & 벤더 락인 제로',
    openRealFolderTitle: '실제 로컬 폴더 열기 (SAF / File System API)',
    openRealFolderDesc: '내 PC의 폴더를 선택하여 모든 .md 파일을 직접 불러옵니다',
    browse: '찾아보기 →',
    importManualTitle: '.md 파일 직접 가져오기',
    importManualDesc: '마크다운 파일들을 선택하여 캔버스에 즉시 투사합니다',
    selectFiles: '파일 선택 →',
    dragDropHint: '💡 팁: 데스크톱의 .md 파일들을 언제든 이 캔버스로 직접 드래그 앤 드롭할 수 있습니다!',
    cardsInCanvas: '현재 캔버스 카드 목록',
    inMemory: '메모리 로드됨',
    clickToJump: '클릭하여 캔버스 이동',
    newNoteTitle: '새_메모',
    newNoteContent: '# 새 메모\n\n여기에 마크다운을 입력하세요.\n[[대상문서]] 문법으로 다른 카드와 연결할 수 있습니다!',
    doubleClickCanvasNewCard: '캔버스 빈 곳을 더블 클릭하면 새 카드가 생성됩니다.',
    guideTitle: 'CanvasLeaf 사용 가이드 🍃',
    guideContent: `### 🌿 CanvasLeaf에 오신 것을 환영합니다!

100% 로컬 우선 공간 마크다운 화이트보드입니다.

- **Auto-Wire (자동 연결)**: 카드 본문에 \`[[문서명]]\`을 작성하면 베지어 곡선이 자동으로 연결됩니다!
- **관계 레이블 지정**: \`[[uses]] 문서명\` 또는 \`[[sync]] 문서명\`처럼 관계를 표시할 수 있습니다.
- **제스처 조작**: 빈 공간을 드래그하여 화면 이동(Pan), 마우스 휠로 줌 인/아웃 (10% ~ 300%).
- **드래그 앤 드롭**: 내 컴퓨터의 \`.md\` 파일들을 캔버스 위로 끌어다 놓아보세요!
- **로컬 폴더 열기**: 상단의 **볼트 열기** 버튼으로 실제 PC 폴더를 연동할 수 있습니다.`,
    language: '언어',
    currentLangName: '한국어',
  },
  en: {
    brandSub: 'Local-First Whiteboard',
    searchPlaceholder: 'Search cards (Ctrl+K)...',
    newCard: 'New Card',
    autoLayout: 'Auto-Layout',
    autoLayoutTip: 'Auto-organize cards into an optimal layout',
    exportPng: 'Export PNG',
    exportPngTip: 'Export whiteboard as high-res PNG image',
    exportJson: '.canvas',
    exportJsonTip: 'Export as JSON Canvas standard format',
    openVault: 'Open Vault',
    openVaultTip: 'Open local vault folder or markdown files',
    resetDemo: 'Reset Demo',
    resetDemoTip: 'Reset to Architecture Design Demo',
    zoomIn: 'Zoom In (+)',
    zoomOut: 'Zoom Out (-)',
    resetZoom: 'Reset Zoom to 100%',
    fitView: 'Fit View to All Cards',
    cardColor: 'Card Color',
    editMarkdown: 'Edit Markdown',
    doneEditing: 'Done Editing',
    deleteCard: 'Delete Card',
    dragResize: 'Drag to resize',
    doubleClickHint: 'Double-click to edit',
    typeMarkdownPlaceholder: 'Type markdown content with [[wikilinks]]...',
    vaultModalTitle: 'Local Vault Manager',
    vaultModalSub: '100% Local-First & Zero Vendor Lock-in',
    openRealFolderTitle: 'Open Real Local Folder (SAF / File System API)',
    openRealFolderDesc: 'Select any folder on your PC to load all .md files directly',
    browse: 'Browse →',
    importManualTitle: 'Import .md Files Manually',
    importManualDesc: 'Select one or more markdown files to project onto canvas',
    selectFiles: 'Select →',
    dragDropHint: '💡 Pro-Tip: You can also drag & drop .md files directly from your desktop into the canvas anytime!',
    cardsInCanvas: 'Cards in Current Canvas',
    inMemory: 'In Memory',
    clickToJump: 'Click to jump on canvas',
    newNoteTitle: 'NewNote',
    newNoteContent: '# NewNote\n\nType markdown here. Connect to other cards with [[TargetNote]]!',
    doubleClickCanvasNewCard: 'Double click on canvas background to create a new card.',
    guideTitle: 'CanvasLeaf Quick Guide 🍃',
    guideContent: `### 🌿 Welcome to CanvasLeaf!

100% Local-First Spatial Whiteboard.

- **Auto-Wire**: Type \`[[NoteName]]\` in any card to automatically create a bezier connection!
- **Relation Labels**: Try \`[[uses]] NoteName\` or \`[[sync]] NoteName\`.
- **Gesture Control**: Drag anywhere to Pan, Mouse wheel to Zoom (10% ~ 300%).
- **Drag & Drop**: Drop your own \`.md\` files directly onto this canvas!
- **Local Vault**: Click **Open Vault** to bind your PC folder.`,
    language: 'Language',
    currentLangName: 'English',
  },
};
