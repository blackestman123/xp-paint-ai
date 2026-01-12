
import React from 'react';
import { Language, translations } from '../services/i18n';

interface ReferenceWindowProps {
  image: string | null;
  onClose: () => void;
  onUpload: () => void;
  onClear: () => void;
  lang: Language;
}

export const ReferenceWindow: React.FC<ReferenceWindowProps> = ({ image, onClose, onUpload, onClear, lang }) => {
  const t = translations[lang];
  return (
    <div className="absolute top-20 right-20 w-[240px] bg-[#ECE9D8] border-2 border-[#0054E3] rounded shadow-2xl font-sans overflow-hidden z-[150] flex flex-col">
      <div className="bg-gradient-to-r from-[#0054E3] to-[#2585EA] text-white px-2 py-1 flex justify-between items-center text-xs font-bold shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-[10px]">🖼️</span>
          <span>{t.reference}</span>
        </div>
        <button onClick={onClose} className="bg-[#E06B6B] hover:bg-red-500 px-1 rounded-sm text-[10px] border border-white leading-none pb-[1px]">×</button>
      </div>
      
      <div className="p-2 flex flex-col gap-2 flex-1 min-h-[150px]">
        <div className="flex-1 bg-white border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden min-h-[120px]">
          {image ? (
            <img src={image} alt="Reference" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-[10px] text-gray-400 italic text-center px-4">{t.noRef}</div>
          )}
        </div>
        
        <div className="flex gap-1 justify-center shrink-0">
          <button 
            onClick={onUpload}
            className="px-2 py-1 bg-white border border-gray-500 text-[10px] text-black hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm font-bold min-w-[60px]"
          >
            {t.load}
          </button>
          {image && (
            <button 
              onClick={onClear}
              className="px-2 py-1 bg-white border border-gray-500 text-[10px] text-black hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm font-bold min-w-[60px]"
            >
              {t.clear}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
