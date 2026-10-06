import React from 'react';
import { Home, BookOpen, CheckSquare, Gamepad2, Video, AlertCircle, Bot } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'knowledge' as ActiveTab, label: 'Kiến thức', icon: BookOpen },
    { id: 'quiz' as ActiveTab, label: 'Trắc nghiệm', icon: CheckSquare },
    { id: 'games' as ActiveTab, label: 'Trò chơi', icon: Gamepad2 },
    { id: 'video' as ActiveTab, label: 'Video', icon: Video },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 safe-area-inset-bottom shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-transparent'
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
