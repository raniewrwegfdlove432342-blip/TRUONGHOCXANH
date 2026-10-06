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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/mockData';

export const QuizView: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [studentName, setStudentName] = useState('');

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const selectedIdx = selectedAnswers[currentQ.id];
  const isSubmitted = isAnswerSubmitted[currentQ.id];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: idx });
  };

  const handleConfirmAnswer = () => {
    if (selectedIdx === undefined) return;
    setIsAnswerSubmitted({ ...isAnswerSubmitted, [currentQ.id]: true });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setIsAnswerSubmitted({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  };

  // Calculate score
  const totalCorrect = QUIZ_QUESTIONS.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner (from Screenshot 4) */}
      <section className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
              KIẾN THỨC HÔM NAY – AN TOÀN NGÀY MAI
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              Trắc Nghiệm Hiểu Đúng – Sống An Toàn
            </h2>
          </div>
        </div>
        <p className="text-xs text-blue-100">
          Bộ 10 câu hỏi chuẩn hóa toàn diện: Phòng chống Ma túy ngụy trang, Bạo lực học đường, Thuốc lá và Pod/Vape.
        </p>

        {/* Progress Bar */}
        {!isFinished && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-blue-100 mb-1.5 font-bold">
              <span>Câu hỏi {currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}</span>
              <span>Đạt: {totalCorrect} / {QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Quiz Card */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Câu số {currentQuestionIndex + 1}
            </span>
            {currentQ.dangerAlert && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {currentQ.dangerAlert}
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
                'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 bg-white text-slate-800';

              if (isSubmitted) {
                if (idx === currentQ.correctIndex) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                } else if (isSelected && idx !== currentQ.correctIndex) {
                  style = 'border-rose-500 bg-rose-50 text-rose-900';
                } else {
                  style = 'border-slate-200 opacity-50 bg-slate-50 text-slate-500';
                }
              } else if (isSelected) {
                style = 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold';
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
                        ? 'bg-blue-600 text-white'
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
                    <span>Chưa chính xác! Cùng xem giải thích bên dưới:</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end">
            {!isSubmitted ? (
              <button
                disabled={selectedIdx === undefined}
                onClick={handleConfirmAnswer}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition disabled:opacity-50"
              >
                Kiểm Tra Đáp Án
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-xs"
              >
                <span>{currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả & Chứng Nhận'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Summary & Certificate */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Hoàn Thành Xuất Sắc Thử Thách!
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Bạn đã trả lời đúng <span className="font-black text-blue-600 text-lg">{totalCorrect} / {QUIZ_QUESTIONS.length}</span> câu ({scorePercent}%)
            </p>
          </div>

          {/* Certificate Generation */}
          <div className="border-4 border-amber-400 bg-linear-to-b from-amber-50/60 to-white p-6 rounded-3xl max-w-md mx-auto shadow-sm relative">
            <div className="flex items-center justify-center gap-2 text-blue-900 mb-1">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-black text-xs uppercase tracking-wider">
                CHỨNG NHẬN CHIẾN SĨ AN TOÀN HỌC ĐƯỜNG
              </span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">
              PHONG TRÀO LÁ CHẮN HỌC ĐƯỜNG
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Nhập tên của bạn để in lên chứng nhận..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-center font-bold text-base text-blue-900 px-3 py-1.5 rounded-xl border border-amber-300 w-full max-w-xs mx-auto focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic max-w-xs mx-auto">
              Đã vượt qua kỳ sát hạch kiến thức nhận diện Ma túy ngụy trang, Thuốc lá điện tử và Kỹ năng ứng phó Bạo lực học đường với kết quả xuất sắc {scorePercent} điểm!
            </p>

            <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-[10px] text-slate-500">
              <span>Hạng: {scorePercent >= 80 ? 'Xuất Sắc (Vàng)' : 'Chiến Sĩ Bản Lĩnh'}</span>
              <span>Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              In Chứng Nhận
            </button>
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Làm Lại Bài Thi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
