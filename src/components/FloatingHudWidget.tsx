import React, { useState } from 'react';
import { FilterConfig } from '../types';
import { Power, Minimize2, Maximize2, Zap, Move } from 'lucide-react';

interface FloatingHudWidgetProps {
  config: FilterConfig;
  serviceActive: boolean;
  setServiceActive: React.Dispatch<React.SetStateAction<boolean>>;
  lang: 'hi' | 'en';
  matchCount: number;
}

export const FloatingHudWidget: React.FC<FloatingHudWidgetProps> = ({
  config,
  serviceActive,
  setServiceActive,
  lang,
  matchCount,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 120 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x)),
      y: Math.max(70, Math.min(window.innerHeight - 140, e.clientY - dragOffset.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`fixed z-50 select-none shadow-2xl transition-all duration-75 rounded-2xl border ${
        config.amoledMode
          ? 'bg-black border-emerald-500/40 text-emerald-400'
          : 'bg-slate-950/95 backdrop-blur-md border-slate-800 text-slate-100'
      }`}
    >
      {isMinimized ? (
        /* Minimized Floating Bubble */
        <div
          onClick={() => setIsMinimized(false)}
          className="p-2.5 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          title="Click to expand MatchSniper HUD"
        >
          <div className="relative">
            <span
              className={`w-3 h-3 rounded-full block ${
                serviceActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">1ms</span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
      ) : (
        /* Expanded HUD Pill */
        <div className="w-64 p-3 space-y-2.5">
          {/* Top Drag Bar */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-400">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>MatchSniper HUD</span>
            </div>
            <div className="flex items-center gap-1">
              <Move className="w-3 h-3 text-slate-500" />
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:text-white rounded"
                title="Minimize HUD"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Status & Rules */}
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{lang === 'hi' ? 'दूरी नियम:' : 'Rule:'}</span>
              <span className="font-bold text-emerald-300">
                &lt;{config.minDistanceKm} | &gt;{config.maxDistanceKm}km
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{lang === 'hi' ? 'रिस्पॉन्स:' : 'Latency:'}</span>
              <span className="text-emerald-400 font-bold">{config.responseDelayMs}ms Instant</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{lang === 'hi' ? 'क्लिक्स:' : 'Matches:'}</span>
              <span className="text-white font-bold">{matchCount}</span>
            </div>
          </div>

          {/* Quick Power Toggle */}
          <button
            onClick={() => setServiceActive((prev) => !prev)}
            className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors ${
              serviceActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{serviceActive ? 'ACTIVE (RUNNING)' : 'PAUSED (TAP TO START)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
