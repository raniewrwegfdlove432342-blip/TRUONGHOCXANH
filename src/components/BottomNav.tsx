import React from 'react';
import { Home, BookOpen, CheckSquare, Gamepad2, Video, Film, AlertTriangle } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasVideos?: boolean;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  hasVideos = false,
  isAdmin = false,
}) => {
  const showVideosTab = hasVideos || isAdmin || activeTab === 'student-videos';

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'knowledge' as ActiveTab, label: 'Báo chí & ATTT', icon: BookOpen },
    ...(showVideosTab
      ? [{ id: 'student-videos' as ActiveTab, label: 'Video HS', icon: Film }]
      : [{ id: 'quiz' as ActiveTab, label: 'Trắc nghiệm', icon: CheckSquare }]),
    { id: 'games' as ActiveTab, label: 'Trò chơi', icon: Gamepad2 },
    { id: 'report' as ActiveTab, label: 'Báo cáo', icon: AlertTriangle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 py-1.5 px-2 safe-area-inset-bottom shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isReport = item.id === 'report';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? isReport
                    ? 'text-red-600 font-black scale-105'
                    : 'text-emerald-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive
                    ? isReport
                      ? 'bg-red-100 text-red-600'
                      : 'bg-emerald-100 text-emerald-700'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
