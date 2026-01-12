
import React from 'react';

// Simplified SVG icons representing XP Paint tools
export const Icons = {
  Pencil: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  Pen: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M7 21L11 17M7 21L3 17M7 21V13M11 17L15 13M11 17V9M3 17L7 13M3 17V9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2L15 8L21 8L17 12L18 18L12 15L6 18L7 12L3 8L9 8L12 2Z" fill="currentColor" />
    </svg>
  ),
  Brush: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M18 12c-1.5-2-4-3-6-3s-4 1-5 4c-1 3 1 6 3 7h5c2-1 4-4 3-8z" />
      <path d="M12 2v7" />
    </svg>
  ),
  Eraser: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z" />
    </svg>
  ),
  Fill: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M19 11l-8-8-9 9 8 8 5-5 9-9z" />
      <path d="M22 22h-9" />
    </svg>
  ),
  Line: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <line x1="2" y1="22" x2="22" y2="2" />
    </svg>
  ),
  Rectangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="3" y="3" width="18" height="18" rx="0" ry="0" />
    </svg>
  ),
  Circle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  Text: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Picker: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M2 22l4.5-4.5" />
      <path d="M8.5 12.5l5 5 8.5-8.5-5-5-8.5 8.5z" />
    </svg>
  ),
  Magic: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M20 6 L9 17l-5-5" />
      <path d="M15 4l-2 2" />
      <path d="M19 8l2-2" />
      <path d="M4 14l2-2" />
      <path d="M2 10l2 2" />
    </svg>
  ),
  Hand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
};
