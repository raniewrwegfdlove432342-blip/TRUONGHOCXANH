import React from 'react';
import { X, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { PillarItem } from '../types';

interface PillarDetailModalProps {
  pillar: PillarItem | null;
  onClose: () => void;
  onNavigateToGames: () => void;
}

export const PillarDetailModal: React.FC<PillarDetailModalProps> = ({
  pillar,
  onClose,
  onNavigateToGames,
}) => {
  if (!pillar) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {pillar.badge}
          </span>
          <span className="text-xs text-slate-400">• Bí kíp học đường</span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {pillar.title}
        </h3>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          {pillar.content.tagline}
        </p>

        {/* Rules Breakdown */}
        <div className="my-5 space-y-3">
          {pillar.content.rules.map((rule, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {rule.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 italic font-medium text-center mb-5">
          {pillar.content.quote}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToGames();
            }}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <span>Thực Hành Tình Huống Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
