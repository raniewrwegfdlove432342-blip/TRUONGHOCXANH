import React from 'react';
import { X, Eye, ThumbsUp, Calendar, Shield, Share2, CheckCircle2, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onOpenReport: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onOpenReport,
}) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative rounded-2xl overflow-hidden mb-4 h-48 sm:h-56">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          {article.badge && (
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{article.verifiedBadge || article.badge}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {article.categoryLabel}
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-700">Nguồn: {article.sourceName || 'Báo điện tử chính thống'}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {article.views}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mb-3">
          {article.title}
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {article.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Actionable Tips */}
        {article.tips && article.tips.length > 0 && (
          <div className="mt-5 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-emerald-900 uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Lời Khuyên Dành Cho Học Sinh:</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {article.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Đọc bài gốc tại {article.sourceName || 'Báo mạng'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenReport();
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
            >
              Báo Cáo Nguy Cơ
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
