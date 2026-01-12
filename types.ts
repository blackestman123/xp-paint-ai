
export enum ToolType {
  PENCIL = 'PENCIL',
  PEN = 'PEN',
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
  FILL = 'FILL',
  PICKER = 'PICKER',
  MAGNIFIER = 'MAGNIFIER',
  LINE = 'LINE',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  ROUNDED_RECT = 'ROUNDED_RECT',
  POLYGON = 'POLYGON',
  TEXT = 'TEXT',
  SELECT = 'SELECT',
  AIRBRUSH = 'AIRBRUSH',
  MAGIC_GEN = 'MAGIC_GEN',
  HAND = 'HAND'
}

export enum BrushTip {
  ROUND_S = 'ROUND_S',
  ROUND_M = 'ROUND_M',
  ROUND_L = 'ROUND_L',
  SQUARE_S = 'SQUARE_S',
  SQUARE_M = 'SQUARE_M',
  SQUARE_L = 'SQUARE_L',
  SLANT_S = 'SLANT_S',
  SLANT_M = 'SLANT_M',
  SLANT_L = 'SLANT_L',
  BACKSLANT_S = 'BACKSLANT_S',
  BACKSLANT_M = 'BACKSLANT_M',
  BACKSLANT_L = 'BACKSLANT_L'
}

export interface Point {
  x: number;
  y: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface PaintState {
  currentTool: ToolType;
  primaryColor: string;
  secondaryColor: string;
  lineWidth: number;
  isDrawing: boolean;
  startPoint: Point | null;
  canvasSize: { width: number; height: number };
}

export const XP_COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080FF', '#004080', '#8000FF', '#804000',
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF80', '#00FF80', '#80FFFF', '#8080FF', '#FF0080', '#FF8040'
];
