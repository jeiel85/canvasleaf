import React, { useRef } from 'react';
import { CanvasNode } from '../types/canvas';
import { X, Folder, Upload, HardDrive, FileText, CheckCircle2 } from 'lucide-react';

interface VaultExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: CanvasNode[];
  onSelectNode: (nodeId: string) => void;
  onImportFiles: (files: FileList | File[]) => void;
  onOpenDirectoryPicker: () => void;
}

export const VaultExplorerModal: React.FC<VaultExplorerModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onSelectNode,
  onImportFiles,
  onOpenDirectoryPicker,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#181B22] border border-[#2B303C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#14161C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Local Vault Manager</h2>
              <p className="text-[11px] text-gray-400">100% Local-First & Zero Vendor Lock-in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Banners */}
        <div className="p-5 space-y-3">
          {/* File System Access API Button */}
          <button
            onClick={() => {
              onOpenDirectoryPicker();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#1F242E] hover:from-emerald-900/40 hover:to-[#252C39] border border-emerald-500/30 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Open Real Local Folder (SAF / File System API)
                </div>
                <div className="text-[11px] text-gray-400">
                  Select any folder on your PC to load all .md files directly
                </div>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-medium">Browse →</span>
          </button>

          {/* Import Multiple Files */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#1E222A] hover:bg-[#252A34] border border-gray-700/60 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Import .md Files Manually
                </div>
                <div className="text-[11px] text-gray-400">
                  Select one or more markdown files to project onto canvas
                </div>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-medium">Select →</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".md,.markdown,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag & Drop Hint */}
          <div className="p-3 rounded-lg border border-dashed border-gray-700 bg-black/20 text-center text-[11px] text-gray-400">
            💡 Pro-Tip: You can also drag & drop <span className="text-emerald-400 font-mono font-medium">.md</span> files directly from your desktop into the canvas anytime!
          </div>
        </div>

        {/* Current Active Cards / Files */}
        <div className="px-5 pb-2">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Cards in Current Canvas ({nodes.length})</span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> In Memory
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5 custom-scrollbar">
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => {
                onSelectNode(node.id);
                onClose();
              }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#14171D] hover:bg-[#1F232B] border border-gray-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: node.colorHex }}
                />
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-mono text-gray-200 truncate">
                  {node.title}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono ml-2 flex-shrink-0">
                {Math.round(node.posX)}, {Math.round(node.posY)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
