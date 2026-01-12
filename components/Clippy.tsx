
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Language, translations } from '../services/i18n';

type CatState = 'hidden' | 'popping-up' | 'visible' | 'popping-down' | 'thinking';

interface ClippyProps {
  getCanvasImage: () => string | undefined;
  isClosingAttempt: boolean;
  onResetClose: () => void;
  lang: Language;
}

export const Clippy: React.FC<ClippyProps> = ({ getCanvasImage, isClosingAttempt, onResetClose, lang }) => {
  const [state, setState] = useState<CatState>('hidden');
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);

  const t = translations[lang];

  const roastArt = useCallback(async () => {
    const imageData = getCanvasImage();
    if (!imageData) return;

    setIsRoasting(true);
    setState('thinking');
    setMessage(t.thinking);
    setShowBubble(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imageData.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/png', data: base64Data } },
              { text: t.clippyPrompt + " If the image looks like a specific object, roast my attempt at drawing that object. If it is just a small crop, roast that specific detail." }
            ]
          }
        ],
        config: {
            systemInstruction: t.clippySystem
        }
      });

      setMessage(response.text || (lang === 'en' ? "I've seen better art on a Blue Screen of Death." : "J'ai vu de l'art plus beau sur un écran bleu de la mort."));
    } catch (error) {
      setMessage(lang === 'en' ? "My brain just crashed. Art failure." : "Mon cerveau vient de planter. Échec artistique.");
    } finally {
      setIsRoasting(false);
      setState('visible');
    }
  }, [getCanvasImage, t, lang]);

  useEffect(() => {
    if (isClosingAttempt) {
      setState('popping-up');
      const messages = t.catClose;
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShowBubble(true);
      
      const timer = setTimeout(() => {
        onResetClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isClosingAttempt, onResetClose, t]);

  useEffect(() => {
    const triggerVisit = () => {
      if (state !== 'hidden') return;
      const starters = t.catStarters;
      setMessage(starters[Math.floor(Math.random() * starters.length)]);
      setState('popping-up');
    };

    const initialTimer = window.setTimeout(triggerVisit, 10000);
    const interval = window.setInterval(triggerVisit, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [state, t]);

  useEffect(() => {
    if (state === 'popping-up') {
      const tim = window.setTimeout(() => {
        setState('visible');
        setShowBubble(true);
      }, 600);
      return () => clearTimeout(tim);
    }
    if (state === 'visible' && !isRoasting && !isClosingAttempt) {
      const tim = window.setTimeout(() => {
        setShowBubble(false);
        const t2 = window.setTimeout(() => setState('popping-down'), 500);
        return () => clearTimeout(t2);
      }, 10000);
      return () => clearTimeout(tim);
    }
    if (state === 'popping-down') {
      const tim = window.setTimeout(() => setState('hidden'), 600);
      return () => clearTimeout(tim);
    }
  }, [state, isRoasting, isClosingAttempt]);

  if (state === 'hidden') return null;

  return (
    <div 
      className={`fixed right-8 z-[600] flex flex-col items-center pointer-events-none select-none transition-all duration-500 ease-out ${
        state === 'hidden' || state === 'popping-down' ? '-bottom-48' : 'bottom-0'
      }`}
    >
      <div className={`mb-2 bg-[#FFFFE1] border border-black p-3 rounded-lg shadow-lg max-w-[220px] relative pointer-events-auto transition-all duration-300 ${
        showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        <p className="text-[12px] text-black leading-tight font-sans font-bold mb-2">
          {message}
        </p>
        
        {!isRoasting && !isClosingAttempt && (
          <button 
            onClick={roastArt}
            className="w-full text-[10px] bg-[#316AC5] text-white px-2 py-1 border border-black hover:bg-[#2a5bb0] active:translate-y-[1px]"
          >
            {t.roastMe}
          </button>
        )}

        {isRoasting && (
          <div className="flex gap-1 justify-center">
            <div className="w-1 h-1 bg-black animate-bounce" />
            <div className="w-1 h-1 bg-black animate-bounce [animation-delay:0.2s]" />
            <div className="w-1 h-1 bg-black animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div className="absolute -bottom-2 right-12 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black"></div>
        <div className="absolute -bottom-[6px] right-12 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#FFFFE1]"></div>
      </div>

      <div className={`relative group pointer-events-auto cursor-pointer ${state === 'thinking' ? 'animate-think' : 'animate-idle'}`} onClick={() => !isRoasting && setShowBubble(!showBubble)}>
        <div className="w-32 h-32">
          <svg viewBox="0 0 24 24" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="2" y="16" width="20" height="8" fill="#1a1a1a" />
            <path d="M7 16 L12 21 L17 16 Z" fill="#ffffff" /> 
            <path d="M11 19 L13 19 L12 23 Z" fill="#b91c1c" />
            <rect x="6" y="5" width="12" height="12" fill="#FF8C00" />
            <path d="M6 5 L6 1 L10 5 Z" fill="#FF8C00" />
            <path d="M18 5 L18 1 L14 5 Z" fill="#FF8C00" />
            
            {state === 'thinking' ? (
                <>
                  <rect x="8" y="8" width="2" height="4" fill="#000" className="animate-pulse" />
                  <rect x="14" y="8" width="2" height="4" fill="#000" className="animate-pulse" />
                </>
            ) : (
                <>
                  <rect x="8" y="9" width="2" height="2" fill="#000" />
                  <rect x="14" y="9" width="2" height="2" fill="#000" />
                  <rect x="8" y="9" width="1" height="1" fill="#fff" />
                  <rect x="14" y="9" width="1" height="1" fill="#fff" />
                </>
            )}

            <rect x="11" y="12" width="2" height="1" fill="#FFB6C1" />
            <rect x="9" y="5" width="1" height="2" fill="#CC5500" />
            <rect x="12" y="5" width="1" height="2" fill="#CC5500" />
          </svg>
        </div>
      </div>
      
      <style>{`
        @keyframes idle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes think-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px) rotate(-1deg); }
          75% { transform: translateX(2px) rotate(1deg); }
        }
        .animate-idle { animation: idle-bob 2.5s ease-in-out infinite; }
        .animate-think { animation: think-shake 0.2s linear infinite; }
      `}</style>
    </div>
  );
};
