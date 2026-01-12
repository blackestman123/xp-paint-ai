
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ToolType, BrushTip, XP_COLORS, Layer } from './types';
import { Toolbar } from './components/Toolbar';
import { ColorPalette } from './components/ColorPalette';
import { PaintCanvas, PaintCanvasHandle } from './components/PaintCanvas';
import { LayersPanel } from './components/LayersPanel';
import { Clippy } from './components/Clippy';
import { ReferenceWindow } from './components/ReferenceWindow';
import { generateImageFromPrompt } from './services/geminiService';
import { Language, translations } from './services/i18n';

// --- STABLE SUB-COMPONENTS ---

const MenuItem = ({ label, shortcut, onClick, disabled = false, checked = false }: { label: string, shortcut?: string, onClick?: () => void, disabled?: boolean, checked?: boolean }) => (
  <div 
    className={`flex justify-between items-center px-4 py-1 text-[11px] cursor-default whitespace-nowrap ${disabled ? 'text-gray-400' : 'text-black hover:bg-[#bcceeb] font-normal'}`}
    onClick={!disabled ? onClick : undefined}
  >
    <div className="flex items-center gap-2">
      <span className="w-3 text-[10px] text-black">{checked ? '✓' : ''}</span>
      <span className="text-black">{label}</span>
    </div>
    {shortcut && <span className="ml-8 opacity-70 text-black">{shortcut}</span>}
  </div>
);

const Menu = ({ label, children }: { label: string, children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className={`px-2 py-[2px] text-[11px] text-black hover:bg-[#bcceeb] outline-none ${isOpen ? 'bg-[#bcceeb]' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </button>
      {isOpen && (
        <div 
          className="absolute top-full left-0 bg-[#ECE9D8] border border-gray-500 shadow-md py-1 z-[200] min-w-[160px]"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default function App() {
  // --- LANGUAGE STATE ---
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // --- PAINT STATE ---
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.PENCIL);
  const [brushTip, setBrushTip] = useState<BrushTip>(BrushTip.ROUND_M);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // --- LAYERS STATE ---
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'background', name: 'Background', visible: true }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('background');

  // --- UI STATE ---
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showReferenceWindow, setShowReferenceWindow] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isClosingAttempt, setIsClosingAttempt] = useState(false);

  const canvasRef = useRef<PaintCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refUploadRef = useRef<HTMLInputElement>(null);

  // --- ACTIONS ---
  
  const handleMagicClick = useCallback(() => {
    setShowPromptInput(true);
  }, []);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !canvasRef.current) return;
    
    setIsAiLoading(true);
    setShowPromptInput(false);
    
    try {
      const sketchBase64 = canvasRef.current.getDataURL();
      const generatedImage = await generateImageFromPrompt(
        aiPrompt, 
        sketchBase64, 
        referenceImage || undefined,
        !!referenceImage
      );
      
      if (generatedImage) {
        canvasRef.current.loadDataURL(generatedImage);
      }
    } catch (err) {
      console.error("AI Generation failed", err);
      alert("Failed to generate image. Please check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (prev) => setReferenceImage(prev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddLayer = () => {
    const newId = `layer_${Date.now()}`;
    setLayers([...layers, { id: newId, name: `${t.layers} ${layers.length + 1}`, visible: true }]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[newLayers.length - 1].id);
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const renameLayer = (id: string, newName: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, name: newName } : l));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index < 0) return;
    const newLayers = [...layers];
    if (direction === 'up' && index < layers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    } else if (direction === 'down' && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    }
    setLayers(newLayers);
  };

  const handleCloseClick = () => {
    setIsClosingAttempt(true);
  };

  const getCanvasImage = useCallback(() => {
    // If there is a selection, prefer returning the selection's data
    if (canvasRef.current?.hasSelection()) {
      return canvasRef.current.getSelectionDataURL() || canvasRef.current.getDataURL();
    }
    return canvasRef.current?.getDataURL();
  }, []);

  // --- SHORTCUTS SYSTEM ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping) return;

      const key = e.key.toLowerCase();
      
      if (e.ctrlKey) {
        switch (key) {
          case 'z': e.preventDefault(); canvasRef.current?.undo(); break;
          case 'g': e.preventDefault(); handleMagicClick(); break;
          case 'i': e.preventDefault(); canvasRef.current?.invertColors(); break;
          case 'n': if (e.shiftKey) { e.preventDefault(); canvasRef.current?.clear(); } break;
          case 'd': e.preventDefault(); canvasRef.current?.clearSelection(); break;
        }
        return;
      }

      switch (key) {
        case 's': setCurrentTool(ToolType.SELECT); break;
        case 'm': handleMagicClick(); break;
        case 'e': setCurrentTool(ToolType.ERASER); break;
        case 'f': setCurrentTool(ToolType.FILL); break;
        case 'i': setCurrentTool(ToolType.PICKER); break;
        case 'z': setCurrentTool(ToolType.MAGNIFIER); break;
        case 'p': setCurrentTool(ToolType.PENCIL); break;
        case 'n': setCurrentTool(ToolType.PEN); break;
        case 'b': setCurrentTool(ToolType.BRUSH); break;
        case 'a': setCurrentTool(ToolType.AIRBRUSH); break;
        case 't': setCurrentTool(ToolType.TEXT); break;
        case 'l': setCurrentTool(ToolType.LINE); break;
        case 'h': setCurrentTool(ToolType.HAND); break;
        case 'r': setCurrentTool(ToolType.RECTANGLE); break;
        case 'g': setCurrentTool(ToolType.POLYGON); break;
        case 'c': setCurrentTool(ToolType.CIRCLE); break;
        case 'escape': canvasRef.current?.clearSelection(); break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleMagicClick]);

  return (
    <div className="flex items-center justify-center w-full h-full p-4 pointer-events-none">
      <div className="xp-window-shadow w-full max-w-[1200px] h-[90vh] bg-[#ECE9D8] border-2 border-[#0054E3] rounded-t-lg flex flex-col pointer-events-auto overflow-hidden relative">
        
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0054E3] via-[#2585EA] to-[#0054E3] h-[30px] flex items-center justify-between px-2 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center bg-white rounded-sm overflow-hidden">
               <span className="text-[10px]">🎨</span>
            </div>
            <span className="text-white font-bold text-[13px] shadow-sm">{t.untitled} - {t.paint}</span>
          </div>
          <div className="flex gap-[2px]">
            <button className="w-[21px] h-[21px] bg-[#ECE9D8] hover:bg-white border border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center font-bold text-black pb-2">_</button>
            <button className="w-[21px] h-[21px] bg-[#ECE9D8] hover:bg-white border border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center font-bold text-black">□</button>
            <button 
              onClick={handleCloseClick}
              className="w-[21px] h-[21px] bg-[#E06B6B] hover:bg-red-500 border border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center font-bold text-white leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="h-[22px] bg-[#ECE9D8] flex items-center px-1 border-b border-gray-400 shrink-0 select-none">
          <Menu label={t.file}>
            <MenuItem label={t.new} shortcut="Ctrl+N" />
            <MenuItem label={t.open} shortcut="Ctrl+O" />
            <MenuItem label={t.save} shortcut="Ctrl+S" />
            <div className="h-[1px] bg-gray-400 my-1 mx-1" />
            <MenuItem label={t.exit} shortcut="Alt+F4" onClick={handleCloseClick} />
          </Menu>
          <Menu label={t.edit}>
            <MenuItem label={t.undo} shortcut="Ctrl+Z" onClick={() => canvasRef.current?.undo()} />
            <MenuItem label={t.clearImage} shortcut="Ctrl+Shift+N" onClick={() => canvasRef.current?.clear()} />
          </Menu>
          <Menu label={t.view}>
            <MenuItem label={t.layersPanel} checked={showLayersPanel} onClick={() => setShowLayersPanel(!showLayersPanel)} />
            <MenuItem label={t.referenceImage} checked={showReferenceWindow} onClick={() => setShowReferenceWindow(!showReferenceWindow)} />
            <MenuItem label={t.zoom} shortcut="Ctrl+PageUp" />
          </Menu>
          <Menu label={t.image}>
             <MenuItem label={t.invertColors} shortcut="Ctrl+I" onClick={() => canvasRef.current?.invertColors()} />
             <MenuItem label={t.attributes} shortcut="Ctrl+E" />
          </Menu>
          <Menu label={t.magic}>
            <MenuItem label={t.generateFromSketch} shortcut="Ctrl+G" onClick={handleMagicClick} />
            <MenuItem label={t.addReference} onClick={() => refUploadRef.current?.click()} />
          </Menu>
          <Menu label={t.language}>
            <MenuItem label="English" checked={lang === 'en'} onClick={() => setLang('en')} />
            <MenuItem label="Français" checked={lang === 'fr'} onClick={() => setLang('fr')} />
          </Menu>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <Toolbar 
            currentTool={currentTool}
            setTool={setCurrentTool}
            onUndo={() => canvasRef.current?.undo()}
            onMagicClick={handleMagicClick}
            lineWidth={lineWidth}
            setLineWidth={setLineWidth}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            activeBrushTip={brushTip}
            setActiveBrushTip={setBrushTip}
            lang={lang}
          />
          
          <div className="flex-1 bg-[#808080] p-4 overflow-auto flex items-start justify-start relative scrollbar-xp">
             <PaintCanvas 
               ref={canvasRef}
               tool={currentTool}
               brushTip={brushTip}
               primaryColor={primaryColor}
               secondaryColor={secondaryColor}
               lineWidth={lineWidth}
               zoomLevel={zoomLevel}
               setZoomLevel={setZoomLevel}
               width={canvasSize.width}
               height={canvasSize.height}
               layers={layers}
               activeLayerId={activeLayerId}
               onColorPick={(color, isPrimary) => isPrimary ? setPrimaryColor(color) : setSecondaryColor(color)}
             />
          </div>

          {showLayersPanel && (
            <div className="w-[180px] shrink-0 p-1 flex flex-col gap-1 border-l border-gray-400">
              <LayersPanel 
                layers={layers}
                activeLayerId={activeLayerId}
                onSelectLayer={setActiveLayerId}
                onToggleVisibility={toggleLayerVisibility}
                onRenameLayer={renameLayer}
                onAddLayer={handleAddLayer}
                onDeleteLayer={handleDeleteLayer}
                onMoveLayer={moveLayer}
                lang={lang}
              />
            </div>
          )}
        </div>

        {/* Color Palette */}
        <ColorPalette 
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          setPrimaryColor={setPrimaryColor}
          setSecondaryColor={setSecondaryColor}
          lang={lang}
        />

        {/* Status Bar */}
        <div className="h-[22px] bg-[#ECE9D8] border-t border-[#808080] flex items-center px-2 text-[11px] gap-4 select-none shrink-0">
          <div className="flex-1 truncate">
            {isAiLoading ? t.aiDreaming : t.statusHelp}
          </div>
          <div className="w-[100px] border-l border-gray-400 px-2 flex items-center">
             <span>{canvasSize.width} x {canvasSize.height} px</span>
          </div>
          <div className="w-[100px] border-l border-gray-400 px-2 flex items-center">
             <span>{Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>

        {/* Floating AI Prompt Window */}
        {showPromptInput && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[300] backdrop-blur-[1px]">
            <div className="w-[400px] bg-[#ECE9D8] border-2 border-[#0054E3] rounded shadow-2xl flex flex-col">
               <div className="bg-gradient-to-r from-[#0054E3] to-[#2585EA] text-white px-2 py-1 flex justify-between items-center text-xs font-bold">
                 <span>{t.aiGenerator}</span>
                 <button onClick={() => setShowPromptInput(false)} className="bg-[#E06B6B] px-1 rounded-sm text-[10px] border border-white">×</button>
               </div>
               <div className="p-4 flex flex-col gap-3">
                 <label className="text-xs font-bold">{t.whatShouldAI}</label>
                 <textarea 
                   className="w-full h-24 p-2 text-xs border border-gray-500 focus:outline-none focus:border-[#0054E3] resize-none text-black"
                   placeholder={lang === 'en' ? "e.g. A realistic oil painting..." : "ex: Une peinture à l'huile réaliste..."}
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   autoFocus
                 />
                 <div className="flex justify-end gap-2">
                   <button 
                     onClick={() => setShowPromptInput(false)}
                     className="px-4 py-1 bg-white border border-gray-500 text-[11px] hover:bg-gray-100 text-black"
                   >
                     {t.cancel}
                   </button>
                   <button 
                     onClick={handleAiGenerate}
                     disabled={!aiPrompt.trim()}
                     className="px-4 py-1 bg-[#316AC5] text-white border border-gray-600 text-[11px] hover:bg-[#2a5bb0] disabled:opacity-50"
                   >
                     {t.generate}
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Floating Reference Window */}
        {showReferenceWindow && (
          <ReferenceWindow 
            image={referenceImage}
            onClose={() => setShowReferenceWindow(false)}
            onUpload={() => refUploadRef.current?.click()}
            onClear={() => setReferenceImage(null)}
            lang={lang}
          />
        )}

        <input type="file" ref={refUploadRef} className="hidden" accept="image/*" onChange={handleReferenceUpload} />
        
        <Clippy 
          getCanvasImage={getCanvasImage} 
          isClosingAttempt={isClosingAttempt}
          onResetClose={() => setIsClosingAttempt(false)}
          lang={lang}
        />

        {isAiLoading && (
          <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center z-[500] pointer-events-auto text-black">
            <div className="w-16 h-16 border-4 border-[#0054E3] border-t-transparent rounded-full animate-spin mb-4" />
            <div className="bg-[#FFFFE1] border border-black p-3 shadow-lg">
               <p className="text-[12px] font-bold">{t.pleaseWaitAI}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
