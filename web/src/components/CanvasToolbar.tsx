import React from 'react';
import {
  Plus,
  LayoutGrid,
  Download,
  FolderOpen,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Search,
  Globe,
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../i18n/translations';

interface CanvasToolbarProps {
  vaultName: string;
  zoomPercent: number;
  searchQuery: string;
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  onSearchChange: (query: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  onAddNewCard: () => void;
  onAutoLayout: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onOpenVaultModal: () => void;
  onResetToSample: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  vaultName,
  zoomPercent,
  searchQuery,
  lang,
  onLanguageChange,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onAddNewCard,
  onAutoLayout,
  onExportPng,
  onExportJson,
  onOpenVaultModal,
  onResetToSample,
}) => {
  const t = TRANSLATIONS[lang];

  const toggleLanguage = () => {
    onLanguageChange(lang === 'ko' ? 'en' : 'ko');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-[#12141A]/90 backdrop-blur-md border-b border-[#23272F] px-4 flex items-center justify-between z-20 select-none shadow-md">
        {/* Left: Brand & Vault Path */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-950/50">
              <span className="text-white font-bold text-lg">🍃</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide">
                CanvasLeaf
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.brandSub}
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-gray-700/60 mx-1 hidden sm:block" />

          {/* Current Vault & Canvas file */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181B22] border border-gray-800 text-xs font-mono text-gray-300">
            <span className="text-gray-500">~/Vault/</span>
            <span className="text-white font-medium">{vaultName}</span>
          </div>
        </div>

        {/* Center: Quick Search Filter */}
        <div className="hidden md:flex items-center relative max-w-xs w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#181B22] text-xs text-gray-200 pl-8 pr-3 py-1.5 rounded-lg border border-gray-800 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Right: Language, Zoom controls & Vault management */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181B22] hover:bg-gray-800 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'ko' ? '한국어 (KO)' : 'English (EN)'}</span>
          </button>

          {/* Zoom controls widget */}
          <div className="flex items-center bg-[#181B22] border border-gray-800 rounded-lg p-0.5 text-xs font-mono text-gray-300">
            <button
              onClick={onZoomOut}
              title={t.zoomOut}
              className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onResetZoom}
              title={t.resetZoom}
              className="px-2 py-0.5 hover:text-white hover:bg-white/10 rounded text-[11px] font-semibold transition-colors min-w-[50px] text-center"
            >
              {zoomPercent}%
            </button>
            <button
              onClick={onZoomIn}
              title={t.zoomIn}
              className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFitView}
              title={t.fitView}
              className="p-1 hover:text-white hover:bg-white/10 rounded border-l border-gray-800 transition-colors ml-0.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Open Vault / Local folder */}
          <button
            onClick={onOpenVaultModal}
            title={t.openVaultTip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181B22] hover:bg-gray-800 border border-gray-700/80 text-xs font-medium text-gray-200 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t.openVault}</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetToSample}
            title={t.resetDemoTip}
            className="p-2 rounded-lg bg-[#181B22] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Bottom Floating Action Dock (matching Section 3.1 wireframe) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-[#12141A]/90 backdrop-blur-lg border border-[#2B303C] rounded-2xl shadow-2xl select-none">
        {/* + New Card */}
        <button
          onClick={onAddNewCard}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newCard}</span>
        </button>

        <div className="h-6 w-px bg-gray-700/60" />

        {/* Auto-Layout */}
        <button
          onClick={onAutoLayout}
          title={t.autoLayoutTip}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C2027] hover:bg-gray-800 text-gray-200 hover:text-white text-xs font-medium border border-gray-700/60 transition-all active:scale-95"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.autoLayout}</span>
        </button>

        {/* Export PNG */}
        <button
          onClick={onExportPng}
          title={t.exportPngTip}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C2027] hover:bg-gray-800 text-gray-200 hover:text-white text-xs font-medium border border-gray-700/60 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>{t.exportPng}</span>
        </button>

        {/* Export JSON Canvas */}
        <button
          onClick={onExportJson}
          title={t.exportJsonTip}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C2027] hover:bg-gray-800 text-gray-200 hover:text-white text-xs font-medium border border-gray-700/60 transition-all active:scale-95"
        >
          <FileCode className="w-3.5 h-3.5 text-purple-400" />
          <span>{t.exportJson}</span>
        </button>
      </div>
    </>
  );
};
