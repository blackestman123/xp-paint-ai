
import React, { useState, useRef, useEffect } from 'react';
import { Layer } from '../types';
import { Language, translations } from '../services/i18n';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onRenameLayer: (id: string, newName: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  lang: Language;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onRenameLayer,
  onAddLayer,
  onDeleteLayer,
  onMoveLayer,
  lang
}) => {
  const t = translations[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRenaming = (layer: Layer) => {
    setEditingId(layer.id);
    setTempName(layer.name);
  };

  const commitRename = () => {
    if (editingId && tempName.trim()) {
      onRenameLayer(editingId, tempName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="w-full h-full bg-[#ECE9D8] border border-[#808080] flex flex-col font-sans pointer-events-auto">
      <div className="bg-gradient-to-r from-[#0054E3] to-[#2585EA] text-white px-2 py-1 flex justify-between items-center text-[11px] font-bold shrink-0">
        <span>{t.layers}</span>
        <div className="flex gap-1">
          <button className="bg-[#ECE9D8] text-black w-4 h-4 flex items-center justify-center text-[10px] border border-gray-600 rounded-sm hover:bg-white active:bg-gray-200" onClick={onAddLayer} title={t.newLayer}>+</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-[1px] p-[2px] bg-white overflow-y-auto border-inset shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)]">
        {[...layers].reverse().map((layer) => (
          <div 
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            onDoubleClick={() => startRenaming(layer)}
            className={`flex items-center gap-1 px-1 py-1 cursor-default text-[10px] ${activeLayerId === layer.id ? 'bg-[#316AC5] text-white' : 'hover:bg-gray-100 text-black'}`}
          >
            <button 
              className="w-4 h-4 flex items-center justify-center border border-gray-400 bg-[#ECE9D8] text-black shrink-0"
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
              title={layer.visible ? t.hideLayer : t.showLayer}
            >
              {layer.visible ? '👁️' : ''}
            </button>
            
            <div className="flex-1 truncate">
              {editingId === layer.id ? (
                <input
                  ref={inputRef}
                  className="w-full text-black px-1 border border-gray-400 h-4 leading-none text-[10px] focus:outline-none"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span title={t.renameHint}>{layer.name}</span>
              )}
            </div>

            <div className="flex gap-[1px] shrink-0">
               <button className="px-1 hover:bg-gray-300 text-black bg-[#ECE9D8] border border-gray-400 text-[8px]" onClick={(e) => { e.stopPropagation(); onMoveLayer(layer.id, 'up'); }}>↑</button>
               <button className="px-1 hover:bg-gray-300 text-black bg-[#ECE9D8] border border-gray-400 text-[8px]" onClick={(e) => { e.stopPropagation(); onMoveLayer(layer.id, 'down'); }}>↓</button>
               <button className="px-1 hover:bg-red-200 text-black bg-[#ECE9D8] border border-gray-400 text-[8px]" onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
