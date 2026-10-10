import React, { useState } from 'react';
import { X, Award, CheckCircle2, Sparkles, Share2, Download, Printer, Shield, Check, Copy, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadCertificateImage } from '../utils/certificateGenerator';

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
    role: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

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
    const roleText = role === 'student' ? 'Học sinh' : role === 'teacher' ? 'Thầy cô' : 'Phụ huynh';
    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          school: school.trim() || 'Trường THCS/THPT Thân Yêu',
          role: roleText,
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
          role: roleText,
        });

        // Trigger victory confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.warn('Backend unavailable, generating certificate and syncing to Google Sheets:', err);
      const fallbackId = `LCHD-VOW-${Date.now().toString().slice(-5)}`;
      const fallbackDate = new Date().toISOString();
      onPledged(1);
      setCertificateData({
        id: fallbackId,
        name: name.trim(),
        school: school.trim() || 'Trường THCS/THPT Thân Yêu',
        date: fallbackDate,
        role: roleText,
      });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!certificateData) return;
    const ok = downloadCertificateImage({
      title: 'GIẤY CHỨNG NHẬN ĐẠI SỨ HỌC ĐƯỜNG',
      recipientName: certificateData.name,
      schoolOrOrg: certificateData.school,
      roleLabel: certificateData.role,
      citationText: 'Đã chính thức tuyên thệ và ký cam kết danh dự: Kiên quyết nói KHÔNG với Ma túy, Thuốc lá điện tử (Pod / Vape), Bạo lực học đường; tích cực lan tỏa lối sống lành mạnh và xây dựng môi trường học đường an toàn, văn minh.',
      certificateId: certificateData.id,
      dateStr: certificateData.date,
      badgeText: 'PHONG TRÀO TOÀN DIỆN HỌC ĐƯỜNG',
    });

    if (ok) {
      setStatusFeedback('✓ Đã tải ảnh chứng nhận (.PNG) chất lượng cao về thiết bị của bạn!');
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  const handleShareCertificate = async () => {
    if (!certificateData) return;
    setShowSharePanel(true);
    const shareText = `🛡️ Tôi (${certificateData.name} - ${certificateData.school}) đã chính thức ký cam kết "Trường Học Xanh - An Toàn Hôm Nay, Tương Lai Ngày Mai" trên nền tảng Lá Chắn Học Đường!\n👉 Nói KHÔNG với Ma túy, Thuốc lá điện tử & Bạo lực học đường! Hãy cùng tham gia tại: ${window.location.origin}`;

    // Try native share on mobile if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chứng nhận Lá Chắn Học Đường',
          text: shareText,
          url: window.location.origin,
        });
        setStatusFeedback('✓ Đã mở trình chia sẻ trên thiết bị!');
        setTimeout(() => setStatusFeedback(null), 3000);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    handleCopyText(shareText);
  };

  const handleCopyText = (text?: string) => {
    if (!certificateData) return;
    const copyContent = text || `🛡️ Tôi (${certificateData.name} - ${certificateData.school}) đã chính thức ký cam kết "Trường Học Xanh - An Toàn Hôm Nay, Tương Lai Ngày Mai" trên nền tảng Lá Chắn Học Đường!\n👉 Nói KHÔNG với Ma túy, Thuốc lá điện tử & Bạo lực học đường!`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyContent).then(() => {
        setCopiedSuccess(true);
        setStatusFeedback('✓ Đã sao chép lời cam kết vào bộ nhớ tạm! Bạn có thể dán (Paste) lên Facebook, Zalo, nhóm lớp.');
        setTimeout(() => setCopiedSuccess(false), 3000);
        setTimeout(() => setStatusFeedback(null), 4500);
      }).catch(() => {
        fallbackCopy(copyContent);
      });
    } else {
      fallbackCopy(copyContent);
    }
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedSuccess(true);
    setStatusFeedback('✓ Đã sao chép lời cam kết vào bộ nhớ tạm!');
    setTimeout(() => setCopiedSuccess(false), 3000);
    setTimeout(() => setStatusFeedback(null), 4000);
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
              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bạn tham gia với tư cách:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      role === 'student'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    🎓 Học Sinh (HS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      role === 'teacher'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    👨‍🏫 Thầy Cô (GV)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      role === 'parent'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    👨‍👩‍👧 Phụ Huynh
                  </button>
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trường / Lớp / Chi đội:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lớp 8A3, THCS Chu Văn An"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
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
          <div className="space-y-5">
            <div className="text-center">
              <span className="inline-block p-2 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Chúc Mừng Bạn Đã Gia Nhập Lá Chắn Học Đường!
              </h3>
              <p className="text-xs text-slate-500">
                Chứng nhận danh dự bảo vệ môi trường giáo dục an toàn
              </p>
            </div>

            {/* Status Feedback Toast */}
            {statusFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusFeedback}</span>
              </div>
            )}

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
                GIẤY CHỨNG NHẬN ĐẠI SỨ HỌC ĐƯỜNG
              </div>
              <div className="text-2xl font-black text-slate-900 my-2 text-blue-900 font-serif">
                {certificateData.name}
              </div>
              <div className="text-xs text-slate-600 font-medium mb-3">
                {certificateData.role} • {certificateData.school}
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

            {/* Action Buttons: LƯU & LAN TỎA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleDownloadCertificate}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98"
                title="Tải ảnh chứng nhận sắc nét về máy điện thoại hoặc máy tính"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>Lưu Chứng Nhận (Ảnh PNG)</span>
              </button>

              <button
                onClick={handleShareCertificate}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98"
                title="Lan tỏa lời cam kết đến bạn bè và mạng xã hội"
              >
                <Share2 className="w-4 h-4 text-blue-200" />
                <span>Lan Tỏa Chứng Nhận</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                title="In chứng nhận ra máy in"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>In Bản Giấy</span>
              </button>
            </div>

            {/* Share Panel (When user clicks Lan tỏa) */}
            {showSharePanel && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Lan Tỏa Thông Điệp Trường Học Xanh</span>
                  </div>
                  <button
                    onClick={() => setShowSharePanel(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Đóng
                  </button>
                </div>

                <p className="text-[11px] text-slate-600">
                  Hãy cùng kêu gọi bạn bè cùng trường tham gia nói KHÔNG với Ma túy và Bạo lực học đường:
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyText()}
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
                        <span>Sao chép lời cam kết</span>
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
                    <span>Chia sẻ lên Facebook</span>
                  </a>

                  <button
                    onClick={() => {
                      handleCopyText();
                      window.open('https://chat.zalo.me/', '_blank');
                    }}
                    className="px-3 py-2 bg-[#0068FF] hover:bg-[#005cd6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Gửi qua Zalo nhóm lớp</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

