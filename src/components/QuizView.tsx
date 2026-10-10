import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Printer,
  Sparkles,
  Shuffle,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Swords,
  Users,
  Heart,
  Zap,
  Trophy,
  Flame,
  Clock,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/mockData';
import { QuizQuestion } from '../types';
import { downloadCertificateImage } from '../utils/certificateGenerator';

// Helper: Fisher-Yates shuffle to pick random distinct questions
function getRandomQuestions(count = 10, category?: string): QuizQuestion[] {
  let pool = [...QUIZ_QUESTIONS];
  if (category) {
    const filtered = pool.filter((q) => q.category === category);
    if (filtered.length >= count) pool = filtered;
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export const QuizView: React.FC = () => {
  // Mode selection: 'standard' | 'pvp' | 'team_stages'
  const [quizMode, setQuizMode] = useState<'standard' | 'pvp' | 'team_stages'>('standard');

  // STANDARD MODE STATE
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => getRandomQuestions(10));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // PVP MODE (ĐẤU TRÍ ĐỐI KHÁNG 1VS1)
  const [pvpQuestions, setPvpQuestions] = useState<QuizQuestion[]>(() => getRandomQuestions(15));
  const [pvpIndex, setPvpIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [botHp, setBotHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [pvpTimeLeft, setPvpTimeLeft] = useState(10);
  const [pvpSelected, setPvpSelected] = useState<number | null>(null);
  const [pvpSubmitted, setPvpSubmitted] = useState(false);
  const [pvpBattleLog, setPvpBattleLog] = useState<string>('Trận đấu bắt đầu! Hãy trả lời thật nhanh để tung đòn trí tuệ!');
  const [pvpGameOver, setPvpGameOver] = useState<'win' | 'lose' | null>(null);

  // TEAM STAGES (VƯỢT ẢI ĐỘI NHÓM 4 CHẶNG)
  const stages = [
    { id: 1, title: 'Chặng 1: Cổng Trường Tươi Sáng', topic: 'Nhận diện Pod / Vape ngụy trang', category: 'vape', target: 3 },
    { id: 2, title: 'Chặng 2: Hành Lang Bão Táp', topic: 'Bẻ gãy Bạo lực học đường & Bắt nạt mạng', category: 'violence', target: 3 },
    { id: 3, title: 'Chặng 3: Mê Cung Độc Tố', topic: 'Bóc trần Ma túy Nước Vui & Pod Chill', category: 'drugs', target: 3 },
    { id: 4, title: 'Chặng 4: Đỉnh Cao Chiến Thắng', topic: 'Trùm Cám Dỗ & Đội Trưởng Tiên Phong', category: 'drugs', target: 3 },
  ];
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [stageQuestions, setStageQuestions] = useState<QuizQuestion[]>(() => getRandomQuestions(3, 'vape'));
  const [stageQIdx, setStageQIdx] = useState(0);
  const [stageCorrectCount, setStageCorrectCount] = useState(0);
  const [stageSelected, setStageSelected] = useState<number | null>(null);
  const [stageSubmitted, setStageSubmitted] = useState(false);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  // Timer for PvP Mode
  useEffect(() => {
    if (quizMode !== 'pvp' || pvpGameOver || pvpSubmitted) return;

    if (pvpTimeLeft <= 0) {
      // Time out: player loses 20 HP
      handlePvPAnswer(-1);
      return;
    }

    const timer = setInterval(() => {
      setPvpTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizMode, pvpTimeLeft, pvpGameOver, pvpSubmitted]);

  // PvP Answer Handler
  const handlePvPAnswer = (chosenIdx: number) => {
    if (pvpSubmitted || pvpGameOver) return;
    setPvpSelected(chosenIdx);
    setPvpSubmitted(true);

    const currentPvpQ = pvpQuestions[pvpIndex];
    const isCorrect = chosenIdx === currentPvpQ?.correctIndex;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      const isCritical = nextCombo >= 2;
      const dmg = isCritical ? 35 : 25;
      const nextBotHp = Math.max(0, botHp - dmg);
      setBotHp(nextBotHp);
      setPvpBattleLog(
        isCritical
          ? `🔥 CHÍ MẠNG X${nextCombo}! Em phản đòn chính xác gây ${dmg} Sát thương Bản Lĩnh!`
          : `⚡ CHÍNH XÁC! Em gây ${dmg} Sát thương tri thức lên đối thủ!`
      );

      if (nextBotHp <= 0) {
        setPvpGameOver('win');
        confetti({ particleCount: 200, spread: 100 });
        return;
      }
    } else {
      setCombo(0);
      const nextPlayerHp = Math.max(0, playerHp - 25);
      setPlayerHp(nextPlayerHp);
      setPvpBattleLog(`❌ Tiếc quá! Sai hoặc hết giờ, đối phương đã chớp thời cơ trừ 25 HP của em!`);

      if (nextPlayerHp <= 0) {
        setPvpGameOver('lose');
        return;
      }
    }
  };

  const handleNextPvPRound = () => {
    if (pvpIndex < pvpQuestions.length - 1) {
      setPvpIndex(pvpIndex + 1);
      setPvpSelected(null);
      setPvpSubmitted(false);
      setPvpTimeLeft(10);
    } else {
      setPvpQuestions(getRandomQuestions(15));
      setPvpIndex(0);
      setPvpSelected(null);
      setPvpSubmitted(false);
      setPvpTimeLeft(10);
    }
  };

  const handleResetPvP = () => {
    setPvpQuestions(getRandomQuestions(15));
    setPvpIndex(0);
    setPlayerHp(100);
    setBotHp(100);
    setCombo(0);
    setPvpTimeLeft(10);
    setPvpSelected(null);
    setPvpSubmitted(false);
    setPvpGameOver(null);
    setPvpBattleLog('Trận đấu mới bắt đầu! Hãy thể hiện bản lĩnh học sinh Lớp 9!');
  };

  // Team Stage Handlers
  const handleStageAnswer = (idx: number) => {
    if (stageSubmitted) return;
    setStageSelected(idx);
    setStageSubmitted(true);

    const q = stageQuestions[stageQIdx];
    if (idx === q?.correctIndex) {
      setStageCorrectCount((c) => c + 1);
    }
  };

  const handleNextStageQ = () => {
    if (stageQIdx < stageQuestions.length - 1) {
      setStageQIdx(stageQIdx + 1);
      setStageSelected(null);
      setStageSubmitted(false);
      setHiddenOptions([]);
    } else {
      // Completed current stage
      if (currentStageIdx < stages.length - 1) {
        const nextStage = currentStageIdx + 1;
        setCurrentStageIdx(nextStage);
        setStageQuestions(getRandomQuestions(3, stages[nextStage].category));
        setStageQIdx(0);
        setStageSelected(null);
        setStageSubmitted(false);
        setHiddenOptions([]);
      } else {
        setStageCompleted(true);
        confetti({ particleCount: 220, spread: 90 });
      }
    }
  };

  const handleResetStages = () => {
    setCurrentStageIdx(0);
    setStageQuestions(getRandomQuestions(3, 'vape'));
    setStageQIdx(0);
    setStageCorrectCount(0);
    setStageSelected(null);
    setStageSubmitted(false);
    setStageCompleted(false);
    setFiftyFiftyUsed(false);
    setHiddenOptions([]);
  };

  // Use 50:50 Lifeline
  const handleUseFiftyFifty = () => {
    if (fiftyFiftyUsed || stageSubmitted) return;
    const q = stageQuestions[stageQIdx];
    if (!q) return;
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);
    const toHide = wrongIndices.slice(0, 2);
    setHiddenOptions(toHide);
    setFiftyFiftyUsed(true);
  };

  // STANDARD MODE HANDLERS
  const currentQ = questions[currentQuestionIndex];
  const selectedIdx = selectedAnswers[currentQ?.id];
  const isSubmitted = isAnswerSubmitted[currentQ?.id];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted || !currentQ) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: idx });
  };

  const handleConfirmAnswer = () => {
    if (selectedIdx === undefined || !currentQ) return;
    setIsAnswerSubmitted({ ...isAnswerSubmitted, [currentQ.id]: true });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 160, spread: 90 });
    }
  };

  const handleRestartNewQuiz = () => {
    setQuestions(getRandomQuestions(10));
    setSelectedAnswers({});
    setIsAnswerSubmitted({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  };

  const totalCorrect = questions.filter((q) => selectedAnswers[q.id] === q.correctIndex).length;
  const scorePercent = Math.round((totalCorrect / questions.length) * 100);

  const handleDownloadQuizCertificate = () => {
    const certName = studentName.trim() || 'Học Sinh Trường Học Xanh';
    const ok = downloadCertificateImage({
      title: 'CHỨNG NHẬN CHIẾN SĨ BẢN LĨNH',
      recipientName: certName,
      schoolOrOrg: 'Phong Trào Lá Chắn Học Đường',
      roleLabel: scorePercent >= 80 ? 'Huy Hiệu Vàng Xuất Sắc' : 'Chiến Sĩ Trường Học Xanh',
      citationText: `Đã hoàn thành xuất sắc bài kiểm tra trắc nghiệm 10 câu ngẫu nhiên với kết quả ${totalCorrect}/${questions.length} câu (${scorePercent}%), nắm vững kiến thức nhận diện Ma túy ngụy trang, tác hại Thuốc lá điện tử và Kỹ năng ứng phó Bạo lực học đường.`,
      certificateId: `QUIZ-${Date.now().toString().slice(-6)}`,
      dateStr: new Date().toLocaleDateString('vi-VN'),
      badgeText: 'KẾT QUẢ SÁT HẠCH KIẾN THỨC BẢN LĨNH',
    });

    if (ok) {
      setStatusFeedback('✓ Đã tải ảnh chứng nhận (.PNG) về máy của bạn!');
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  const handleShareQuizResult = async () => {
    setShowSharePanel(true);
    const certName = studentName.trim() || 'Học sinh';
    const shareText = `🎉 Em (${certName}) vừa đạt kết quả ${totalCorrect}/10 (${scorePercent}%) trong cuộc thi Trắc nghiệm Bản Lĩnh "Lá Chắn Học Đường"!\n👉 Cùng thử sức và rèn luyện kiến thức phòng chống Ma túy, Thuốc lá điện tử, Bạo lực học đường tại: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chiến sĩ Bản lĩnh Lá Chắn Học Đường',
          text: shareText,
          url: window.location.origin,
        });
        setStatusFeedback('✓ Đã mở trình chia sẻ trên thiết bị!');
        setTimeout(() => setStatusFeedback(null), 3000);
        return;
      } catch {}
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedSuccess(true);
        setStatusFeedback('✓ Đã sao chép nội dung chia sẻ kết quả vào bộ nhớ tạm!');
        setTimeout(() => setCopiedSuccess(false), 3000);
        setTimeout(() => setStatusFeedback(null), 4000);
      });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 3 Game Modes Switcher */}
      <section className="bg-white rounded-3xl p-3 border border-emerald-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setQuizMode('standard')}
            className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              quizMode === 'standard'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>🏆 Sát Hạch 10 Câu (Chứng Nhận)</span>
          </button>

          <button
            type="button"
            onClick={() => setQuizMode('pvp')}
            className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              quizMode === 'pvp'
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>⚔️ Đấu Trí 1vs1 (Rank Lớp 9)</span>
          </button>

          <button
            type="button"
            onClick={() => setQuizMode('team_stages')}
            className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              quizMode === 'team_stages'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-300" />
            <span>🚀 Vượt Ải Đội Nhóm 4 Chặng</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODE 2: PVP 1VS1 BATTLE ARENA (ĐẤU TRÍ ĐỐI KHÁNG) */}
      {/* ======================================================== */}
      {quizMode === 'pvp' && (
        <div className="space-y-4 animate-in fade-in">
          {/* PvP Header / Health Bars */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 border border-red-500/40 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                  ĐẤU TRƯỜNG ĐỐI KHÁNG THỜI GIAN THỰC
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/60 text-amber-300 text-xs font-black border border-red-500/50">
                <Clock className="w-3.5 h-3.5" />
                <span>Thời gian: {pvpTimeLeft}s</span>
              </div>
            </div>

            {/* Health Bars */}
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Player Side */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-emerald-300">
                  <span>🛡️ Chiến Sĩ Khối 9 (Em)</span>
                  <span>{playerHp} / 100 HP</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/40">
                  <div
                    className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${playerHp}%` }}
                  />
                </div>
              </div>

              {/* Opponent Side */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-rose-300">
                  <span>👹 Trùm Cám Dỗ Học Đường</span>
                  <span>{botHp} / 100 HP</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-rose-500/40">
                  <div
                    className="h-full bg-linear-to-r from-rose-600 to-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${botHp}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Combo Streak & Battle Log */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Combo Chuỗi Đúng: {combo} {combo >= 2 && '🔥 CHÍ MẠNG X' + combo}</span>
              </div>
              <span className="text-slate-300 italic text-[11px]">{pvpBattleLog}</span>
            </div>
          </div>

          {/* PvP Result Screen */}
          {pvpGameOver ? (
            <div className="bg-white rounded-3xl p-6 text-center border-2 border-emerald-200 shadow-xl space-y-4">
              {pvpGameOver === 'win' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    🏆
                  </div>
                  <h3 className="text-xl font-black text-emerald-900">
                    CHIẾN THẮNG TUYỆT ĐỐI!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Em đã xuất sắc hạ gục cám dỗ, bảo vệ vững chắc danh dự và sức khỏe của học sinh Khối 9! Đạt danh hiệu <strong>Cao Thủ Bản Lĩnh Rank Kim Cương</strong>!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    💔
                  </div>
                  <h3 className="text-xl font-black text-rose-900">
                    BẠN ĐÃ BỊ CÁM DỖ ĐÁNH GỤC!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Đừng nản lòng! Hãy ôn lại kiến thức về tác hại Pod/Vape và Tứ Bộ Khẩu Quyết để tái đấu phục thù ngay!
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={handleResetPvP}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md transition"
              >
                ⚔️ Tái Đấu Trận Mới (1vs1)
              </button>
            </div>
          ) : (
            /* Active PvP Question Card */
            pvpQuestions[pvpIndex] && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-200">
                    Vòng đối kháng số {pvpIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Chọn nhanh trước khi hết {pvpTimeLeft}s
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {pvpQuestions[pvpIndex].question}
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {pvpQuestions[pvpIndex].options.map((opt, idx) => {
                    const isSelected = pvpSelected === idx;
                    const isCorrect = idx === pvpQuestions[pvpIndex].correctIndex;
                    let btnClass = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';

                    if (pvpSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-rose-50 border-rose-500 text-rose-950';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={pvpSubmitted}
                        onClick={() => handlePvPAnswer(idx)}
                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition flex items-center justify-between ${btnClass}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs shrink-0 font-bold">
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {pvpSubmitted && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextPvPRound}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5"
                    >
                      <span>Vòng Kế Tiếp</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: TEAM STAGES (VƯỢT ẢI ĐỘI NHÓM 4 CHẶNG) */}
      {/* ======================================================== */}
      {quizMode === 'team_stages' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Stages Overview Ribbon */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-5 border border-blue-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                HÀNH TRÌNH BIỆT ĐỘI LÁ CHẮN XANH - KHỐI 9
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full font-bold">
                Chặng {currentStageIdx + 1} / 4
              </span>
            </div>

            {/* Stages Step Bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {stages.map((st, i) => (
                <div
                  key={st.id}
                  className={`p-2 rounded-xl transition border ${
                    i === currentStageIdx
                      ? 'bg-blue-600 border-cyan-400 font-black shadow-xs'
                      : i < currentStageIdx
                      ? 'bg-emerald-800/80 border-emerald-400 text-emerald-200'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="text-[10px]">Ải {st.id}</div>
                  <div className="truncate font-bold text-[11px]">{st.title.split(':')[1] || st.title}</div>
                </div>
              ))}
            </div>

            {/* Lifelines */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-blue-200 text-[11px]">Trợ giúp đồng đội:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={fiftyFiftyUsed || stageSubmitted}
                  onClick={handleUseFiftyFifty}
                  className={`px-3 py-1 rounded-xl font-bold text-[11px] transition ${
                    fiftyFiftyUsed
                      ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                  }`}
                >
                  💡 Cứu trợ 50:50 {fiftyFiftyUsed && '(Đã dùng)'}
                </button>
              </div>
            </div>
          </div>

          {/* Stage Completion Screen */}
          {stageCompleted ? (
            <div className="bg-white rounded-3xl p-6 text-center border-2 border-indigo-200 shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto text-3xl">
                🚀
              </div>
              <h3 className="text-xl font-black text-indigo-950">
                CHÚC MỪNG BIỆT ĐỘI TOÀN THẮNG 4 CHẶNG!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Em và tập thể đã phá giải thành công cả 4 cạm bẫy từ Cổng trường đến Đỉnh cao chiến thắng! Đạt danh hiệu <strong>Đội Trưởng Bản Lĩnh Tiên Phong Lớp 9</strong>!
              </p>
              <button
                type="button"
                onClick={handleResetStages}
                className="px-6 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-sm shadow-md transition"
              >
                Chinh Phục Lại Hành Trình Mới
              </button>
            </div>
          ) : (
            /* Active Stage Question Card */
            stageQuestions[stageQIdx] && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200">
                    {stages[currentStageIdx].title} (Câu {stageQIdx + 1}/3)
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Chủ đề: {stages[currentStageIdx].topic}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {stageQuestions[stageQIdx].question}
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {stageQuestions[stageQIdx].options.map((opt, idx) => {
                    if (hiddenOptions.includes(idx)) {
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl border border-dashed border-slate-200 text-slate-300 text-xs italic bg-slate-50"
                        >
                          [Đồng đội đã loại bỏ phương án này]
                        </div>
                      );
                    }

                    const isSelected = stageSelected === idx;
                    const isCorrect = idx === stageQuestions[stageQIdx].correctIndex;
                    let btnClass = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';

                    if (stageSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-rose-50 border-rose-500 text-rose-950';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={stageSubmitted}
                        onClick={() => handleStageAnswer(idx)}
                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition flex items-center justify-between ${btnClass}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs shrink-0 font-bold">
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {stageSubmitted && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1">
                    <div className="font-bold text-blue-900">💡 Giải thích từ Cố vấn:</div>
                    <p className="text-slate-600">{stageQuestions[stageQIdx].explanation}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStageQ}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5"
                      >
                        <span>Vượt Câu Kế Tiếp</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: STANDARD 10 QUESTIONS EXAM (CÓ CẤP CHỨNG NHẬN) */}
      {/* ======================================================== */}
      {quizMode === 'standard' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Top Banner */}
          <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden border border-emerald-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-emerald-200 tracking-wider">
                    KIẾN THỨC BẢN LĨNH – TRƯỜNG HỌC XANH
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">
                    Trắc Nghiệm 10 Câu Ngẫu Nhiên
                  </h2>
                </div>
              </div>

              <button
                onClick={handleRestartNewQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-emerald-100 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto border border-white/20"
                title="Đổi bộ 10 câu hỏi ngẫu nhiên khác từ ngân hàng câu hỏi"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-300" />
                <span>Đổi đề 10 câu mới</span>
              </button>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed">
              Mỗi lượt thi được trích ngẫu nhiên <strong>10 câu hỏi độc lập, không lặp lại</strong> từ ngân hàng 52+ câu hỏi gốc chuẩn hóa về: Ma túy ngụy trang, Thuốc lá điện tử, Thuốc lá truyền thống và Bạo lực học đường.
            </p>

            {/* Progress Bar */}
            {!isFinished && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-emerald-100 mb-1.5 font-bold">
                  <span>Câu hỏi {currentQuestionIndex + 1} / {questions.length}</span>
                  <span>Đã đúng: {totalCorrect} câu</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-300 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Quiz Card */}
          {!isFinished && currentQ ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Câu số {currentQuestionIndex + 1} / 10
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    {currentQ.category === 'drugs'
                      ? 'Ma túy ngụy trang'
                      : currentQ.category === 'vape'
                      ? 'Thuốc lá điện tử & Pod'
                      : currentQ.category === 'violence'
                      ? 'Bạo lực học đường'
                      : 'Thuốc lá & Khói thuốc'}
                  </span>
                </div>
              </div>

              {currentQ.dangerAlert && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{currentQ.dangerAlert}</span>
                </div>
              )}

              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {currentQ.question}
              </h3>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let optionStyles = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected && !isCorrect) {
                      optionStyles = 'border-red-500 bg-red-50 text-red-950 font-bold';
                    }
                  } else if (isSelected) {
                    optionStyles = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start gap-3 ${optionStyles}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback box */}
              {isSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    {selectedIdx === currentQ.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác tuyệt đối!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700">Chưa chính xác! Đáp án đúng là {['A', 'B', 'C', 'D'][currentQ.correctIndex]}</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-5">
                    <strong>Giải thích khoa học:</strong> {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {selectedIdx === undefined
                    ? 'Hãy chọn 1 đáp án'
                    : !isSubmitted
                    ? 'Bấm "Xác Nhận" để kiểm tra'
                    : 'Bấm "Câu Tiếp Theo"'}
                </span>

                {!isSubmitted ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedIdx === undefined}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs transition shadow-sm"
                  >
                    Xác Nhận Đáp Án
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{currentQuestionIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả & Nhận Chứng Nhận'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Result & Certificate */}
          {isFinished && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl shadow-inner">
                <Award className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
                  KẾT QUẢ SÁT HẠCH BẢN LĨNH HỌC ĐƯỜNG
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Em đã đạt {totalCorrect} / {questions.length} câu đúng ({scorePercent}%)
                </h3>
              </div>

              {/* Official Certificate Card Preview */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/40 border-2 border-amber-300 shadow-sm text-center relative overflow-hidden space-y-3">
                <div className="text-[10px] uppercase font-black text-amber-900 tracking-widest border-b border-amber-200 pb-2">
                  TRƯỜNG HỌC XANH – LÁ CHẮN HỌC ĐƯỜNG
                </div>

                <div className="text-base font-black text-slate-900 uppercase">
                  CHỨNG NHẬN CHIẾN SĨ BẢN LĨNH
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500">Trao tặng cho:</div>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên để in lên chứng nhận..."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="text-center font-bold text-base text-emerald-950 px-3 py-1.5 rounded-xl border border-amber-300 w-full max-w-xs mx-auto focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic max-w-xs mx-auto">
                  Đã vượt qua kỳ sát hạch 10 câu ngẫu nhiên về Nhận diện Ma túy ngụy trang, Thuốc lá điện tử và Kỹ năng ứng phó Bạo lực học đường với kết quả {scorePercent} điểm!
                </p>

                <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Xếp hạng: {scorePercent >= 80 ? 'Xuất Sắc (Huy Hiệu Vàng)' : 'Chiến Sĩ Bản Lĩnh'}</span>
                  <span>Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {statusFeedback && (
                <div className="p-3 max-w-md mx-auto rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center justify-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusFeedback}</span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={handleDownloadQuizCertificate}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-98"
                  title="Tải ảnh chứng nhận dạng PNG về máy"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>Lưu Chứng Nhận (Ảnh PNG)</span>
                </button>

                <button
                  onClick={handleShareQuizResult}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-98"
                  title="Lan tỏa kết quả và lời kêu gọi đến bạn bè"
                >
                  <Share2 className="w-4 h-4 text-blue-200" />
                  <span>Lan Tỏa Kết Quả</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  In Bản Giấy
                </button>

                <button
                  onClick={handleRestartNewQuiz}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Shuffle className="w-4 h-4" />
                  Làm Đề Mới (10 Câu Khác)
                </button>
              </div>

              {showSharePanel && (
                <div className="max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 text-left animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span>Lan Tỏa Thành Tích & Kêu Gọi Bạn Bè</span>
                    </div>
                    <button
                      onClick={() => setShowSharePanel(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleShareQuizResult}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-600" />
                          <span>Sao chép tin nhắn</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Đăng Facebook</span>
                    </a>

                    <button
                      onClick={() => {
                        handleShareQuizResult();
                        window.open('https://chat.zalo.me/', '_blank');
                      }}
                      className="px-3 py-2 bg-[#0068FF] hover:bg-[#005cd6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Gửi Zalo nhóm</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
