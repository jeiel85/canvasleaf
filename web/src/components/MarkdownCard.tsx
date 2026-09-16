import React, { useState, useRef } from 'react';
import { CanvasNode } from '../types/canvas';
import { Edit3, Check, Trash2, GripHorizontal, FileText, Palette, Hash } from 'lucide-react';
import { TRANSLATIONS, Language } from '../i18n/translations';

interface MarkdownCardProps {
  node: CanvasNode;
  isSelected: boolean;
  lang: Language;
  onSelect: (nodeId: string) => void;
  onUpdate: (updatedNode: CanvasNode) => void;
  onDelete: (nodeId: string) => void;
  onNavigateToNode: (targetTitle: string) => void;
  onStartDrag: (e: React.MouseEvent, nodeId: string) => void;
  onStartResize: (e: React.MouseEvent, nodeId: string) => void;
}

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const MarkdownCard: React.FC<MarkdownCardProps> = ({
  node,
  isSelected,
  lang,
  onSelect,
  onUpdate,
  onDelete,
  onNavigateToNode,
  onStartDrag,
  onStartResize,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editAreaRef = useRef<HTMLTextAreaElement>(null);
  const t = TRANSLATIONS[lang];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...node, title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...node, contentSnippet: e.target.value });
  };

  // Render markdown text into rich HTML elements
  const renderMarkdownContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Header 1
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-base font-bold text-white mb-2 flex items-center gap-1.5 border-b border-gray-700/60 pb-1">
            {renderInlineElements(line.substring(2))}
          </h1>
        );
      }
      // Header 2
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-sm font-semibold text-gray-200 mt-2 mb-1">
            {renderInlineElements(line.substring(3))}
          </h2>
        );
      }
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xs font-semibold text-gray-300 mt-1 mb-1">
            {renderInlineElements(line.substring(4))}
          </h3>
        );
      }
      // Unordered list
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start text-xs text-gray-300 ml-1 my-0.5">
            <span className="text-emerald-400 mr-1.5 leading-relaxed">•</span>
            <span>{renderInlineElements(itemText)}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-gray-300 leading-relaxed my-0.5">
          {renderInlineElements(line)}
        </p>
      );
    });
  };

  // Render inline backticks, bold, and [[wikilinks]]
  const renderInlineElements = (text: string) => {
    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /(\[\[.*?\]\]|`[^`]+`|\*\*[^*]+\*\*)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }

      const matchStr = match[0];

      if (matchStr.startsWith('[[') && matchStr.endsWith(']]')) {
        // WikiLink tag
        const inner = matchStr.substring(2, matchStr.length - 2).trim();
        const targetTitle = inner.split('|')[0].trim().replace(/\.md$/i, '');
        const displayLabel = inner.includes('|') ? inner.split('|')[1].trim() : targetTitle;

        tokens.push(
          <button
            key={match.index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToNode(targetTitle);
            }}
            title={lang === 'ko' ? `${targetTitle} 카드로 이동` : `Navigate to ${targetTitle}`}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-emerald-950/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono transition-colors shadow-sm cursor-pointer"
          >
            <span className="text-emerald-400 text-[10px]">🔗</span>
            <span>[[{displayLabel}]]</span>
          </button>
        );
      } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        // Code snippet
        tokens.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-300 font-mono text-[11px] border border-gray-700/50"
          >
            {matchStr.substring(1, matchStr.length - 1)}
          </code>
        );
      } else if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        // Bold text
        tokens.push(
          <strong key={match.index} className="font-semibold text-white">
            {matchStr.substring(2, matchStr.length - 2)}
          </strong>
        );
      }

      lastIndex = match.index + matchStr.length;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens.length > 0 ? tokens : text;
  };

  return (
    <div
      style={{
        transform: `translate(${node.posX}px, ${node.posY}px)`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        position: 'absolute',
        left: 0,
        top: 0,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title={isEditing ? undefined : t.doubleClickHint}
      className={`group flex flex-col bg-[#16191E]/95 backdrop-blur-md rounded-xl border transition-shadow duration-150 ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-950/40'
          : 'border-[#282C34] hover:border-gray-600 shadow-xl'
      }`}
    >
      {/* Top Accent Color Bar */}
      <div
        className="h-1 w-full rounded-t-xl transition-colors"
        style={{ backgroundColor: node.colorHex }}
      />

      {/* Card Header (Drag Handle) */}
      <div
        onMouseDown={(e) => onStartDrag(e, node.id)}
        className="flex items-center justify-between px-3 py-2 border-b border-[#23272F] cursor-grab active:cursor-grabbing bg-[#1C2027]/70 rounded-t-lg select-none"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripHorizontal className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          {isEditing ? (
            <input
              type="text"
              value={node.title}
              onChange={handleTitleChange}
              className="bg-black/40 text-xs font-medium text-white px-1.5 py-0.5 rounded border border-emerald-500/50 outline-none w-full font-mono"
              autoFocus
            />
          ) : (
            <span className="text-xs font-semibold text-gray-200 truncate font-mono">
              {node.title}
            </span>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {/* Color Picker Toggle */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              title={t.cardColor}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {showColorPicker && (
              <div
                className="absolute right-0 top-full mt-1 p-1.5 bg-[#1F232B] border border-gray-700 rounded-lg shadow-xl flex gap-1 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onUpdate({ ...node, colorHex: color });
                      setShowColorPicker(false);
                    }}
                    style={{ backgroundColor: color }}
                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Edit / Save Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            title={isEditing ? t.doneEditing : t.editMarkdown}
            className={`p-1 rounded transition-colors ${
              isEditing
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Card */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            title={t.deleteCard}
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar font-sans">
        {isEditing ? (
          <textarea
            ref={editAreaRef}
            value={node.contentSnippet}
            onChange={handleContentChange}
            placeholder={t.typeMarkdownPlaceholder}
            className="w-full h-full bg-transparent text-gray-200 text-xs font-mono leading-relaxed outline-none resize-none border-0"
          />
        ) : (
          <div className="space-y-1">
            {renderMarkdownContent(node.contentSnippet)}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-3 py-1.5 bg-[#14171C]/60 border-t border-[#23272F] rounded-b-xl flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5 truncate">
          {node.tags && node.tags.length > 0 ? (
            node.tags.map((tag, i) => (
              <span key={i} className="flex items-center text-gray-400">
                <Hash className="w-2.5 h-2.5 text-emerald-500 mr-0.5" />
                {tag}
              </span>
            ))
          ) : (
            <span>{node.filePath}</span>
          )}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={(e) => onStartResize(e, node.id)}
          title={t.dragResize}
          className="w-3.5 h-3.5 cursor-nwse-resize text-gray-500 hover:text-emerald-400 flex items-center justify-center -mr-1"
        >
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-current opacity-70">
            <path d="M8 2 L10 2 L10 10 L2 10 L2 8 L8 8 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
