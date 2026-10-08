import React, { useState } from 'react';
import { X, Award, CheckCircle2, Sparkles, Share2, Download, Printer, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pledgeCount: number;
  onPledged: (newCount: number) => void;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  isOpen,
  onClose,
  pledgeCount,
  onPledged,
}) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [checkedRules, setCheckedRules] = useState<boolean[]>([true, true, true, true]);
  const [certificateData, setCertificateData] = useState<{
    id: string;
    name: string;
    school: string;
    date: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleRule = (index: number) => {
    const updated = [...checkedRules];
    updated[index] = !updated[index];
    setCheckedRules(updated);
  };

  const allRulesChecked = checkedRules.every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          school: school.trim() || 'Trường THCS/THPT Thân Yêu',
          role: role === 'student' ? 'Học sinh' : role === 'teacher' ? 'Thầy cô' : 'Phụ huynh',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onPledged(data.count);
        setCertificateData({
          id: data.certificateId,
          name: data.name,
          school: data.school,
          date: data.pledgedAt,
        });

        // Trigger victory confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Failed to submit commitment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!certificateData ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>PHONG TRÀO TOÀN DIỆN HỌC ĐƯỜNG</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Ký Cam Kết "Trường Học An Toàn"
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Đã có <span className="font-bold text-blue-600">{pledgeCount.toLocaleString('vi-VN')}+</span> Thầy Cô & Học sinh ký cam kết!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên của em / Thầy cô: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trường / Lớp:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lớp 8A3, THCS Chu Văn An"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="student">Học sinh</option>
                    <option value="teacher">Thầy cô / Cán bộ</option>
                    <option value="parent">Phụ huynh học sinh</option>
                  </select>
                </div>
              </div>

              {/* 4 Commitments check */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  4 Cam kết danh dự của tôi:
                </div>
                {[
                  'Nói KHÔNG tuyệt đối với mọi dạng Ma túy & Chất kích thích ngụy trang.',
                  'Nói KHÔNG với Thuốc lá truyền thống & Thuốc lá điện tử (Pod / Vape).',
                  'Nói KHÔNG với Bạo lực học đường, cô lập và bắt nạt trên không gian mạng.',
                  'Chủ động rèn luyện kỹ năng từ chối, giúp đỡ bạn bè và báo cáo sự việc an toàn.',
                ].map((text, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checkedRules[idx]}
                      onChange={() => handleToggleRule(idx)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={!allRulesChecked || !name.trim() || isSubmitting}
                className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang xử lý cấp chứng nhận...</span>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Xác Nhận Ký Cam Kết & Nhận Chứng Nhận</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Certificate Result */
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-block p-2 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Chúc Mừng Em Đã Gia Nhập Lá Chắn Học Đường!
              </h3>
              <p className="text-xs text-slate-500">
                Chứng nhận danh dự bảo vệ môi trường giáo dục an toàn
              </p>
            </div>

            {/* Official Looking Certificate Card */}
            <div className="relative border-4 border-amber-400 bg-linear-to-b from-amber-50/50 via-white to-amber-50/40 p-6 rounded-2xl text-center shadow-inner overflow-hidden">
              <div className="absolute top-2 left-2 text-amber-300">★</div>
              <div className="absolute top-2 right-2 text-amber-300">★</div>
              <div className="absolute bottom-2 left-2 text-amber-300">★</div>
              <div className="absolute bottom-2 right-2 text-amber-300">★</div>

              <div className="flex items-center justify-center gap-2 text-blue-800 mb-1">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-extrabold text-sm tracking-wider uppercase">
                  LÁ CHẮN HỌC ĐƯỜNG VIỆT NAM
                </span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                TRƯỜNG HỌC XANH - AN TOÀN - NÓI KHÔNG VỚI CHẤT GÂY NGHIỆN & BẠO LỰC
              </div>

              <div className="text-xs uppercase text-amber-700 font-bold tracking-widest">
                GIẤY CHỨNG NHẬN ĐẠI SỨ
              </div>
              <div className="text-2xl font-black text-slate-900 my-2 text-blue-900 font-serif">
                {certificateData.name}
              </div>
              <div className="text-xs text-slate-600 font-medium mb-3">
                {certificateData.school}
              </div>

              <p className="text-[11px] text-slate-600 italic max-w-sm mx-auto leading-relaxed">
                Đã chính thức tuyên thệ nói KHÔNG với Ma túy, Thuốc lá điện tử, Bạo lực học đường; cam kết lan tỏa tri thức và xây dựng học đường an toàn, văn minh.
              </p>

              <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-[10px] text-slate-500">
                <div>
                  Mã số: <span className="font-mono font-bold text-slate-700">{certificateData.id}</span>
                </div>
                <div>
                  Ngày cấp: <span className="font-semibold text-slate-700">{certificateData.date}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                In / Lưu Chứng Nhận
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Tôi (${certificateData.name}) đã chính thức ký cam kết "Trường Học Xanh - An Toàn Hôm Nay, Tương Lai Ngày Mai" trên nền tảng Lá Chắn Học Đường! Hãy cùng tham gia!`
                  );
                  alert('Đã sao chép lời nhắn cam kết để bạn chia sẻ cho bạn bè!');
                }}
                className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Share2 className="w-4 h-4" />
                Lan tỏa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
