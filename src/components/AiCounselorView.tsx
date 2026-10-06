import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  PhoneCall,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Award,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiCounselorViewProps {
  onOpenReport: () => void;
}

export const AiCounselorView: React.FC<AiCounselorViewProps> = ({ onOpenReport }) => {
  const [mode, setMode] = useState<'counselor' | 'roleplay'>('counselor');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Chào em yêu quý! Chú là Cố Vấn Học Đường – người bạn đồng hành tin cậy của em tại trường học.\n\nChú có thể giúp em:\n• Nhận diện ma túy ngụy trang (Pod chill, Nước vui, tem giấy...)\n• Rèn luyện kỹ năng từ chối khi bị rủ rê hút Pod hay uống nước lạ\n• Cách xử lý an toàn khi bị đe dọa hoặc bắt nạt học đường\n\nEm đang có điều gì băn khoăn hay cần chú giải đáp không? Hãy yên tâm chia sẻ nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          mode,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Chú luôn ở đây lắng nghe và bảo vệ em. Em hãy chia sẻ thêm nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Em hãy luôn nhớ nguyên tắc Tứ Bộ Khẩu Quyết: Nói KHÔNG rõ ràng, giữ bình tĩnh, rời khỏi nơi nguy hiểm và báo ngay cho người lớn tin cậy hoặc Tổng đài 111 nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = (newMode: 'counselor' | 'roleplay') => {
    setMode(newMode);
    if (newMode === 'roleplay') {
      setMessages([
        {
          id: 'roleplay-intro',
          role: 'assistant',
          content:
            '🎯 **CHẾ ĐỘ ĐẤU TRÍ: LUYỆN TẬP KỸ NĂNG TỪ CHỐI BẬC THẦY!**\n\nBây giờ chú sẽ đóng vai một bạn cùng trường đang cầm một chiếc Pod sặc sỡ và ép em thử:\n\n*"Này, cầm lấy hút thử một hơi đi! Vị dưa hấu thơm lừng, hút vào tỉnh táo học bài đỉnh lắm, ai cũng hút rồi, sợ gì như con nít thế?"*\n\n👉 **Em hãy gõ câu đáp lại của em để từ chối bạn ấy!** Chú sẽ chấm điểm bản lĩnh và hướng dẫn em cách từ chối an toàn nhất!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([
        {
          id: 'counselor-reset',
          role: 'assistant',
          content:
            'Chào em! Chú đã trở lại chế độ Cố Vấn Học Đường. Em có câu hỏi nào về phòng chống ma túy, bạo lực học đường, thuốc lá hay cần sự trợ giúp nào không?',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mascot in Circle */}
          <div className="w-12 h-12 rounded-full bg-linear-to-b from-emerald-500 to-green-700 p-0.5 shadow-md shrink-0 border-2 border-white">
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

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Cố Vấn AI Học Đường
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-blue-100">
              {mode === 'counselor' ? 'Tư vấn tâm lý & Giải đáp kiến thức' : 'Đấu trí luyện tập từ chối (Roleplay)'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReport}
          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Báo Cáo</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => handleSwitchMode('counselor')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'counselor'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Hỏi Đáp & Tư Vấn</span>
        </button>
        <button
          onClick={() => handleSwitchMode('roleplay')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'roleplay'
              ? 'bg-white text-rose-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-rose-600" />
          <span>Luyện Tập Từ Chối (Roleplay)</span>
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                  {isUser ? 'Em' : 'Chú Cảnh Sát / Cố Vấn Học Đường'} • {msg.timestamp}
                </div>
                <div
                  className={`max-w-[88%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                Cố Vấn Học Đường đang suy nghĩ...
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">Đang tra cứu cẩm nang bảo vệ học sinh...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {mode === 'counselor' ? (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-600">
            <span className="shrink-0 text-slate-400 font-bold">Gợi ý:</span>
            {[
              'Pod Chill là gì?',
              'Làm sao nhận biết Nước Vui?',
              'Bị đe dọa đánh nhau phải làm sao?',
              'Tác hại thuốc lá điện tử?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition"
              >
                {chip}
              </button>
            ))}
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-600">
            <span className="shrink-0 text-slate-400 font-bold">Mẫu từ chối:</span>
            {[
              'Không, tớ bị dị ứng phổi, tớ không hút đâu!',
              'Thôi, tớ phải về nhà học bài ngay đây!',
              'Không dùng, cái này rất nguy hiểm cho não bộ!',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition"
              >
                "{chip}"
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            placeholder={
              mode === 'counselor'
                ? 'Nhập câu hỏi của em (ví dụ: Làm sao để từ chối bạn rủ hút Pod?)...'
                : 'Nhập câu trả lời từ chối của em...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
