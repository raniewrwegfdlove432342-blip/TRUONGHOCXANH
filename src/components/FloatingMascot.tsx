import React from 'react';

interface FloatingMascotProps {
  onOpenAi: () => void;
  onOpenReport?: () => void;
}

export const FloatingMascot: React.FC<FloatingMascotProps> = ({ onOpenAi }) => {
  return (
    <aside aria-label="Cố vấn học đường" className="fixed bottom-20 right-3.5 sm:right-5 z-40 flex flex-col items-center pointer-events-auto">
      {/* Mascot Circle Button - Pulsing/Blinking Animation */}
      <button
        onClick={onOpenAi}
        className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 shadow-xl shadow-emerald-700/35 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
        title="Cố Vấn AI Học Đường - Chú Công An Thân Thiện (Nhấn để trò chuyện)"
      >
        {/* Outer animated pulsating waves (nhấp nháy thu hút sự chú ý) */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/50 animate-ping pointer-events-none duration-1000" />
        <span className="absolute -inset-2 rounded-full bg-teal-400/25 animate-pulse pointer-events-none duration-1500" />

        {/* Mascot Face Avatar Container */}
        <div className="w-full h-full rounded-full bg-linear-to-b from-emerald-500 to-green-700 overflow-hidden flex items-center justify-center border-2 border-white shadow-inner relative z-10">
          {/* SVG Police Officer Mascot Avatar */}
          <svg viewBox="0 0 100 100" className="w-full h-full group-hover:scale-105 transition duration-300">
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

        {/* Live Active Pulsing Dot */}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs z-20 animate-pulse" />
      </button>
    </aside>
  );
};
