
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ToolType, BrushTip, Point, Layer } from '../types';

export interface PaintCanvasHandle {
  undo: () => void;
  clear: () => void;
  loadDataURL: (dataUrl: string) => void;
  getDataURL: () => string;
  getSelectionDataURL: () => string | null;
  invertColors: () => void;
  hasSelection: () => boolean;
  clearSelection: () => void;
}

interface PaintCanvasProps {
  tool: ToolType;
  brushTip: BrushTip;
  primaryColor: string;
  secondaryColor: string;
  lineWidth: number;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  onColorPick?: (color: string, isPrimary: boolean) => void;
}

const getCoordinates = (event: React.MouseEvent | MouseEvent, canvas: HTMLCanvasElement, zoom: number): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - rect.left) / zoom),
    y: Math.floor((event.clientY - rect.top) / zoom),
  };
};

export const PaintCanvas = forwardRef<PaintCanvasHandle, PaintCanvasProps>(({
  tool,
  brushTip,
  primaryColor,
  secondaryColor,
  lineWidth,
  zoomLevel,
  setZoomLevel,
  width,
  height,
  layers,
  activeLayerId,
  onColorPick
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  
  const polygonPointsRef = useRef<Point[]>([]);
  const [polygonActive, setPolygonActive] = useState(false);
  
  const historyRef = useRef<Array<{ [layerId: string]: string }>>([]);
  const MAX_HISTORY = 20;

  const saveHistory = useCallback(() => {
    const states: { [layerId: string]: string } = {};
    layers.forEach(layer => {
      const canvas = canvasRefs.current[layer.id];
      if (canvas) {
        states[layer.id] = canvas.toDataURL();
      }
    });
    
    if (historyRef.current.length >= MAX_HISTORY) {
        historyRef.current.shift();
    }
    historyRef.current.push(states);
  }, [layers]);

  const undo = useCallback(() => {
    if (historyRef.current.length <= 1) return;
    
    historyRef.current.pop();
    const lastState = historyRef.current[historyRef.current.length - 1];
    
    layers.forEach(layer => {
      const canvas = canvasRefs.current[layer.id];
      const dataUrl = lastState[layer.id];
      if (canvas && dataUrl) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx?.clearRect(0, 0, width, height);
          ctx?.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
      }
    });
  }, [layers, width, height]);

  useImperativeHandle(ref, () => ({
    undo,
    clear: () => {
      const canvas = canvasRefs.current[activeLayerId];
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          if (layers[0].id === activeLayerId) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          saveHistory();
        }
      }
    },
    loadDataURL: (dataUrl: string) => {
      const canvas = canvasRefs.current[activeLayerId];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        saveHistory();
      };
      img.src = dataUrl;
    },
    getDataURL: () => {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width;
      exportCanvas.height = height;
      const exportCtx = exportCanvas.getContext('2d');
      if (exportCtx) {
        layers.forEach(layer => {
          if (layer.visible) {
            const lCanvas = canvasRefs.current[layer.id];
            if (lCanvas) exportCtx.drawImage(lCanvas, 0, 0);
          }
        });
      }
      return exportCanvas.toDataURL('image/png');
    },
    getSelectionDataURL: () => {
      if (!selectionRect || selectionRect.w === 0 || selectionRect.h === 0) return null;
      
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = Math.abs(selectionRect.w);
      exportCanvas.height = Math.abs(selectionRect.h);
      const exportCtx = exportCanvas.getContext('2d');
      
      const srcX = selectionRect.w > 0 ? selectionRect.x : selectionRect.x + selectionRect.w;
      const srcY = selectionRect.h > 0 ? selectionRect.y : selectionRect.y + selectionRect.h;

      if (exportCtx) {
        layers.forEach(layer => {
          if (layer.visible) {
            const lCanvas = canvasRefs.current[layer.id];
            if (lCanvas) {
              exportCtx.drawImage(
                lCanvas, 
                srcX, srcY, exportCanvas.width, exportCanvas.height, 
                0, 0, exportCanvas.width, exportCanvas.height
              );
            }
          }
        });
      }
      return exportCanvas.toDataURL('image/png');
    },
    invertColors: () => {
      const canvas = canvasRefs.current[activeLayerId];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      ctx.putImageData(imageData, 0, 0);
      saveHistory();
    },
    hasSelection: () => !!selectionRect && selectionRect.w !== 0 && selectionRect.h !== 0,
    clearSelection: () => setSelectionRect(null)
  }));

  useEffect(() => {
    if (historyRef.current.length === 0) {
      saveHistory();
    }
  }, [layers, saveHistory]);

  useEffect(() => {
    layers.forEach((layer, idx) => {
      const canvas = canvasRefs.current[layer.id];
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && idx === 0 && !historyRef.current[0]?.[layer.id]) {
           ctx.fillStyle = '#FFFFFF';
           ctx.fillRect(0, 0, width, height);
        }
      }
    });
  }, [layers, width, height]);

  useEffect(() => {
    if (tool !== ToolType.POLYGON) {
      polygonPointsRef.current = [];
      setPolygonActive(false);
      setIsDrawing(false);
    }
    // Clear selection UI when changing tools away from Select
    if (tool !== ToolType.SELECT) {
      // We keep the internal state if needed but for XP it usually resets
    }
  }, [tool]);

  const drawShape = (ctx: CanvasRenderingContext2D, t: ToolType, start: Point, end: Point, color: string, w: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (t) {
      case ToolType.LINE:
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
      case ToolType.RECTANGLE:
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case ToolType.CIRCLE:
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        const cx = Math.min(start.x, end.x) + rx;
        const cy = Math.min(start.y, end.y) + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case ToolType.ROUNDED_RECT:
        const r = 10;
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const rw = Math.abs(end.x - start.x);
        const rh = Math.abs(end.y - start.y);
        ctx.beginPath();
        ctx.roundRect(x, y, rw, rh, r);
        ctx.stroke();
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRefs.current[activeLayerId];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e, canvas, zoomLevel);

    if (tool === ToolType.PICKER) {
      const data = ctx.getImageData(coords.x, coords.y, 1, 1).data;
      const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1).toUpperCase()}`;
      onColorPick?.(hex, e.button === 0);
      return;
    }

    if (tool === ToolType.FILL) {
      floodFill(canvas, coords.x, coords.y, e.button === 0 ? primaryColor : secondaryColor);
      saveHistory();
      return;
    }

    if (tool === ToolType.SELECT) {
      setSelectionRect(null);
      setStartPoint(coords);
      setIsDrawing(true);
      return;
    }

    if (tool === ToolType.POLYGON) {
      if (polygonPointsRef.current.length === 0) {
        setStartPoint(coords);
        setLastPoint(coords);
        setIsDrawing(true);
        setSnapshot(ctx.getImageData(0, 0, width, height));
      } else {
        ctx.putImageData(snapshot!, 0, 0);
        ctx.beginPath();
        const prev = polygonPointsRef.current[polygonPointsRef.current.length - 1];
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.strokeStyle = e.button === 0 ? primaryColor : secondaryColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        
        polygonPointsRef.current.push(coords);
        setSnapshot(ctx.getImageData(0, 0, width, height));
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);
    setLastPoint(coords);
    setSnapshot(ctx.getImageData(0, 0, width, height));

    if (tool === ToolType.PENCIL || tool === ToolType.ERASER || tool === ToolType.PEN || tool === ToolType.BRUSH) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRefs.current[activeLayerId];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e, canvas, zoomLevel);

    if (tool === ToolType.SELECT && isDrawing && startPoint) {
      setSelectionRect({
        x: startPoint.x,
        y: startPoint.y,
        w: coords.x - startPoint.x,
        h: coords.y - startPoint.y
      });
      return;
    }

    if (tool === ToolType.POLYGON && polygonPointsRef.current.length > 0) {
      ctx.putImageData(snapshot!, 0, 0);
      ctx.beginPath();
      const lastVertex = polygonPointsRef.current[polygonPointsRef.current.length - 1];
      ctx.moveTo(lastVertex.x, lastVertex.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = e.buttons === 1 ? primaryColor : (e.buttons === 2 ? secondaryColor : primaryColor);
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      return;
    }

    if (!isDrawing || !startPoint || !lastPoint) return;

    const color = e.buttons === 1 ? primaryColor : secondaryColor;

    if (tool === ToolType.PENCIL || tool === ToolType.ERASER) {
      ctx.strokeStyle = tool === ToolType.ERASER ? '#FFFFFF' : color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setLastPoint(coords);
    } else if (tool === ToolType.BRUSH || tool === ToolType.PEN) {
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === ToolType.PEN ? lineWidth * 2 : lineWidth * 3;
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setLastPoint(coords);
    } else if ([ToolType.LINE, ToolType.RECTANGLE, ToolType.CIRCLE, ToolType.ROUNDED_RECT].includes(tool)) {
      ctx.putImageData(snapshot!, 0, 0);
      drawShape(ctx, tool, startPoint, coords, color, lineWidth);
    } else if (tool === ToolType.POLYGON && polygonPointsRef.current.length === 0) {
      ctx.putImageData(snapshot!, 0, 0);
      drawShape(ctx, ToolType.LINE, startPoint, coords, color, lineWidth);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tool === ToolType.SELECT) {
      setIsDrawing(false);
      return;
    }

    if (tool === ToolType.POLYGON) {
      if (isDrawing && startPoint) {
        const coords = getCoordinates(e, canvasRefs.current[activeLayerId]!, zoomLevel);
        polygonPointsRef.current = [startPoint, coords];
        setIsDrawing(false);
        setPolygonActive(true);
        const ctx = canvasRefs.current[activeLayerId]!.getContext('2d');
        setSnapshot(ctx!.getImageData(0, 0, width, height));
      }
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPoint(null);
    setLastPoint(null);
    setSnapshot(null);
    saveHistory();
  };

  // Helper functions for flood fill
  const floodFill = (canvas: HTMLCanvasElement, x: number, y: number, fillColor: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const targetColor = getPixelColor(data, x, y);
    const fillRGBA = hexToRGBA(fillColor);
    if (colorsMatch(targetColor, fillRGBA)) return;
    const stack: [number, number][] = [[x, y]];
    while (stack.length) {
      const [curX, curY] = stack.pop()!;
      if (colorsMatch(getPixelColor(data, curX, curY), targetColor)) {
        setPixelColor(data, curX, curY, fillRGBA);
        if (curX > 0) stack.push([curX - 1, curY]);
        if (curX < width - 1) stack.push([curX + 1, curY]);
        if (curY > 0) stack.push([curX, curY - 1]);
        if (curY < height - 1) stack.push([curX, curY + 1]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i+1], data[i+2], data[i+3]];
  };

  const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, color: number[]) => {
    const i = (y * width + x) * 4;
    data[i] = color[0]; data[i+1] = color[1]; data[i+2] = color[2]; data[i+3] = color[3];
  };

  const colorsMatch = (a: number[], b: number[]) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  const hexToRGBA = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (tool === ToolType.POLYGON && polygonPointsRef.current.length > 1) {
      const canvas = canvasRefs.current[activeLayerId];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(snapshot!, 0, 0);
      ctx.beginPath();
      const last = polygonPointsRef.current[polygonPointsRef.current.length - 1];
      const first = polygonPointsRef.current[0];
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(first.x, first.y);
      ctx.strokeStyle = e.button === 0 ? primaryColor : secondaryColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      polygonPointsRef.current = [];
      setPolygonActive(false);
      setSnapshot(null);
      saveHistory();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-white shadow-lg cursor-crosshair overflow-hidden border border-black"
      style={{ 
        width: width * zoomLevel, 
        height: height * zoomLevel,
        minWidth: width * zoomLevel,
        minHeight: height * zoomLevel
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {layers.map((layer) => (
        <canvas
          key={layer.id}
          ref={(el) => (canvasRefs.current[layer.id] = el)}
          width={width}
          height={height}
          className={`absolute top-0 left-0 origin-top-left transition-opacity duration-200 ${layer.visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            transform: `scale(${zoomLevel})`,
            zIndex: layers.findIndex(l => l.id === layer.id),
            pointerEvents: layer.id === activeLayerId ? 'auto' : 'none',
            imageRendering: 'pixelated'
          }}
        />
      ))}

      {/* Selection Border Visual Overlay */}
      {selectionRect && (
        <div 
          className="absolute border border-black z-[100] pointer-events-none"
          style={{
            left: (selectionRect.w > 0 ? selectionRect.x : selectionRect.x + selectionRect.w) * zoomLevel,
            top: (selectionRect.h > 0 ? selectionRect.y : selectionRect.y + selectionRect.h) * zoomLevel,
            width: Math.abs(selectionRect.w) * zoomLevel,
            height: Math.abs(selectionRect.h) * zoomLevel,
            borderStyle: 'dashed',
            borderColor: '#000',
            backgroundColor: 'rgba(0, 0, 255, 0.05)'
          }}
        />
      )}
    </div>
  );
});
