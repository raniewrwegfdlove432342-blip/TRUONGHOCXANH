import React, { useState } from 'react';
import { Bot, MessageCircle, AlertTriangle, X, Shield, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface FloatingMascotProps {
  onOpenAi: () => void;
  onOpenReport: () => void;
}

export const FloatingMascot: React.FC<FloatingMascotProps> = ({ onOpenAi, onOpenReport }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end pointer-events-auto">
      {/* Speech bubble popup */}
      {showTooltip && (
        <div className="mb-2 max-w-[210px] bg-white rounded-2xl p-2.5 shadow-xl border border-blue-100 text-xs text-slate-800 relative animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-[10px]"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cố Vấn Học Đường</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Em có thắc mắc về ma túy, bạo lực hay cần giúp đỡ? Chú luôn ở đây!
          </p>
          <div className="mt-2 flex gap-1">
            <button
              onClick={() => {
                setShowTooltip(false);
                onOpenAi();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1 px-1.5 text-[10px] font-bold text-center"
            >
              Tâm sự AI
            </button>
            <button
              onClick={() => {
                setShowTooltip(false);
                onOpenReport();
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-center"
            >
              Báo cáo
            </button>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-2 right-5 w-3 h-3 bg-white border-r border-b border-blue-100 rotate-45" />
        </div>
      )}

      {/* Mascot Circle Button */}
      <button
        onClick={onOpenAi}
        className="group relative w-14 h-14 rounded-full bg-linear-to-b from-blue-600 to-indigo-700 p-0.5 shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        title="Trợ lý AI Học Đường - Chú Công An Thân Thiện"
      >
        {/* Animated pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-blue-400 opacity-40 animate-ping pointer-events-none" />

        {/* Mascot Face Icon Representation */}
        <div className="w-full h-full rounded-full bg-linear-to-b from-emerald-500 to-green-700 overflow-hidden flex items-center justify-center border-2 border-white relative">
          {/* SVG Police Officer Mascot Avatar */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="48" fill="#15803d" />
            {/* Green Uniform Collar & Shoulders */}
            <path d="M 20 100 C 20 75 35 68 50 68 C 65 68 80 75 80 100 Z" fill="#166534" />
            <path d="M 46 68 L 50 82 L 54 68 Z" fill="#eab308" />
            <path d="M 40 70 L 50 85 L 60 70" fill="none" stroke="#ca8a04" strokeWidth="2" />
            {/* Neck */}
            <rect x="44" y="60" width="12" height="12" rx="3" fill="#fed7aa" />
            {/* Face */}
            <ellipse cx="50" cy="46" rx="22" ry="20" fill="#fcd34d" />
            {/* Eyes */}
            <circle cx="43" cy="45" r="3" fill="#1e293b" />
            <circle cx="57" cy="45" r="3" fill="#1e293b" />
            <circle cx="44.2" cy="44" r="1" fill="#ffffff" />
            <circle cx="58.2" cy="44" r="1" fill="#ffffff" />
            {/* Cute Cheeks */}
            <ellipse cx="38" cy="50" rx="3" ry="1.5" fill="#f87171" opacity="0.6" />
            <ellipse cx="62" cy="50" rx="3" ry="1.5" fill="#f87171" opacity="0.6" />
            {/* Friendly Smile */}
            <path d="M 45 52 Q 50 56 55 52" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            {/* Police Cap (Mũ Kê-pi Quân phục xanh) */}
            <path d="M 24 35 Q 50 20 76 35 Q 50 28 24 35 Z" fill="#14532d" />
            <path d="M 26 35 Q 50 12 74 35 Q 50 32 26 35 Z" fill="#15803d" />
            {/* Visor black */}
            <path d="M 25 35 Q 50 40 75 35 L 77 38 Q 50 45 23 38 Z" fill="#0f172a" />
            {/* Cap Badge (Ngôi sao vàng) */}
            <circle cx="50" cy="27" r="5" fill="#eab308" />
            <path d="M 50 23 L 51.5 26 L 54.5 26.5 L 52.2 28.5 L 53 31.5 L 50 29.8 L 47 31.5 L 47.8 28.5 L 45.5 26.5 L 48.5 26 Z" fill="#dc2626" />
          </svg>
        </div>

        {/* Online Indicator */}
        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
      </button>
    </div>
  );
};
