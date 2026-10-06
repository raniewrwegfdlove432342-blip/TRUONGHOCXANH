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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MINI_GAMES, SITUATION_STAGES } from '../data/mockData';

export const GameArenaView: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

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

  // GAME 6: FAST QUIZ 30S (Đúng hay Sai 30s)
  const fastQuestions = [
    { text: 'Pod dùng 1 lần không chứa Nicotine nên không gây nghiện.', isTrue: false },
    { text: 'Khói thuốc thụ động có thể gây hen suyễn và ung thư phổi cho người xung quanh.', isTrue: true },
    { text: 'Chỉ có bạo lực thể xác mới bị coi là bạo lực học đường.', isTrue: false },
    { text: 'Tổng đài 111 là đường dây nóng bảo vệ trẻ em miễn phí 24/7.', isTrue: true },
    { text: 'Ma túy ngụy trang Nước Vui có thể pha vào nước ngọt để dụ học sinh.', isTrue: true },
  ];
  const [fastIdx, setFastIdx] = useState(0);
  const [fastScore, setFastScore] = useState(0);
  const [fastFinished, setFastFinished] = useState(false);

  // GAME 7: WHEEL OF COURAGE (Vòng quay bản lĩnh)
  const wheelMissions = [
    'Tuyên truyền cho 2 bạn cùng lớp về tác hại của Pod Chill',
    'Lưu ngay số Tổng đài 111 vào danh bạ điện thoại',
    'Nói lời động viên một người bạn đang bị buồn hoặc cô lập',
    'Tập luyện phản xạ 4 bước từ chối Tứ Bộ Khẩu Quyết trước gương',
    'Cam kết giữ gìn lớp học 100% không khói thuốc và chất cấm',
    'Tìm hiểu về một môn thể thao mới để nâng cao thể lực',
  ];
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

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
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];
      if (firstCard.matchId === secondCard.id) {
        setMatched((prev) => [...prev, firstCard.id, secondCard.id]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          confetti();
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
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
      confetti();
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
          { label: 'Nước Vui Lạ', icon: '🧪' },
          { label: 'Bạo Lực Bắt Nạt', icon: '🥊' },
          { label: 'Tem Giấy Ảo Giác', icon: '⚠️' },
        ];
        const item = isGood
          ? goods[Math.floor(Math.random() * goods.length)]
          : bads[Math.floor(Math.random() * bads.length)];
        setCurrentReflexItem({
          id: Date.now(),
          type: isGood ? 'good' : 'bad',
          label: item.label,
          icon: item.icon,
        });
      }, 900);
    }
    return () => clearInterval(spawnTimer);
  }, [reflexActive]);

  const handleReflexClick = (type: 'good' | 'bad') => {
    if (type === 'good') {
      setReflexScore((s) => s + 10);
    } else {
      setReflexScore((s) => Math.max(0, s - 15));
    }
    setCurrentReflexItem(null);
  };

  // Spin Wheel action
  const handleSpinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setWheelResult(null);
    setTimeout(() => {
      const chosen = wheelMissions[Math.floor(Math.random() * wheelMissions.length)];
      setWheelResult(chosen);
      setSpinning(false);
      confetti({ particleCount: 80, spread: 60 });
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner (Screenshot 7) */}
      <section className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
              TỔ HỢP 8 TRÒ CHƠI GIÁO DỤC MỚI
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              Đấu Trường Trò Chơi: Vừa Học Vừa Chơi – Tôi Rèn Bản Lĩnh!
            </h2>
          </div>
        </div>
        <p className="text-xs text-blue-100">
          Chơi trực tiếp 8 mini games tương tác rèn luyện bản lĩnh, phản xạ từ chối và ghi nhớ tác hại của ma túy, bạo lực học đường.
        </p>
      </section>

      {/* Selected Game Screen */}
      {selectedGameId ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              onClick={() => setSelectedGameId(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              ➔ Quay lại danh sách 8 Game
            </button>
            <span className="text-xs font-black text-slate-700">
              {MINI_GAMES.find((g) => g.id === selectedGameId)?.title}
            </span>
          </div>

          {/* GAME 1: FLIP CARDS */}
          {selectedGameId === 'game-flip' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-black text-slate-900">
                  Thám Tử Lật Thẻ: Ghép Cặp Khái Niệm & Tác Hại
                </h3>
                <p className="text-xs text-slate-500">
                  Lật mở các cặp thẻ tương ứng giữa Chất độc hại và Tác hại thực tế.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                {cards.map((card, idx) => {
                  const isFlipped = flipped.includes(idx) || matched.includes(card.id);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleFlipCard(idx)}
                      className={`h-24 p-2 rounded-2xl border text-xs font-bold transition flex items-center justify-center text-center ${
                        isFlipped
                          ? card.isConcept
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-transparent border-slate-300'
                      }`}
                    >
                      {isFlipped ? card.text : '❓'}
                    </button>
                  );
                })}
              </div>

              {matched.length === cards.length && cards.length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-900 font-bold text-sm">
                  🎉 Xuất sắc! Bạn đã phá đảo Thám Tử Lật Thẻ thành công!
                </div>
              )}
            </div>
          )}

          {/* GAME 2: REFLEX 45S */}
          {selectedGameId === 'game-reflex' && (
            <div className="space-y-4 text-center max-w-md mx-auto">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Vệ Binh Phản Xạ 45s: Thu Thập Lá Chắn – Né Bẫy Độc
                </h3>
                <p className="text-xs text-slate-500">
                  Bấm thật nhanh vào biểu tượng Tốt (+10đ), né tránh biểu tượng Độc hại (-15đ)!
                </p>
              </div>

              <div className="flex items-center justify-around p-3 bg-slate-50 rounded-2xl font-black text-sm">
                <div>Thời gian: <span className="text-red-600">{reflexTime}s</span></div>
                <div>Điểm số: <span className="text-blue-600">{reflexScore}</span></div>
              </div>

              {!reflexActive ? (
                <button
                  onClick={() => {
                    setReflexScore(0);
                    setReflexTime(45);
                    setReflexActive(true);
                  }}
                  className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-sm shadow-md"
                >
                  Bắt Đầu Chơi Ngay (45s)
                </button>
              ) : (
                <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  {currentReflexItem ? (
                    <button
                      onClick={() => handleReflexClick(currentReflexItem.type)}
                      className={`p-4 rounded-3xl border-2 text-center transition scale-110 active:scale-95 shadow-lg ${
                        currentReflexItem.type === 'good'
                          ? 'bg-emerald-500 text-white border-white animate-pulse'
                          : 'bg-red-500 text-white border-white animate-bounce'
                      }`}
                    >
                      <div className="text-4xl">{currentReflexItem.icon}</div>
                      <div className="text-xs font-black mt-1">{currentReflexItem.label}</div>
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 font-bold">Chuẩn bị phản xạ...</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GAME 3: SITUATION 5 STAGES */}
          {selectedGameId === 'game-situation' && (
            <div className="space-y-4">
              {(() => {
                const stage = SITUATION_STAGES[situationStageIdx];
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                        Ải {stage.id} / 5
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Điểm tích lũy: {situationScore}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-2">
                      {stage.scenarioTitle}
                    </h3>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 mb-4 leading-relaxed italic">
                      "{stage.context}"
                    </div>

                    <div className="space-y-2 mb-4">
                      {stage.options.map((opt, idx) => {
                        const isSelected = situationSelectedOpt === idx;
                        let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                        if (situationSubmitted) {
                          if (opt.isSafe) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                          } else if (isSelected && !opt.isSafe) {
                            btnStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                          } else {
                            btnStyle = 'opacity-40 border-slate-200';
                          }
                        } else if (isSelected) {
                          btnStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-bold';
                        }

                        return (
                          <button
                            key={idx}
                            disabled={situationSubmitted}
                            onClick={() => setSituationSelectedOpt(idx)}
                            className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start gap-2.5 ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {situationSubmitted && situationSelectedOpt !== null && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs mb-4 ${
                          stage.options[situationSelectedOpt].isSafe
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div className="font-bold mb-1">
                          {stage.options[situationSelectedOpt].isSafe ? '✅ Lựa chọn an toàn xuất sắc!' : '⚠️ Nguy hiểm! Cần tránh xa!'}
                        </div>
                        <p>{stage.options[situationSelectedOpt].feedback}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      {!situationSubmitted ? (
                        <button
                          disabled={situationSelectedOpt === null}
                          onClick={() => {
                            setSituationSubmitted(true);
                            if (stage.options[situationSelectedOpt!].isSafe) {
                              setSituationScore((s) => s + 100);
                            }
                          }}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                        >
                          Xác Nhận Quyết Định
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (situationStageIdx < SITUATION_STAGES.length - 1) {
                              setSituationStageIdx((i) => i + 1);
                              setSituationSelectedOpt(null);
                              setSituationSubmitted(false);
                            } else {
                              alert(`Chúc mừng em đã hoàn thành cả 5 ải với ${situationScore + 100} điểm bản lĩnh!`);
                              setSelectedGameId(null);
                            }
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                        >
                          {situationStageIdx < SITUATION_STAGES.length - 1 ? 'Vượt Ải Tiếp Theo ➔' : 'Hoàn Thành Thử Thách'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* GAME 6: FAST QUIZ 30S */}
          {selectedGameId === 'game-fast-quiz' && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Đúng Hay Sai 30s: Đập Tan Ngộ Nhận Về Pod & Ma Túy
                </h3>
                <p className="text-xs text-slate-500">
                  Phán đoán siêu tốc: Khẳng định sau đây là ĐÚNG hay SAI?
                </p>
              </div>

              {!fastFinished ? (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-500">
                    Câu {fastIdx + 1} / {fastQuestions.length} • Điểm: {fastScore}
                  </div>

                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl text-sm font-bold text-slate-900 min-h-[100px] flex items-center justify-center leading-relaxed">
                    "{fastQuestions[fastIdx].text}"
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (fastQuestions[fastIdx].isTrue === true) setFastScore((s) => s + 20);
                        if (fastIdx < fastQuestions.length - 1) setFastIdx((i) => i + 1);
                        else setFastFinished(true);
                      }}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition"
                    >
                      ĐÚNG (Chính xác)
                    </button>
                    <button
                      onClick={() => {
                        if (fastQuestions[fastIdx].isTrue === false) setFastScore((s) => s + 20);
                        if (fastIdx < fastQuestions.length - 1) setFastIdx((i) => i + 1);
                        else setFastFinished(true);
                      }}
                      className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-sm transition"
                    >
                      SAI (Ngộ nhận)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3">
                  <div className="text-lg font-black text-emerald-900">
                    Hoàn Thành! Bạn đạt {fastScore} / 100 Điểm!
                  </div>
                  <button
                    onClick={() => {
                      setFastIdx(0);
                      setFastScore(0);
                      setFastFinished(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Chơi Lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME 7: WHEEL OF COURAGE */}
          {selectedGameId === 'game-wheel' && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Vòng Quay Bản Lĩnh: Nhiệm Vụ Chiến Sĩ Mỗi Ngày
                </h3>
                <p className="text-xs text-slate-500">
                  Quay nhận nhiệm vụ hành động đẹp để bảo vệ môi trường học đường hôm nay!
                </p>
              </div>

              <div className="w-48 h-48 rounded-full border-8 border-amber-400 bg-linear-to-tr from-amber-100 via-white to-amber-200 mx-auto flex items-center justify-center shadow-lg relative">
                <div className="text-5xl">🎯</div>
                {spinning && (
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500 animate-spin" />
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

          {/* Placeholder for other games */}
          {['game-bubble', 'game-words', 'game-sort'].includes(selectedGameId) && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">🚀</div>
              <h3 className="text-base font-bold text-slate-800">
                Mini Game đang cập nhật nội dung màn mới!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Em có thể trải nghiệm ngay các trò chơi: Thám Tử Lật Thẻ, Vệ Binh Phản Xạ 45s, Đấu Trí Tình Huống hoặc Đúng Hay Sai 30s.
              </p>
              <button
                onClick={() => setSelectedGameId('game-situation')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Chơi Đấu Trí Tình Huống Ngay
              </button>
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
