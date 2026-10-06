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
} from 'lucide-react';
import { ActiveTab, PillarItem, AmbassadorMessage, SituationStage, NewsArticle } from '../types';
import { PILLARS, INITIAL_AMBASSADORS, SITUATION_STAGES, NEWS_ARTICLES, EDUCATIONAL_VIDEOS } from '../data/mockData';

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
  // Ambassador messages state
  const [ambassadors, setAmbassadors] = useState<AmbassadorMessage[]>(INITIAL_AMBASSADORS);
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
      badge: 'Đại sứ học đường',
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
      {/* 1. Header Hero Pledge Card (Screenshot 1) */}
      <section className="bg-linear-to-br from-blue-50 via-indigo-50/40 to-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-blue-900 uppercase tracking-wider">
                CÙNG NHAU LAN TỎA
              </div>
              <div className="text-xs text-slate-500">
                Đã có <span className="font-bold text-blue-600 text-sm">{pledgeCount.toLocaleString('vi-VN')}+</span> Thầy Cô & Học sinh tham gia
              </div>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>ĐỒNG HÀNH</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Lá Chắn Học Đường',
                  text: 'Hãy cùng tôi tham gia phong trào Trường Học Xanh - Không Ma Túy, Bạo Lực & Thuốc Lá!',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Đã sao chép liên kết trang web để chia sẻ!');
              }
            }}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl transition shadow-xs"
            title="Chia sẻ với bạn bè"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCommitment}
            className="flex-1 py-3 px-4 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Ký Cam Kết An Toàn</span>
          </button>
        </div>
      </section>

      {/* 2. 4 Trụ Cột Bảo Vệ Học Đường (Screenshot 1) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
              4 TRỤ CỘT BẢO VỆ HỌC ĐƯỜNG
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              (Chạm vào từng trụ cột để xem bí kíp an toàn)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PILLARS.map((pillar) => {
            const IconComponent =
              pillar.iconName === 'Heart'
                ? Heart
                : pillar.iconName === 'Users'
                ? Users
                : pillar.iconName === 'Sprout'
                ? Sprout
                : Star;

            return (
              <div
                key={pillar.id}
                onClick={() => onSelectPillar(pillar)}
                className={`p-4 rounded-3xl border ${pillar.borderColorClass} ${pillar.bgColorClass} cursor-pointer transition-all hover:scale-[1.02] active:scale-98 shadow-xs flex flex-col justify-between min-h-[140px]`}
              >
                <div className="w-9 h-9 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-2">
                  <IconComponent className={`w-5 h-5 ${pillar.colorClass}`} />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>
                  <div className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${pillar.colorClass}`}>
                    <span>{pillar.subtitle}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 6 Quick Tiles Navigation (Screenshot 5) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => setActiveTab('knowledge')}
          className="p-3.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-purple-900">KIẾN THỨC</div>
              <div className="text-[10px] text-purple-700">Về ma túy & vape</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className="p-3.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-900">TRẮC NGHIỆM</div>
              <div className="text-[10px] text-rose-700">Thử thách 10 câu</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className="p-3.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-900">TRÒ CHƠI</div>
              <div className="text-[10px] text-amber-700">Đấu trường trí tuệ</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className="p-3.5 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-orange-900">VIDEO</div>
              <div className="text-[10px] text-orange-700">Tuyên truyền VTV</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-orange-600 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-900">TƯ VẤN & AI</div>
              <div className="text-[10px] text-emerald-700">Hỗ trợ tâm lý</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className="p-3.5 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-2xl text-left transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-red-900">BÁO CÁO</div>
              <div className="text-[10px] text-red-700">Ẩn danh 100%</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-red-600 group-hover:translate-x-0.5 transition" />
        </button>
      </section>

      {/* 4. Interactive Situation Challenge: "Đấu Trí Trạng Tí 60s - Bẫy ngọt ngào ở quán trà sữa" (Screenshot 3) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider">
              ĐẤU TRÍ TRẠNG TÍ 60S
            </span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              ⚡ Chơi ngay tại trang chủ
            </span>
          </div>

          <button
            onClick={() => setActiveTab('games')}
            className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1"
          >
            <span>Vào đấu trường 5 ải</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-2">
          {currentStage.scenarioTitle}
        </h3>

        {/* Story box */}
        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed mb-4">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide mb-1 flex items-center gap-1">
            <span>🔥 TÌNH HUỐNG THỰC TẾ TRƯỜNG HỌC:</span>
          </div>
          <p className="italic font-medium">"{currentStage.context}"</p>
          <div className="mt-2 text-xs font-bold text-red-700">
            🎯 {currentStage.question} (Suy nghĩ kỹ trước khi chọn)
          </div>
        </div>

        {/* Options list */}
        <div className="space-y-2 mb-4">
          {currentStage.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let btnClass = 'border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 text-slate-800';

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

      {/* 5. Đường Dây Nóng Khẩn Cấp (Screenshot 2) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-xs sm:text-sm font-extrabold text-blue-950 uppercase tracking-tight">
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

      {/* 6. Cẩm Nang Học Đường Quick Checklist (Screenshot 2) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-rose-600 font-extrabold text-xs sm:text-sm uppercase tracking-tight">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>CẨM NANG HỌC ĐƯỜNG</span>
        </div>

        <div className="space-y-2 text-xs sm:text-sm font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('knowledge')}
            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between"
          >
            <span>➔ Nhận diện Ma Túy Ngụy Trang (Pod Chill, Nước Vui)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between"
          >
            <span>➔ Thử Thách Trắc Nghiệm Đấu Trí Tình Huống</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between"
          >
            <span>➔ Đấu Trường Trò Chơi Học Đường (Vừa học vừa chơi)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between"
          >
            <span>➔ Thư viện Phóng sự & Phim Cảnh Báo (VTV / ANTV)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between text-blue-700"
          >
            <span>➔ Tâm sự bảo mật với Cố Vấn AI Học Đường</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className="w-full text-left p-2 rounded-xl hover:bg-red-50 transition flex items-center justify-between text-red-600 font-black"
          >
            <span>➔ Hộp thư mật tố giác ẩn danh 100%</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </section>

      {/* 7. Chatbot AI Promotion Card (Screenshot 6) */}
      <section className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        {/* Cute Mascot Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-b from-emerald-500 to-green-700 p-1 shadow-lg shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full overflow-hidden bg-green-800 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="#15803d" />
              <path d="M 20 100 C 20 75 35 68 50 68 C 65 68 80 75 80 100 Z" fill="#166534" />
              <ellipse cx="50" cy="46" rx="22" ry="20" fill="#fcd34d" />
              <circle cx="43" cy="45" r="3" fill="#1e293b" />
              <circle cx="57" cy="45" r="3" fill="#1e293b" />
              <path d="M 45 52 Q 50 56 55 52" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <path d="M 24 35 Q 50 20 76 35 Q 50 28 24 35 Z" fill="#14532d" />
              <circle cx="50" cy="27" r="5" fill="#eab308" />
            </svg>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 mb-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            CHATBOT AI - Người bạn luôn bên bạn
          </div>
          <h3 className="text-base font-black text-slate-900">
            Bạn có thắc mắc về ma túy hay bạo lực?
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Mình luôn sẵn sàng giải đáp, cùng bạn luyện kỹ năng từ chối 4 bước!
          </p>
          <button
            onClick={() => setActiveTab('ai')}
            className="mt-3 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mx-auto sm:mx-0 shadow-xs"
          >
            <span>Chat Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 8. 8 Trò Chơi Giáo Dục Mới Banner (Screenshot 7) */}
      <section className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-xs font-bold mb-2">
          <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Tổ Hợp 8 Trò Chơi Giáo Dục Mới</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
          ĐẤU TRƯỜNG TRÒ CHƠI: VỪA HỌC VỪA CHƠI – TÔI RÈN BẢN LĨNH!
        </h3>

        <p className="text-xs text-blue-100 mt-2 leading-relaxed">
          Khám phá 8 mini game hấp dẫn: Thám Tử Lật Thẻ, Vệ Binh Phản Xạ 45s, Đấu Trí Tình Huống, Bắn Phá Bóng Độc, Từ Khóa Bí Mật, Đúng Hay Sai 30s, Vòng Quay Bản Lĩnh và Chiến Dịch Phân Loại.
        </p>

        <button
          onClick={() => setActiveTab('games')}
          className="mt-4 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition"
        >
          <Sparkles className="w-4 h-4 text-blue-900" />
          <span>Vào Chơi Ngay (8 Game)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 9. Tin Tức & Cảnh Báo Nổi Bật (Screenshot 4, 5) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-600 font-black text-sm uppercase">
            <Flame className="w-4 h-4 fill-rose-500" />
            <span>TIN TỨC & CẢNH BÁO MỚI</span>
          </div>
          <button
            onClick={() => setActiveTab('knowledge')}
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Xem tất cả ➔
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {NEWS_ARTICLES.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 cursor-pointer group"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-blue-600">{article.categoryLabel}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                  {article.title}
                </h4>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {article.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Lời Nhắn Gửi Từ Các Đại Sứ Học Đường (Screenshot 1) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-tight">
              Lời nhắn gửi từ các Đại sứ học đường
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Cùng lan tỏa năng lượng tích cực và bảo vệ mái trường
            </p>
          </div>
          <button
            onClick={() => setShowAddMsgModal(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Gửi lời nhắn</span>
          </button>
        </div>

        <div className="space-y-3">
          {ambassadors.map((amb) => (
            <div
              key={amb.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative"
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

              <div className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold text-[10px] mb-2">
                {amb.badge}
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{amb.content}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Add Ambassador Message Modal */}
      {showAddMsgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Gửi Lời Nhắn Đại Sứ Học Đường
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời nhắn gửi của em: <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Hãy cùng nhau giữ gìn sự trong sáng của tuổi học trò, đừng để Pod hủy hoại sức khỏe..."
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
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
