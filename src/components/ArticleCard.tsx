import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, CheckCircle2, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types';
import { getThemeFallbackImage, getCategoryBadgeStyle, THEME_FALLBACK_IMAGES } from '../utils/articleImageHelper';

interface ArticleCardProps {
  article: NewsArticle;
  onSelectArticle?: (article: NewsArticle) => void;
  showAiBadge?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelectArticle,
  showAiBadge = false,
}) => {
  // Image Fallback Strategy:
  // 1. article.imageUrl (og:image or direct image)
  // 2. Topic illustration fallback (rác thải, năng lượng, cây xanh, nước sạch, etc.)
  // 3. Default beautiful green campus
  const initialImage = article.imageUrl || getThemeFallbackImage(article.category, article.title);
  const [currentImg, setCurrentImg] = useState<string>(initialImage);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const newImg = article.imageUrl || getThemeFallbackImage(article.category, article.title);
    setCurrentImg(newImg);
    setHasError(false);
  }, [article.imageUrl, article.category, article.title]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = getThemeFallbackImage(article.category, article.title);
      if (currentImg !== fallback) {
        setCurrentImg(fallback);
      } else {
        setCurrentImg(THEME_FALLBACK_IMAGES.default);
      }
    } else {
      setCurrentImg(THEME_FALLBACK_IMAGES.default);
    }
  };

  const badgeStyle = getCategoryBadgeStyle(article.category, article.categoryLabel);

  // Validate if sourceUrl is a valid real URL
  const isValidRealUrl = Boolean(
    article.sourceUrl &&
    (article.sourceUrl.startsWith('http://') || article.sourceUrl.startsWith('https://')) &&
    !article.sourceUrl.includes('example.com') &&
    !article.sourceUrl.includes('localhost')
  );

  return (
    <article
      className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* 1. Article Image: Compact student-friendly thumbnail (h-36 sm:h-40) */}
        <div
          onClick={() => onSelectArticle && onSelectArticle(article)}
          className="relative h-36 sm:h-40 w-full rounded-xl overflow-hidden bg-slate-900 mb-3 cursor-pointer shadow-2xs border border-slate-100"
        >
          <img
            src={currentImg}
            alt={article.title}
            loading="lazy"
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay Colored Topic Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[85%]">
            <span
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md border ${badgeStyle.badgeBg} ${badgeStyle.badgeText} ${badgeStyle.badgeBorder} flex items-center gap-1`}
            >
              <span>{badgeStyle.iconEmoji}</span>
              <span>{article.categoryLabel || 'Trường Học Xanh'}</span>
            </span>

            {/* AI Grounded Indicator */}
            {(showAiBadge || article.badge === 'AI Grounding') && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-900/90 text-emerald-200 text-[9px] font-bold shadow-xs backdrop-blur-md flex items-center gap-1 border border-emerald-400/30">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>Google Search AI</span>
              </span>
            )}
          </div>

          {/* Verified Official Badge */}
          {(article.verifiedBadge || article.sourceName) && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[150px]">{article.verifiedBadge || article.sourceName}</span>
            </div>
          )}
        </div>

        {/* 2. Metadata: Source Name & Publication Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 truncate">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate" title={article.sourceName}>
              {article.sourceName || 'Cổng thông tin chính thống'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-medium">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{article.date}</span>
          </div>
        </div>

        {/* 3. Prominent Title */}
        <h3
          onClick={() => onSelectArticle && onSelectArticle(article)}
          className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 cursor-pointer"
          title={article.title}
        >
          {article.title}
        </h3>

        {/* 4. 2-3 Line Engaging Summary */}
        <p
          onClick={() => onSelectArticle && onSelectArticle(article)}
          className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mt-2 cursor-pointer"
        >
          {article.summary}
        </p>
      </div>

      {/* 5. Footer Actions: "Đọc bài gốc" & "Chi tiết" */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* Detail view trigger */}
        {onSelectArticle ? (
          <button
            type="button"
            onClick={() => onSelectArticle(article)}
            className="text-slate-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-xs py-1 transition group/btn"
          >
            <span>Tóm tắt</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 group-hover/btn:text-emerald-600 transition" />
          </button>
        ) : (
          <div />
        )}

        {/* Link directly to original article (target="_blank" rel="noopener noreferrer") */}
        {isValidRealUrl ? (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md active:scale-95 transition"
            title={`Đọc bài gốc tại ${article.sourceName}`}
          >
            <span>Đọc bài gốc</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-100" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
            <span>Nguồn: {article.sourceName || 'Chính thống'}</span>
          </span>
        )}
      </div>
    </article>
  );
};
