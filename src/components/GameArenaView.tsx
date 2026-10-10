import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  Zap,
  Target,
  Key,
  Clock,
  RotateCw,
  Layers,
  ShieldCheck,
  Search,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MINI_GAMES, SITUATION_STAGES } from '../data/mockData';
import { soundFx } from '../utils/soundEffects';

export const GameArenaView: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // GAME 1: FLIP CARDS (Thám tử lật thẻ)
  const flipPairs = [
    { id: 1, text: 'Pod Chill', matchId: 101, isConcept: true },
    { id: 101, text: 'Tẩm ma túy ADB-BUTINACA gây ảo giác', matchId: 1, isConcept: false },
    { id: 2, text: 'Nước Vui', matchId: 102, isConcept: true },
    { id: 102, text: 'Ketamine + Thuốc lắc gây suy tim', matchId: 2, isConcept: false },
    { id: 3, text: 'Cyberbullying', matchId: 103, isConcept: true },
    { id: 103, text: 'Bắt nạt mạng bôi nhọ nhân phẩm', matchId: 3, isConcept: false },
    { id: 4, text: 'Tổng đài 111', matchId: 104, isConcept: true },
    { id: 104, text: 'Bảo vệ trẻ em miễn cước 24/7', matchId: 4, isConcept: false },
  ];
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  // GAME 2: REFLEX 45S (Vệ binh phản xạ)
  const [reflexScore, setReflexScore] = useState(0);
  const [reflexTime, setReflexTime] = useState(45);
  const [reflexActive, setReflexActive] = useState(false);
  const [currentReflexItem, setCurrentReflexItem] = useState<{
    id: number;
    type: 'good' | 'bad';
    label: string;
    icon: string;
  } | null>(null);

  // GAME 3: SITUATION 5 STAGES (Đấu trí tình huống)
  const [situationStageIdx, setSituationStageIdx] = useState(0);
  const [situationSelectedOpt, setSituationSelectedOpt] = useState<number | null>(null);
  const [situationSubmitted, setSituationSubmitted] = useState(false);
  const [situationScore, setSituationScore] = useState(0);

  // GAME 4: BUBBLE POP (Bắn bong bóng khói độc Pod Chill)
  interface BubbleItem {
    id: number;
    text: string;
    isToxic: boolean;
    x: number;
    y: number;
    speed: number;
    icon: string;
  }
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [bubbleScore, setBubbleScore] = useState(0);
  const [bubbleTime, setBubbleTime] = useState(30);
  const [bubbleActive, setBubbleActive] = useState(false);

  // GAME 5: WORD SEQUENCE (Trận pháp Tứ Bộ Khẩu Quyết Lớp 9)
  const sequenceSteps = [
    { id: 1, label: 'Bước 1', title: 'NÓI "KHÔNG" DỨT KHOÁT', desc: 'Nhìn thẳng vào mắt đối phương, giọng điệu kiên định, không ngập ngừng.' },
    { id: 2, label: 'Bước 2', title: 'NÊU LÝ DO NGẮN GỌN', desc: 'Nêu lý do khách quan: Dị ứng phổi, mẹ làm ngành y tế, hoặc quy định trường học cấm.' },
    { id: 3, label: 'Bước 3', title: 'CHUYỂN HƯỚNG HOẠT ĐỘNG', desc: 'Rủ bạn đi đá bóng, vào thư viện đọc sách hoặc cùng làm bài tập nhóm.' },
    { id: 4, label: 'Bước 4', title: 'RỜI ĐI & BÁO NGƯỜI LỚN', desc: 'Nhanh chóng bước ra khỏi nhóm, hòa vào nơi đông người và thông báo cho thầy cô / 111.' },
  ];
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [sequenceSuccess, setSequenceSuccess] = useState<boolean | null>(null);

  // GAME 6: FAST QUIZ 30S (Đúng hay Sai 30s)
  const fastQuestions = [
    { text: 'Pod dùng 1 lần không chứa Nicotine nên không gây nghiện.', isTrue: false },
    { text: 'Khói thuốc thụ động có thể gây hen suyễn và ung thư phổi cho người xung quanh.', isTrue: true },
    { text: 'Chỉ có bạo lực thể xác mới bị coi là bạo lực học đường.', isTrue: false },
    { text: 'Tổng đài 111 là đường dây nóng bảo vệ trẻ em miễn phí 24/7.', isTrue: true },
    { text: 'Ma túy ngụy trang Nước Vui có thể pha vào nước ngọt để dụ học sinh.', isTrue: true },
    { text: 'Chất Diacetyl trong hương liệu thuốc lá điện tử gây bệnh phổi bỏng ngô (EVALI).', isTrue: true },
    { text: 'Học sinh mang Pod vào trường học chỉ bị nhắc nhở nhẹ mà không bị hạ hạnh kiểm.', isTrue: false },
  ];
  const [fastIdx, setFastIdx] = useState(0);
  const [fastScore, setFastScore] = useState(0);
  const [fastFinished, setFastFinished] = useState(false);

  // GAME 7: WHEEL OF COURAGE (Vòng quay bản lĩnh)
  const wheelMissions = [
    'Tuyên truyền cho 2 bạn cùng lớp về tác hại của Pod Chill',
    'Lưu ngay số Tổng đài 111 vào danh bạ điện thoại cá nhân',
    'Nói lời động viên một người bạn đang bị buồn hoặc cô lập',
    'Tập luyện phản xạ 4 bước Tứ Bộ Khẩu Quyết trước gương',
    'Cam kết giữ gìn lớp học 100% không khói thuốc và chất cấm',
    'Tìm hiểu về một môn thể thao mới để nâng cao thể lực',
  ];
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // GAME 8: SORT HAZARDS (Phân loại Siêu Tốc: An Toàn vs Độc Tố)
  const sortItemsList = [
    { id: 1, name: 'Pod dùng 1 lần vị dưa hấu', isToxic: true, icon: '💨' },
    { id: 2, name: 'Sách giáo khoa Toán 9', isToxic: false, icon: '📚' },
    { id: 3, name: 'Gói bột lạ Crispy Fruit ở cổng trường', isToxic: true, icon: '☠️' },
    { id: 4, name: 'Bình nước cá nhân tự mang từ nhà', isToxic: false, icon: '💧' },
    { id: 5, name: 'Tinh dầu Pod Chill mua trên mạng', isToxic: true, icon: '⚠️' },
    { id: 6, name: 'Quả bóng đá trường học', isToxic: false, icon: '⚽' },
    { id: 7, name: 'Tem giấy in hình hoạt hình ngậm lưỡi', isToxic: true, icon: '☣️' },
    { id: 8, name: 'Huy hiệu Đội Thiếu Niên Tiền Phong', isToxic: false, icon: '⭐' },
  ];
  const [sortItemIdx, setSortItemIdx] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const [sortFinished, setSortFinished] = useState(false);

  // Initialize Flip Card Game
  useEffect(() => {
    if (selectedGameId === 'game-flip') {
      const shuffled = [...flipPairs].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setFlipped([]);
      setMatched([]);
    }
  }, [selectedGameId]);

  const handleFlipCard = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return;
    }
    soundFx.playClick();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];
      if (firstCard.matchId === secondCard.id) {
        soundFx.playCorrect();
        setMatched((prev) => [...prev, firstCard.id, secondCard.id]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          soundFx.playVictory();
          confetti({ particleCount: 150, spread: 80 });
        }
      } else {
        soundFx.playWrong();
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  // Reflex Game Timer
  useEffect(() => {
    let timer: any;
    if (reflexActive && reflexTime > 0) {
      timer = setInterval(() => {
        setReflexTime((t) => t - 1);
      }, 1000);
    } else if (reflexTime === 0 && reflexActive) {
      setReflexActive(false);
      soundFx.playVictory();
      confetti({ particleCount: 180, spread: 90 });
    }
    return () => clearInterval(timer);
  }, [reflexActive, reflexTime]);

  // Reflex Item Spawner
  useEffect(() => {
    let spawnTimer: any;
    if (reflexActive) {
      spawnTimer = setInterval(() => {
        const isGood = Math.random() > 0.45;
        const goods = [
          { label: 'Lá Chắn Tri Thức', icon: '🛡️' },
          { label: 'Sách Vở Học Tập', icon: '📚' },
          { label: 'Thể Thao Khỏe Mạnh', icon: '⚽' },
          { label: 'Tổng Đài 111', icon: '📞' },
        ];
        const bads = [
          { label: 'Pod Chill Độc Hại', icon: '💨' },
          { label: 'Ma Túy Nước Vui', icon: '☠️' },
          { label: 'Bắt Nạt Mạng Xã Hội', icon: '😡' },
          { label: 'Thuốc Lá Nung Nóng', icon: '🚬' },
        ];
        const chosen = isGood
          ? goods[Math.floor(Math.random() * goods.length)]
          : bads[Math.floor(Math.random() * bads.length)];

        setCurrentReflexItem({
          id: Date.now(),
          type: isGood ? 'good' : 'bad',
          label: chosen.label,
          icon: chosen.icon,
        });
      }, 1200);
    }
    return () => clearInterval(spawnTimer);
  }, [reflexActive]);

  const handleReflexClick = (action: 'protect' | 'destroy') => {
    if (!currentReflexItem) return;
    const isCorrect =
      (action === 'protect' && currentReflexItem.type === 'good') ||
      (action === 'destroy' && currentReflexItem.type === 'bad');

    if (isCorrect) {
      soundFx.playCorrect();
      setReflexScore((s) => s + 10);
    } else {
      soundFx.playWrong();
      setReflexScore((s) => Math.max(0, s - 5));
    }
    setCurrentReflexItem(null);
  };

  // BUBBLE POP GAME ENGINE
  useEffect(() => {
    let timer: any;
    let spawn: any;
    if (bubbleActive && bubbleTime > 0) {
      timer = setInterval(() => setBubbleTime((t) => t - 1), 1000);
      spawn = setInterval(() => {
        const toxicPool = [
          { text: 'Khói Pod độc', icon: '💨', isToxic: true },
          { text: 'Nicotine muối', icon: '☠️', isToxic: true },
          { text: 'Cần sa ADB', icon: '⚠️', isToxic: true },
          { text: 'Nước vui', icon: '🧪', isToxic: true },
          { text: 'Bụi Chì & Niken', icon: '⚗️', isToxic: true },
          { text: 'Lá phổi xanh', icon: '🫁', isToxic: false },
          { text: 'Sách vở', icon: '📚', isToxic: false },
        ];
        const chosen = toxicPool[Math.floor(Math.random() * toxicPool.length)];
        const newBubble: BubbleItem = {
          id: Date.now() + Math.random(),
          text: chosen.text,
          icon: chosen.icon,
          isToxic: chosen.isToxic,
          x: Math.floor(Math.random() * 80) + 10,
          y: 85,
          speed: Math.random() * 1.5 + 1,
        };
        setBubbles((prev) => [...prev.slice(-8), newBubble]);
      }, 900);
    } else if (bubbleTime === 0 && bubbleActive) {
      setBubbleActive(false);
      soundFx.playVictory();
      confetti({ particleCount: 150 });
    }
    return () => {
      clearInterval(timer);
      clearInterval(spawn);
    };
  }, [bubbleActive, bubbleTime]);

  const handlePopBubble = (b: BubbleItem) => {
    soundFx.playPop();
    setBubbles((prev) => prev.filter((item) => item.id !== b.id));
    if (b.isToxic) {
      soundFx.playCorrect();
      setBubbleScore((s) => s + 15);
    } else {
      soundFx.playWrong();
      setBubbleScore((s) => Math.max(0, s - 10));
    }
  };

  // Wheel Spin Handler
  const handleSpinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setWheelResult(null);
    soundFx.playClick();
    setTimeout(() => {
      const idx = Math.floor(Math.random() * wheelMissions.length);
      setWheelResult(wheelMissions[idx]);
      setSpinning(false);
      soundFx.playVictory();
      confetti({ particleCount: 120, spread: 70 });
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-blue-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold mb-2 border border-white/20">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
            <span>ĐẤU TRƯỜNG MINI GAME HỌC ĐƯỜNG LỚP 9</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            8 Trò Chơi Bản Lĩnh – Chinh Phục Cám Dỗ
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl leading-relaxed">
            Học tập qua trải nghiệm: Vừa giải trí vừa rèn luyện phản xạ sắc bén, trang bị bản lĩnh vững vàng nói KHÔNG với Pod, Vape, Ma túy và Bạo lực học đường!
          </p>
        </div>

        <button
          onClick={toggleSound}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 border border-white/20 transition"
          title="Bật / Tắt hiệu ứng âm thanh trò chơi"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-300" />
              <span>Âm thanh: BẬT</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-300" />
              <span>Âm thanh: TẮT</span>
            </>
          )}
        </button>
      </div>

      {/* Main Game Screen */}
      {selectedGameId ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-5 animate-in fade-in">
          {/* Back button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                setSelectedGameId(null);
                setReflexActive(false);
                setBubbleActive(false);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
            >
              ← Quay lại danh sách 8 trò chơi
            </button>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {MINI_GAMES.find((g) => g.id === selectedGameId)?.title}
            </span>
          </div>

          {/* GAME 1: FLIP CARDS */}
          {selectedGameId === 'game-flip' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Thám Tử Lật Thẻ: Ghép Đôi Khái Niệm & Sự Thật
                </h3>
                <p className="text-xs text-slate-500">
                  Hãy lật các ô để tìm cặp tương ứng giữa tên cạm bẫy và bản chất khoa học đằng sau!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {cards.map((c, i) => {
                  const isFlipped = flipped.includes(i) || matched.includes(c.id);
                  return (
                    <div
                      key={i}
                      onClick={() => handleFlipCard(i)}
                      className={`h-24 sm:h-28 rounded-2xl p-2.5 flex items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 select-none ${
                        isFlipped
                          ? matched.includes(c.id)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isFlipped ? (
                        <span className="text-xs font-black leading-snug">{c.text}</span>
                      ) : (
                        <span className="text-2xl">❓</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {matched.length === cards.length && cards.length > 0 && (
                <div className="text-center p-4 bg-emerald-50 border border-emerald-300 rounded-2xl animate-in zoom-in-95">
                  <div className="text-2xl mb-1">🎉</div>
                  <h4 className="text-sm font-black text-emerald-900">
                    XUẤT SẮC! BẠN ĐÃ GHÉP ĐÔI TOÀN BỘ BÍ MẬT!
                  </h4>
                  <button
                    onClick={() => {
                      const shuffled = [...flipPairs].sort(() => Math.random() - 0.5);
                      setCards(shuffled);
                      setFlipped([]);
                      setMatched([]);
                    }}
                    className="mt-2.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
                  >
                    Chơi lại ván mới
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME 2: REFLEX 45S */}
          {selectedGameId === 'game-reflex' && (
            <div className="space-y-4 text-center max-w-lg mx-auto">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Vệ Binh Phản Xạ 45s: Bảo Vệ Hay Phá Hủy?
                </h3>
                <p className="text-xs text-slate-500">
                  Vật phẩm xuất hiện: Nếu là [Tốt/Học Đường] hãy bấm BẢO VỆ! Nếu là [Pod/Độc Tố] hãy bấm PHÁ HỦY!
                </p>
              </div>

              <div className="flex items-center justify-around p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-black">
                <span className="text-blue-700">Điểm số: {reflexScore} ⭐</span>
                <span className="text-rose-600">Thời gian: {reflexTime}s ⏱️</span>
              </div>

              {!reflexActive ? (
                <div className="py-8 space-y-3">
                  <div className="text-4xl">🛡️</div>
                  <button
                    onClick={() => {
                      setReflexScore(0);
                      setReflexTime(45);
                      setReflexActive(true);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm shadow-md transition"
                  >
                    Bắt Đầu Thử Thách Phản Xạ 45s
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="h-36 bg-linear-to-b from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4">
                    {currentReflexItem ? (
                      <div className="animate-in zoom-in-90 space-y-2">
                        <span className="text-5xl">{currentReflexItem.icon}</span>
                        <div className="text-sm font-black text-slate-900">
                          {currentReflexItem.label}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">Chuẩn bị...</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleReflexClick('protect')}
                      className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>🛡️ BẢO VỆ</span>
                      <span className="text-[10px] opacity-80">(Đồ lành mạnh)</span>
                    </button>
                    <button
                      onClick={() => handleReflexClick('destroy')}
                      className="py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>💥 PHÁ HỦY</span>
                      <span className="text-[10px] opacity-80">(Pod / Ma túy)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GAME 3: SITUATION 5 STAGES */}
          {selectedGameId === 'game-situation' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  Ải {situationStageIdx + 1} / {SITUATION_STAGES.length}
                </span>
                <span className="text-blue-700">Điểm: {situationScore} điểm</span>
              </div>

              {SITUATION_STAGES[situationStageIdx] && (
                <div className="space-y-3.5">
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {SITUATION_STAGES[situationStageIdx].scenarioTitle}
                  </h3>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed italic">
                    "{SITUATION_STAGES[situationStageIdx].context}"
                  </div>

                  <div className="font-bold text-xs text-slate-800">
                    {SITUATION_STAGES[situationStageIdx].question}
                  </div>

                  <div className="space-y-2">
                    {SITUATION_STAGES[situationStageIdx].options.map((opt, idx) => (
                      <button
                        key={idx}
                        disabled={situationSubmitted}
                        onClick={() => {
                          setSituationSelectedOpt(idx);
                          setSituationSubmitted(true);
                          if (opt.isSafe) {
                            soundFx.playCorrect();
                            setSituationScore((s) => s + 100);
                          } else {
                            soundFx.playWrong();
                          }
                        }}
                        className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition ${
                          situationSubmitted
                            ? opt.isSafe
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-300'
                              : situationSelectedOpt === idx
                              ? 'bg-rose-50 border-rose-500 text-rose-950'
                              : 'bg-white border-slate-200 text-slate-400 opacity-60'
                            : 'bg-white hover:bg-blue-50/50 border-slate-200 hover:border-blue-400 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-black text-blue-600">{opt.label}.</span>
                          <span>{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {situationSubmitted && (
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2 animate-in fade-in">
                      <div className="font-black text-blue-900">
                        {SITUATION_STAGES[situationStageIdx].options[situationSelectedOpt || 0]?.feedback}
                      </div>
                      <button
                        onClick={() => {
                          if (situationStageIdx < SITUATION_STAGES.length - 1) {
                            setSituationStageIdx((i) => i + 1);
                            setSituationSelectedOpt(null);
                            setSituationSubmitted(false);
                          } else {
                            soundFx.playVictory();
                            confetti({ particleCount: 200, spread: 90 });
                            alert(`Chúc mừng em đã hoàn thành cả 5 ải tình huống với ${situationScore + (SITUATION_STAGES[situationStageIdx].options[situationSelectedOpt || 0]?.isSafe ? 100 : 0)} điểm!`);
                            setSituationStageIdx(0);
                            setSituationSelectedOpt(null);
                            setSituationSubmitted(false);
                            setSituationScore(0);
                          }
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs transition"
                      >
                        {situationStageIdx < SITUATION_STAGES.length - 1 ? 'Tiếp tục ải sau ➔' : 'Hoàn thành thử thách 🏆'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GAME 4: BUBBLE POP */}
          {selectedGameId === 'game-bubble' && (
            <div className="space-y-4 max-w-lg mx-auto text-center">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Bắn Bong Bóng Khói Độc Pod Chill
                </h3>
                <p className="text-xs text-slate-500">
                  Chạm nhanh vào các bong bóng khói độc Pod, Nicotine, ADB để tiêu hủy trước khi lan tỏa! Đừng bắn vào sách vở hay lá phổi xanh!
                </p>
              </div>

              <div className="flex items-center justify-around p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-black">
                <span className="text-blue-700">Điểm số: {bubbleScore} ⭐</span>
                <span className="text-rose-600">Thời gian: {bubbleTime}s ⏱️</span>
              </div>

              {!bubbleActive ? (
                <div className="py-8 space-y-3">
                  <div className="text-4xl">🫧</div>
                  <button
                    onClick={() => {
                      setBubbleScore(0);
                      setBubbleTime(30);
                      setBubbles([]);
                      setBubbleActive(true);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm shadow-md transition"
                  >
                    Bắt Đầu Bắn Bong Bóng 30s
                  </button>
                </div>
              ) : (
                <div className="relative h-64 bg-linear-to-b from-sky-100 via-blue-50 to-indigo-100 rounded-3xl border-2 border-blue-300 overflow-hidden select-none">
                  {bubbles.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handlePopBubble(b)}
                      className={`absolute px-3 py-1.5 rounded-full font-black text-xs shadow-md transition-transform active:scale-75 animate-bounce ${
                        b.isToxic
                          ? 'bg-rose-500 hover:bg-rose-600 text-white border-2 border-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-white'
                      }`}
                      style={{ left: `${b.x}%`, top: `${Math.random() * 60 + 15}%` }}
                    >
                      {b.icon} {b.text}
                    </button>
                  ))}
                  <div className="absolute bottom-2 left-0 right-0 text-[10px] text-slate-500 italic">
                    Chạm thật nhanh vào các bong bóng độc màu đỏ!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GAME 5: WORD SEQUENCE (Trận pháp Tứ Bộ Khẩu Quyết) */}
          {selectedGameId === 'game-words' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Trận Pháp Tứ Bộ Khẩu Quyết: Sắp Xếp Trật Tự Bản Lĩnh
                </h3>
                <p className="text-xs text-slate-500">
                  Hãy bấm chọn đúng thứ tự 4 bước vàng khi từ chối lời dụ dỗ hút Pod và ma túy học đường:
                </p>
              </div>

              <div className="space-y-2">
                {[...sequenceSteps]
                  .sort(() => 0.5 - Math.random())
                  .map((step) => {
                    const isSelected = userSequence.includes(step.id);
                    const selectedIdx = userSequence.indexOf(step.id);

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          soundFx.playClick();
                          if (isSelected) {
                            setUserSequence(userSequence.filter((id) => id !== step.id));
                          } else if (userSequence.length < 4) {
                            const nextSeq = [...userSequence, step.id];
                            setUserSequence(nextSeq);
                            if (nextSeq.length === 4) {
                              const isCorrect = nextSeq.every((id, idx) => id === idx + 1);
                              setSequenceSuccess(isCorrect);
                              if (isCorrect) {
                                soundFx.playVictory();
                                confetti({ particleCount: 150 });
                              } else {
                                soundFx.playWrong();
                              }
                            }
                          }
                        }}
                        className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-black text-slate-900">{step.title}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{step.desc}</div>
                        </div>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {selectedIdx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              {sequenceSuccess !== null && (
                <div
                  className={`p-4 rounded-2xl border text-center text-xs font-black space-y-2 ${
                    sequenceSuccess
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <div>
                    {sequenceSuccess
                      ? '🎉 HOÀN TOÀN CHÍNH XÁC! Em đã lĩnh hội trọn vẹn Tứ Bộ Khẩu Quyết của Trường Học Xanh!'
                      : '❌ Chưa đúng thứ tự chuẩn! Thứ tự đúng là: 1. Nói Không dứt khoát -> 2. Nêu lý do ngắn gọn -> 3. Chuyển hướng hoạt động -> 4. Rời đi và báo người lớn.'}
                  </div>
                  <button
                    onClick={() => {
                      setUserSequence([]);
                      setSequenceSuccess(null);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME 6: FAST QUIZ 30S */}
          {selectedGameId === 'game-fast' && (
            <div className="space-y-4 max-w-lg mx-auto text-center">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Đúng Hay Sai Chớp Nhoáng 30s
                </h3>
                <p className="text-xs text-slate-500">
                  Đọc nhanh từng câu và phán đoán ĐÚNG hoặc SAI thật chuẩn xác!
                </p>
              </div>

              {!fastFinished ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-black p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-blue-700">Câu {fastIdx + 1} / {fastQuestions.length}</span>
                    <span className="text-emerald-700">Điểm: {fastScore} ⭐</span>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 font-black text-sm text-slate-900 min-h-24 flex items-center justify-center leading-relaxed">
                    "{fastQuestions[fastIdx]?.text}"
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const correct = fastQuestions[fastIdx]?.isTrue === true;
                        if (correct) {
                          soundFx.playCorrect();
                          setFastScore((s) => s + 10);
                        } else {
                          soundFx.playWrong();
                        }
                        if (fastIdx < fastQuestions.length - 1) {
                          setFastIdx((i) => i + 1);
                        } else {
                          setFastFinished(true);
                          soundFx.playVictory();
                          confetti({ particleCount: 150 });
                        }
                      }}
                      className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md transition"
                    >
                      ✓ ĐÚNG
                    </button>
                    <button
                      onClick={() => {
                        const correct = fastQuestions[fastIdx]?.isTrue === false;
                        if (correct) {
                          soundFx.playCorrect();
                          setFastScore((s) => s + 10);
                        } else {
                          soundFx.playWrong();
                        }
                        if (fastIdx < fastQuestions.length - 1) {
                          setFastIdx((i) => i + 1);
                        } else {
                          setFastFinished(true);
                          soundFx.playVictory();
                          confetti({ particleCount: 150 });
                        }
                      }}
                      className="py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-sm shadow-md transition"
                    >
                      ✕ SAI
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-3xl space-y-3">
                  <div className="text-3xl">🏆</div>
                  <h4 className="text-base font-black text-emerald-950">
                    HOÀN THÀNH VÒNG THI CHỚP NHOÁNG!
                  </h4>
                  <p className="text-xs text-slate-700">
                    Em đạt được <strong>{fastScore} / {fastQuestions.length * 10} điểm</strong>! Phản xạ nhận diện độc tố của em rất sắc sảo!
                  </p>
                  <button
                    onClick={() => {
                      setFastIdx(0);
                      setFastScore(0);
                      setFastFinished(false);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition"
                  >
                    Chơi lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME 7: WHEEL OF COURAGE */}
          {selectedGameId === 'game-wheel' && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Vòng Quay Bản Lĩnh: Nhận Nhiệm Vụ Hôm Nay
                </h3>
                <p className="text-xs text-slate-500">
                  Quay mỗi ngày một hành động đẹp để lan tỏa trường học xanh!
                </p>
              </div>

              <div className="h-44 bg-linear-to-b from-amber-50 to-yellow-100 rounded-3xl border-2 border-dashed border-amber-300 flex items-center justify-center p-4">
                {spinning ? (
                  <RotateCw className="w-12 h-12 text-amber-600 animate-spin" />
                ) : (
                  <div className="text-4xl animate-pulse">🎡</div>
                )}
              </div>

              <button
                disabled={spinning}
                onClick={handleSpinWheel}
                className="w-full py-3.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl text-sm shadow-md transition disabled:opacity-50"
              >
                {spinning ? 'Đang quay...' : 'Quay Nhận Nhiệm Vụ Hôm Nay'}
              </button>

              {wheelResult && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 font-bold animate-in fade-in">
                  ⭐ <strong>Nhiệm vụ của em hôm nay:</strong>
                  <p className="mt-1 text-sm text-slate-900 font-extrabold">{wheelResult}</p>
                </div>
              )}
            </div>
          )}

          {/* GAME 8: SORT HAZARDS (Phân loại An Toàn vs Độc Tố) */}
          {selectedGameId === 'game-sort' && (
            <div className="space-y-4 max-w-lg mx-auto text-center">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Phân Loại Siêu Tốc: Trường Học An Toàn vs Độc Tố
                </h3>
                <p className="text-xs text-slate-500">
                  Đồ vật xuất hiện: Hãy phân loại chính xác vào THÙNG AN TOÀN hoặc THÙNG TIÊU HỦY NGUY HẠI!
                </p>
              </div>

              {!sortFinished ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-black p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-blue-700">Món {sortItemIdx + 1} / {sortItemsList.length}</span>
                    <span className="text-emerald-700">Điểm: {sortScore} ⭐</span>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 min-h-28 flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl">{sortItemsList[sortItemIdx]?.icon}</span>
                    <div className="font-black text-sm text-slate-900">
                      {sortItemsList[sortItemIdx]?.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const isGood = !sortItemsList[sortItemIdx]?.isToxic;
                        if (isGood) {
                          soundFx.playCorrect();
                          setSortScore((s) => s + 10);
                        } else {
                          soundFx.playWrong();
                        }
                        if (sortItemIdx < sortItemsList.length - 1) {
                          setSortItemIdx((i) => i + 1);
                        } else {
                          setSortFinished(true);
                          soundFx.playVictory();
                          confetti({ particleCount: 150 });
                        }
                      }}
                      className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition"
                    >
                      🟢 AN TOÀN HỌC ĐƯỜNG
                    </button>
                    <button
                      onClick={() => {
                        const isToxic = sortItemsList[sortItemIdx]?.isToxic;
                        if (isToxic) {
                          soundFx.playCorrect();
                          setSortScore((s) => s + 10);
                        } else {
                          soundFx.playWrong();
                        }
                        if (sortItemIdx < sortItemsList.length - 1) {
                          setSortItemIdx((i) => i + 1);
                        } else {
                          setSortFinished(true);
                          soundFx.playVictory();
                          confetti({ particleCount: 150 });
                        }
                      }}
                      className="py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition"
                    >
                      🔴 THÙNG NGUY HẠI / CẤM
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-3xl space-y-3">
                  <div className="text-3xl">🎖️</div>
                  <h4 className="text-base font-black text-emerald-950">
                    HOÀN THÀNH PHÂN LOẠI XUẤT SẮC!
                  </h4>
                  <p className="text-xs text-slate-700">
                    Em đạt được <strong>{sortScore} / {sortItemsList.length * 10} điểm</strong>! Mọi độc tố đã được tiêu hủy an toàn!
                  </p>
                  <button
                    onClick={() => {
                      setSortItemIdx(0);
                      setSortScore(0);
                      setSortFinished(false);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition"
                  >
                    Chơi lại
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Grid of 8 Mini Games */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MINI_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {game.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Độ khó: {game.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition">
                  {game.title}
                </h3>
                <div className="text-xs font-bold text-slate-500 mt-0.5">
                  {game.subtitle}
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition flex items-center gap-1">
                  Vào Chơi Ngay <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs">🎮</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
