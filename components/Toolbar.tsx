
import React from 'react';
import { ToolType, BrushTip } from '../types';
import { Icons } from '../constants';
import { Language } from '../services/i18n';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (tool: ToolType) => void;
  onUndo: () => void;
  onMagicClick: () => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  activeBrushTip: BrushTip;
  setActiveBrushTip: (tip: BrushTip) => void;
  lang: Language;
}

const ToolButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.FC;
  label?: string;
  shortcut?: string;
}> = ({ active, onClick, icon: Icon, label, shortcut }) => {
  const title = shortcut ? `${label} (${shortcut.toUpperCase()})` : label;
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-6 h-6 flex items-center justify-center m-[1px]
        border-[1px]
        ${active 
          ? 'bg-white border-gray-500 border-r-white border-b-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]' 
          : 'bg-[#ECE9D8] border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white active:shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)] hover:bg-[#FFF7D0]'}
      `}
    >
      <div className="text-black scale-90 transform flex items-center justify-center">
        <Icon />
      </div>
    </button>
  );
};

const Separator = () => (
  <div className="h-[2px] w-full my-1 px-1">
    <div className="h-[1px] bg-gray-400 border-b border-white"></div>
  </div>
);

const LINE_WIDTHS = [1, 2, 4, 6, 8];
const ZOOM_LEVELS = [1, 2, 6, 8];

const BRUSH_TIPS_CONFIG = [
  { id: BrushTip.ROUND_S, name: 'Round Brush S', icon: () => <div className="w-1 h-1 bg-black rounded-full" /> },
  { id: BrushTip.ROUND_M, name: 'Round Brush M', icon: () => <div className="w-2 h-2 bg-black rounded-full" /> },
  { id: BrushTip.ROUND_L, name: 'Round Brush L', icon: () => <div className="w-3 h-3 bg-black rounded-full" /> },
  
  { id: BrushTip.SQUARE_S, name: 'Square Brush S', icon: () => <div className="w-1 h-1 bg-black" /> },
  { id: BrushTip.SQUARE_M, name: 'Square Brush M', icon: () => <div className="w-2 h-2 bg-black" /> },
  { id: BrushTip.SQUARE_L, name: 'Square Brush L', icon: () => <div className="w-3 h-3 bg-black" /> },
  
  { id: BrushTip.SLANT_S, name: 'Slant Brush S', icon: () => <div className="w-[1px] h-2 bg-black rotate-45" /> },
  { id: BrushTip.SLANT_M, name: 'Slant Brush M', icon: () => <div className="w-[2px] h-3 bg-black rotate-45" /> },
  { id: BrushTip.SLANT_L, name: 'Slant Brush L', icon: () => <div className="w-[3px] h-4 bg-black rotate-45" /> },
  
  { id: BrushTip.BACKSLANT_S, name: 'Back Brush S', icon: () => <div className="w-[1px] h-2 bg-black -rotate-45" /> },
  { id: BrushTip.BACKSLANT_M, name: 'Back Brush M', icon: () => <div className="w-[2px] h-3 bg-black -rotate-45" /> },
  { id: BrushTip.BACKSLANT_L, name: 'Back Brush L', icon: () => <div className="w-[3px] h-4 bg-black -rotate-45" /> },
];

export const Toolbar: React.FC<ToolbarProps> = ({ 
  currentTool, 
  setTool, 
  onUndo, 
  onMagicClick,
  lineWidth,
  setLineWidth,
  zoomLevel,
  setZoomLevel,
  activeBrushTip,
  setActiveBrushTip,
  lang
}) => {
  
  const showLineWidthSelector = [
    ToolType.PENCIL,
    ToolType.PEN,
    ToolType.ERASER,
    ToolType.LINE,
    ToolType.RECTANGLE,
    ToolType.CIRCLE,
    ToolType.ROUNDED_RECT,
    ToolType.POLYGON
  ].includes(currentTool);

  const showZoomSelector = currentTool === ToolType.MAGNIFIER;
  const showBrushSelector = currentTool === ToolType.BRUSH;

  return (
    <div className="w-[56px] h-full bg-[#ECE9D8] flex flex-col p-1 border-r border-[#808080] shadow-[inset_1px_1px_0px_white]">
      
      <div className="grid grid-cols-2 gap-[1px]">
        <ToolButton 
            active={currentTool === ToolType.SELECT} 
            onClick={() => setTool(ToolType.SELECT)} 
            icon={() => <div className="border border-dashed border-black w-3 h-3 bg-transparent"></div>} 
            label={lang === 'en' ? "Select" : "Sélection"} 
            shortcut="S"
        />
        <ToolButton 
            active={currentTool === ToolType.MAGIC_GEN} 
            onClick={onMagicClick} 
            icon={Icons.Magic} 
            label={lang === 'en' ? "Magic Generator (AI)" : "Générateur Magique (IA)"} 
            shortcut="M"
        />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-[1px]">
        <ToolButton active={currentTool === ToolType.ERASER} onClick={() => setTool(ToolType.ERASER)} icon={Icons.Eraser} label={lang === 'en' ? "Eraser" : "Gomme"} shortcut="E" />
        <ToolButton active={currentTool === ToolType.FILL} onClick={() => setTool(ToolType.FILL)} icon={Icons.Fill} label={lang === 'en' ? "Fill" : "Remplissage"} shortcut="F" />
        <ToolButton active={currentTool === ToolType.PICKER} onClick={() => setTool(ToolType.PICKER)} icon={Icons.Picker} label={lang === 'en' ? "Picker" : "Pipette"} shortcut="I" />
        <ToolButton active={currentTool === ToolType.MAGNIFIER} onClick={() => setTool(ToolType.MAGNIFIER)} icon={() => <div className="w-3 h-3 bg-transparent text-xs flex items-center justify-center font-bold">Z</div>} label={lang === 'en' ? "Zoom" : "Loupe"} shortcut="Z" />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-[1px]">
        <ToolButton active={currentTool === ToolType.PENCIL} onClick={() => setTool(ToolType.PENCIL)} icon={Icons.Pencil} label={lang === 'en' ? "Pencil" : "Crayon"} shortcut="P" />
        <ToolButton active={currentTool === ToolType.PEN} onClick={() => setTool(ToolType.PEN)} icon={Icons.Pen} label={lang === 'en' ? "Pen" : "Plume"} shortcut="N" />
        <ToolButton active={currentTool === ToolType.BRUSH} onClick={() => setTool(ToolType.BRUSH)} icon={Icons.Brush} label={lang === 'en' ? "Brush" : "Pinceau"} shortcut="B" />
        <ToolButton active={currentTool === ToolType.AIRBRUSH} onClick={() => setTool(ToolType.AIRBRUSH)} icon={() => <div className="text-[10px] flex items-center justify-center">💨</div>} label={lang === 'en' ? "Airbrush" : "Aérographe"} shortcut="A" />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-[1px]">
        <ToolButton active={currentTool === ToolType.TEXT} onClick={() => setTool(ToolType.TEXT)} icon={Icons.Text} label={lang === 'en' ? "Text" : "Texte"} shortcut="T" />
        <ToolButton active={currentTool === ToolType.LINE} onClick={() => setTool(ToolType.LINE)} icon={Icons.Line} label={lang === 'en' ? "Line" : "Ligne"} shortcut="L" />
        <ToolButton active={currentTool === ToolType.HAND} onClick={() => setTool(ToolType.HAND)} icon={Icons.Hand} label={lang === 'en' ? "Hand" : "Main"} shortcut="H" />
        <div className="w-6 h-6"></div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-[1px]">
        <ToolButton active={currentTool === ToolType.RECTANGLE} onClick={() => setTool(ToolType.RECTANGLE)} icon={Icons.Rectangle} label={lang === 'en' ? "Rectangle" : "Rectangle"} shortcut="R" />
        <ToolButton active={currentTool === ToolType.POLYGON} onClick={() => setTool(ToolType.POLYGON)} icon={() => (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 12l5 10h10l5-10L12 2z" />
          </svg>
        )} label={lang === 'en' ? "Polygon" : "Polygone"} shortcut="G" />
        <ToolButton active={currentTool === ToolType.CIRCLE} onClick={() => setTool(ToolType.CIRCLE)} icon={Icons.Circle} label={lang === 'en' ? "Ellipse" : "Ellipse"} shortcut="C" />
        <ToolButton active={currentTool === ToolType.ROUNDED_RECT} onClick={() => setTool(ToolType.ROUNDED_RECT)} icon={() => <div className="w-3 h-3 border border-black rounded-sm"></div>} label={lang === 'en' ? "Rounded Rectangle" : "Rectangle arrondi"} />
      </div>

      {/* Options Area */}
      <div className="mt-auto mb-1 flex flex-col items-center w-full">
         <div className="w-[48px] min-h-[140px] border border-gray-500 bg-white flex flex-col shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)] overflow-hidden">
             
             {showBrushSelector && (
               <div className="flex flex-col w-full h-full overflow-y-auto">
                  <div className="text-[8px] font-bold text-gray-500 bg-[#ECE9D8] px-[2px] border-b border-gray-400 text-center uppercase">
                    {lang === 'en' ? 'Brushes' : 'Pinceaux'}
                  </div>
                  {BRUSH_TIPS_CONFIG.map((tip) => (
                    <div 
                      key={tip.id}
                      onClick={() => setActiveBrushTip(tip.id)}
                      className={`w-full flex flex-col items-center justify-center py-1 cursor-default border-b border-gray-100 last:border-0 ${activeBrushTip === tip.id ? 'bg-[#316AC5] text-white' : 'hover:bg-gray-100 text-black'}`}
                    >
                      <div className={`flex items-center justify-center h-4 mb-[1px] ${activeBrushTip === tip.id ? 'brightness-0 invert' : ''}`}>
                         <tip.icon />
                      </div>
                      <div className="text-[7px] leading-tight text-center px-[1px] break-all uppercase font-bold opacity-80">
                        {tip.name.replace('Brush ', '')}
                      </div>
                    </div>
                  ))}
               </div>
             )}

             {showLineWidthSelector && (
               <div className="flex flex-col gap-[2px] w-full px-1 py-1">
                 {LINE_WIDTHS.map((w) => (
                   <div
                     key={w}
                     onClick={() => setLineWidth(w)}
                     className={`w-full h-4 flex items-center justify-center cursor-pointer ${lineWidth === w ? 'bg-[#316AC5]' : 'hover:bg-gray-100'}`}
                   >
                     <div 
                       className={`${lineWidth === w ? 'bg-white' : 'bg-black'}`}
                       style={{ 
                         width: '70%', 
                         height: `${w}px`,
                         maxHeight: '10px'
                       }}
                     />
                   </div>
                 ))}
               </div>
             )}

             {showZoomSelector && (
               <div className="flex flex-col gap-1 w-full px-1 py-1">
                 {ZOOM_LEVELS.map((z) => (
                   <div
                     key={z}
                     onClick={() => setZoomLevel(z)}
                     className={`w-full h-5 flex items-center justify-center cursor-pointer text-[10px] font-bold ${zoomLevel === z ? 'bg-[#316AC5] text-white' : 'hover:bg-gray-100 text-black'}`}
                   >
                     {z}x
                   </div>
                 ))}
               </div>
             )}

             {!showLineWidthSelector && !showZoomSelector && !showBrushSelector && (
               <div className="text-[9px] text-gray-400 text-center px-1 leading-tight flex items-center justify-center h-full italic">
                 ...
               </div>
             )}
         </div>
      </div>
    </div>
  );
};
