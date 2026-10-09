import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Users,
  Sprout,
  Star,
  Sparkles,
  Share2,
  PhoneCall,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Gamepad2,
  Video as VideoIcon,
  MessageSquare,
  AlertTriangle,
  Play,
  Flame,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  Eye,
  ThumbsUp,
  Clock,
  ExternalLink,
  Film,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { ActiveTab, PillarItem, AmbassadorMessage, SituationStage, NewsArticle } from '../types';
import { PILLARS, INITIAL_AMBASSADORS, SITUATION_STAGES, NEWS_ARTICLES } from '../data/mockData';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  pledgeCount: number;
  onOpenCommitment: () => void;
  onSelectPillar: (pillar: PillarItem) => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  pledgeCount,
  onOpenCommitment,
  onSelectPillar,
  onSelectArticle,
}) => {
  // Ambassador messages state (Real user messages - No fake seeded records)
  const [ambassadors, setAmbassadors] = useState<AmbassadorMessage[]>([]);
  const [showAddMsgModal, setShowAddMsgModal] = useState(false);
  const [newMsgName, setNewMsgName] = useState('');
  const [newMsgGrade, setNewMsgGrade] = useState('');
  const [newMsgText, setNewMsgText] = useState('');

  // Interactive Situation Challenge state right on Home
  const currentStage = SITUATION_STAGES[0]; // Stage 1
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleLikeAmbassador = (id: string) => {
    setAmbassadors((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item))
    );
  };

  const handleAddAmbassadorMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgName.trim() || !newMsgText.trim()) return;

    const newMsg: AmbassadorMessage = {
      id: `amb-${Date.now()}`,
      studentName: newMsgName.trim(),
      grade: newMsgGrade.trim() || 'Học sinh',
      badge: 'Đại sứ Trường Học Xanh',
      content: newMsgText.trim(),
      likes: 1,
      timeAgo: 'Vừa xong',
    };

    setAmbassadors([newMsg, ...ambassadors]);
    setNewMsgName('');
    setNewMsgGrade('');
    setNewMsgText('');
    setShowAddMsgModal(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Distinctive Brand Hero Banner: TRƯỜNG HỌC XANH */}
      <section className="bg-linear-to-br from-emerald-900 via-teal-900 to-emerald-800 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden border border-emerald-700/50">
        <div className="absolute top-0 right-0 translate-x-10 -translate-y-10 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30 mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                MẦM SỐNG KHỎE – TRỌN TUỔI HOA
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                XÂY DỰNG TRƯỜNG HỌC XANH
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Đồng hành: <strong>{pledgeCount.toLocaleString('vi-VN')}+</strong> thành viên</span>
            </div>
          </div>
        </div>

        {/* Action Slogan Callout */}
        <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/15 text-xs text-emerald-100 leading-relaxed italic mb-4">
          "Tâm Sáng – Thân Trong – Trí Kiên: Vững vàng trước cám dỗ Pod & Ma túy, dũng cảm lên tiếng vì môi trường học đường không bạo lực!"
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Trường Học Xanh - Mầm Sống Khỏe, Trọn Tuổi Hoa',
                  text: 'Hãy cùng tôi tham gia phong trào Trường Học Xanh: An toàn, Lành mạnh, Nói không với chất độc hại & Bạo lực!',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Đã sao chép liên kết phong trào để chia sẻ cho bạn bè!');
              }
            }}
            className="p-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-2xl transition shadow-xs"
            title="Chia sẻ với bạn bè"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCommitment}
            className="flex-1 py-3 px-4 bg-linear-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-emerald-950" />
            <span>Ký Cam Kết Đại Sứ Trường Học Xanh</span>
          </button>
        </div>
      </section>

      {/* 2. 4 Trục Phát Triển Độc Bản: TRƯỜNG HỌC XANH */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>4 TRỤ CỘT BẢO VỆ MẦM XANH HỌC ĐƯỜNG</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              (Chạm vào từng trụ cột để xem bí kíp rèn luyện bản lĩnh)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PILLARS.map((pillar) => {
            const IconComponent =
              pillar.iconName === 'Heart'
                ? Heart
                : pillar.iconName === 'Sprout'
                ? Sprout
                : pillar.iconName === 'Shield'
                ? Shield
                : Star;

            return (
              <div
                key={pillar.id}
                onClick={() => onSelectPillar(pillar)}
                className={`p-4 rounded-3xl border ${pillar.borderColorClass} ${pillar.bgColorClass} cursor-pointer transition-all hover:scale-[1.02] active:scale-98 shadow-xs flex flex-col justify-between min-h-[145px]`}
              >
                <div className="w-9 h-9 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-2">
                  <IconComponent className={`w-5 h-5 ${pillar.colorClass}`} />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>
                  <div className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${pillar.colorClass}`}>
                    <span className="truncate">{pillar.subtitle}</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 6 Quick Tiles Navigation */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => setActiveTab('knowledge')}
          className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950">BÁO CHÍ & ATTT</div>
              <div className="text-[10px] text-emerald-700">Nguồn chính thống</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('student-videos')}
          className="p-3.5 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-teal-950">VIDEO HỌC SINH</div>
              <div className="text-[10px] text-teal-700">Góc sáng tạo trẻ</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-700 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className="p-3.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-950">TRẮC NGHIỆM</div>
              <div className="text-[10px] text-amber-700">Thử thách 10 câu</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className="p-3.5 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-700 text-white flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-cyan-950">8 TRÒ CHƠI</div>
              <div className="text-[10px] text-cyan-700">Rèn luyện bản lĩnh</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-700 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950">CỐ VẤN AI</div>
              <div className="text-[10px] text-emerald-700">Luyện từ chối 4 bước</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-800 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className="p-3.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-950">BÁO CÁO</div>
              <div className="text-[10px] text-rose-700">Ẩn danh 100%</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition" />
        </button>
      </section>

      {/* 4. Feature Section: Video Tuyên Truyền Của Học Sinh */}
      <section className="bg-linear-to-r from-teal-900 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-300" />
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              GÓC VIDEO HỌC SINH TẢI LÊN
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('student-videos')}
            className="text-xs font-bold text-emerald-300 hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả video</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-emerald-100 leading-relaxed mb-4">
          Khám phá các tiểu phẩm đóng vai và phóng sự học đường do chính các bạn học sinh dàn dựng và tải lên hệ thống. Tự động lưu trữ trên máy chủ và đồng bộ vào Google Sheet!
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('student-videos')}
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Video Của Em Lên Ngay</span>
          </button>
        </div>
      </section>

      {/* 5. Tiếng Nói Báo Chí & An Ninh Mạng Quốc Gia (Nguồn chính thống có thể click mở ra) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                TIẾNG NÓI BÁO CHÍ & AN NINH MẠNG CHÍNH THỐNG
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Nguồn xác thực từ Báo Nhân Dân, Bộ Công an, Cục An toàn thông tin, Bệnh viện Bạch Mai
            </p>
          </div>
          <button
            onClick={() => setActiveTab('knowledge')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Xem tất cả ➔
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {NEWS_ARTICLES.slice(0, 4).map((art) => (
            <div
              key={art.id}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start justify-between gap-3 group"
            >
              <div
                onClick={() => onSelectArticle(art)}
                className="flex items-start gap-3 cursor-pointer flex-1"
              >
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {art.verifiedBadge || art.sourceName}
                    </span>
                    <span>•</span>
                    <span>{art.date}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                    {art.summary}
                  </p>
                </div>
              </div>

              {/* Direct clickable source link */}
              <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={art.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-slate-200 text-xs font-bold transition flex items-center gap-1"
                  title="Mở bài viết gốc tại trang báo mạng an toàn"
                >
                  <span>Mở bài gốc</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Interactive Situation Challenge: "Đấu Trí Trạng Tí 60s" */}
      <section className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-white text-[11px] font-black uppercase tracking-wider">
              ĐẤU TRÍ TRẠNG TÍ 60S
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              ⚡ Chơi ngay tại trang chủ
            </span>
          </div>

          <button
            onClick={() => setActiveTab('games')}
            className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
          >
            <span>Vào đấu trường 5 ải</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-2">
          {currentStage.scenarioTitle}
        </h3>

        {/* Story box */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed mb-4">
          <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1 flex items-center gap-1">
            <span>🌿 TÌNH HUỐNG THỰC TẾ TRƯỜNG HỌC:</span>
          </div>
          <p className="italic font-medium">"{currentStage.context}"</p>
          <div className="mt-2 text-xs font-bold text-emerald-900">
            🎯 {currentStage.question} (Suy nghĩ kỹ trước khi chọn)
          </div>
        </div>

        {/* Options list */}
        <div className="space-y-2 mb-4">
          {currentStage.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let btnClass = 'border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-slate-800';

            if (hasAnswered) {
              if (opt.isSafe) {
                btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
              } else if (isSelected && !opt.isSafe) {
                btnClass = 'border-red-500 bg-red-50 text-red-900';
              } else {
                btnClass = 'border-slate-200 opacity-50 bg-slate-50 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => {
                  setSelectedOptionIndex(idx);
                  setHasAnswered(true);
                }}
                className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start gap-3 ${btnClass}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    hasAnswered && opt.isSafe
                      ? 'bg-emerald-600 text-white'
                      : hasAnswered && isSelected && !opt.isSafe
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="leading-snug pt-0.5">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback block */}
        {hasAnswered && selectedOptionIndex !== null && (
          <div
            className={`p-4 rounded-2xl border text-xs animate-in fade-in ${
              currentStage.options[selectedOptionIndex].isSafe
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
              {currentStage.options[selectedOptionIndex].isSafe ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Xử lý xuất sắc! +100 Điểm Bản Lĩnh</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Lựa chọn tiềm ẩn nguy hiểm!</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">
              {currentStage.options[selectedOptionIndex].feedback}
            </p>
            <div className="mt-2 pt-2 border-t border-black/10 font-bold flex items-center justify-between">
              <span>Bí kíp: {currentStage.options[selectedOptionIndex].recommendation}</span>
              <button
                onClick={() => {
                  setHasAnswered(false);
                  setSelectedOptionIndex(null);
                }}
                className="underline text-[11px] font-bold"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 7. Đường Dây Nóng Khẩn Cấp */}
      <section className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
            ĐƯỜNG DÂY NÓNG KHẨN CẤP (MIỄN CƯỚC 24/7)
          </h2>
        </div>

        <div className="space-y-2.5">
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-rose-900">
                Tổng đài Quốc Gia 111
              </div>
              <div className="text-xs text-rose-700">
                Bảo vệ trẻ em khỏi bị dụ dỗ, bạo lực & xâm hại
              </div>
            </div>
            <a
              href="tel:111"
              className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>

          <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-sky-950">
                Cảnh sát 113
              </div>
              <div className="text-xs text-sky-700">
                Tố giác tội phạm mua bán, tàng trữ ma túy
              </div>
            </div>
            <a
              href="tel:113"
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 8. Lời Nhắn Gửi Từ Các Đại Sứ Trường Học Xanh */}
      <section className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
              Lời nhắn gửi từ các Đại sứ Trường Học Xanh
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Cùng lan tỏa năng lượng tích cực và bảo vệ mái trường trong lành
            </p>
          </div>
          <button
            onClick={() => setShowAddMsgModal(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Gửi lời nhắn</span>
          </button>
        </div>

        {ambassadors.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Chưa có lời nhắn nào được gửi. Hãy là người đầu tiên lan tỏa thông điệp tích cực!
            </p>
            <button
              onClick={() => setShowAddMsgModal(true)}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              + Viết lời nhắn đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ambassadors.map((amb) => (
              <div
                key={amb.id}
                className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 relative"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {amb.studentName}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      ({amb.grade}{amb.school ? ` - ${amb.school}` : ''})
                    </span>
                  </div>

                  <button
                    onClick={() => handleLikeAmbassador(amb.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-rose-200 text-rose-600 text-xs hover:bg-rose-50 transition"
                    title="Thả tim lời nhắn"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span className="font-bold">{amb.likes}</span>
                  </button>
                </div>

                <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] mb-2">
                  {amb.badge}
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{amb.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Góc Tác Phẩm Sáng Tạo Học Sinh Banner */}
      <section className="bg-linear-to-r from-teal-900 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-[10px] font-black uppercase tracking-wider">
            <Film className="w-3.5 h-3.5 text-amber-300" />
            <span>PHONG TRÀO TUYÊN TRUYỀN HỌC ĐƯỜNG</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            Góc Sáng Tạo Video Clip & Tranh Áp Phích
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Các chi đội và học sinh tham gia sáng tạo video, tiểu phẩm kịch hoặc tranh vẽ cổ động phòng chống ma túy, bạo lực và pod/vape.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('student-videos')}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition shadow-md shrink-0 flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>+ Nộp Tác Phẩm Của Em</span>
        </button>
      </section>

      {/* Add Ambassador Message Modal */}
      {showAddMsgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 border border-emerald-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Gửi Lời Nhắn Đại Sứ Trường Học Xanh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chia sẻ thông điệp khích lệ bạn bè cùng nói KHÔNG với tệ nạn!
            </p>

            <form onSubmit={handleAddAmbassadorMsg} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên của em: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Tuấn Kiệt"
                  value={newMsgName}
                  onChange={(e) => setNewMsgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lớp / Trường:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lớp 9B, THCS Giảng Võ"
                  value={newMsgGrade}
                  onChange={(e) => setNewMsgGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời nhắn gửi của em: <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Hãy cùng nhau giữ gìn sự trong sáng của tuổi học trò, bảo vệ lá phổi xanh..."
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMsgModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  Đăng Lời Nhắn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
