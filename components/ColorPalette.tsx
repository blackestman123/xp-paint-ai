
import React from 'react';
import { XP_COLORS } from '../types';
import { Language } from '../services/i18n';

interface ColorPaletteProps {
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  lang: Language;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  primaryColor,
  secondaryColor,
  setPrimaryColor,
  setSecondaryColor,
  lang
}) => {
  return (
    <div className="h-[46px] bg-[#ECE9D8] flex items-center p-1 border-t border-white shadow-[inset_0px_1px_0px_#f0f0f0]">
      {/* Active Colors Box */}
      <div className="w-[32px] h-[32px] relative border border-gray-400 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.2)] mr-2 bg-gray-100">
        <div 
            className="absolute top-2 left-2 w-4 h-4 border border-gray-600 z-10" 
            style={{ backgroundColor: secondaryColor }}
        />
        <div 
            className="absolute top-1 left-1 w-4 h-4 border border-gray-600 z-20" 
            style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Palette Grid */}
      <div className="flex flex-wrap w-[220px] h-[32px]">
        {XP_COLORS.map((color) => (
          <div
            key={color}
            className="w-4 h-4 border-[1px] border-[#808080] box-border cursor-pointer hover:border-white"
            style={{ backgroundColor: color }}
            onClick={() => setPrimaryColor(color)}
            onContextMenu={(e) => {
              e.preventDefault();
              setSecondaryColor(color);
            }}
          />
        ))}
      </div>
      
      <div className="text-[10px] text-gray-500 ml-4 hidden sm:block">
        {lang === 'en' ? 'Left-click: FG, Right-click: BG' : 'Clic gauche : Premier plan, Clic droit : Arrière-plan'}
      </div>
    </div>
  );
};
