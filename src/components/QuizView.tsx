import React, { useState } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/mockData';
import { QuizQuestion } from '../types';

// Helper: Fisher-Yates shuffle to pick 10 random distinct questions without replacement
function getRandom10Questions(): QuizQuestion[] {
  const pool = [...QUIZ_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 10);
}

export const QuizView: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => getRandom10Questions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [studentName, setStudentName] = useState('');

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
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestartNewQuiz = () => {
    const new10 = getRandom10Questions();
    setQuestions(new10);
    setSelectedAnswers({});
    setIsAnswerSubmitted({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  };

  // Calculate score
  const totalCorrect = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((totalCorrect / questions.length) * 100);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <section className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden border border-emerald-700/50">
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
                className="h-full bg-linear-to-r from-amber-400 to-emerald-300 transition-all duration-300 rounded-full"
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
                  : currentQ.category === 'tobacco'
                  ? 'Thuốc lá & Khói thuốc'
                  : 'Phòng chống Bạo lực học đường'}
              </span>
            </div>

            {currentQ.dangerAlert && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{currentQ.dangerAlert}</span>
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              let style =
                'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 bg-white text-slate-800';

              if (isSubmitted) {
                if (idx === currentQ.correctIndex) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-300/40';
                } else if (isSelected && idx !== currentQ.correctIndex) {
                  style = 'border-rose-500 bg-rose-50 text-rose-900';
                } else {
                  style = 'border-slate-200 opacity-50 bg-slate-50 text-slate-500';
                }
              } else if (isSelected) {
                style = 'border-emerald-700 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-400/30';
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start gap-3 ${style}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSubmitted && idx === currentQ.correctIndex
                        ? 'bg-emerald-600 text-white'
                        : isSubmitted && isSelected && idx !== currentQ.correctIndex
                        ? 'bg-rose-600 text-white'
                        : isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="pt-0.5 leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation when submitted */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs animate-in fade-in ${
                selectedIdx === currentQ.correctIndex
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                {selectedIdx === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Chính xác tuyệt đối!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Chưa chính xác! Xem giải thích bên dưới:</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Chọn 1 phương án và bấm kiểm tra đáp án
            </span>

            {!isSubmitted ? (
              <button
                disabled={selectedIdx === undefined}
                onClick={handleConfirmAnswer}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition disabled:opacity-50 active:scale-95 shadow-xs"
              >
                Kiểm Tra Đáp Án
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả & Chứng Nhận'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Summary & Certificate */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xs text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Hoàn Thành Xuất Sắc 10 Câu Trắc Nghiệm!
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Bạn đã trả lời đúng <span className="font-black text-emerald-700 text-lg">{totalCorrect} / {questions.length}</span> câu ({scorePercent}%)
            </p>
          </div>

          {/* Certificate Generation */}
          <div className="border-4 border-amber-400 bg-linear-to-b from-amber-50/60 to-white p-6 rounded-3xl max-w-md mx-auto shadow-sm relative">
            <div className="flex items-center justify-center gap-2 text-emerald-900 mb-1">
              <Shield className="w-5 h-5 text-emerald-700" />
              <span className="font-black text-xs uppercase tracking-wider">
                CHỨNG NHẬN CHIẾN SĨ TRƯỜNG HỌC XANH
              </span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">
              PHONG TRÀO LÁ CHẮN HỌC ĐƯỜNG
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Nhập họ và tên của bạn để in lên chứng nhận..."
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

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              In Giấy Chứng Nhận
            </button>

            <a
              href="/api/sync/excel/export"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Xuất file Excel chứa ngân hàng câu hỏi gốc chuẩn thể thức"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              Xuất Ngân Hàng Câu Hỏi Ra Excel (.xlsx)
            </a>

            <button
              onClick={handleRestartNewQuiz}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Shuffle className="w-4 h-4" />
              Làm Đề Mới (10 Câu Ngẫu Nhiên Khác)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
