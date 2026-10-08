import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  PhoneCall,
  Search,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Copy,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info,
  Download,
} from 'lucide-react';
import { AnonymousReportSubmission, ReportDetail, ReportMessage } from '../types';

interface ReportIncidentViewProps {
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
}

export const ReportIncidentView: React.FC<ReportIncidentViewProps> = ({
  isAdminMode,
  setIsAdminMode,
}) => {
  // Navigation inside report screen
  const [subTab, setSubTab] = useState<'create' | 'track' | 'admin'>('create');

  // New report form state
  const [category, setCategory] = useState<'violence' | 'cyberbullying' | 'drugs' | 'vape'>('drugs');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ ticketCode: string; pin: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Track ticket state
  const [searchTicketCode, setSearchTicketCode] = useState('');
  const [currentReport, setCurrentReport] = useState<ReportDetail | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [newReplyMessage, setNewReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Admin receiver portal state
  const [adminReportsList, setAdminReportsList] = useState<ReportDetail[]>([]);
  const [adminFilterCategory, setAdminFilterCategory] = useState<string>('all');
  const [adminFilterUrgency, setAdminFilterUrgency] = useState<string>('all');
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<string | null>(null);
  const [adminStatusUpdate, setAdminStatusUpdate] = useState<string>('');
  const [adminNoteUpdate, setAdminNoteUpdate] = useState<string>('');

  // Pre-load default ticket if in track
  useEffect(() => {
    if (isAdminMode) {
      setSubTab('admin');
      fetchAdminReports();
    }
  }, [isAdminMode]);

  const fetchAdminReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdminReportsList(data);
      }
    } catch (err) {
      console.error('Failed to load admin reports:', err);
    }
  };

  const handleSearchTicket = async (codeToSearch?: string) => {
    const code = codeToSearch || searchTicketCode;
    if (!code || !code.trim()) return;

    setIsLoadingReport(true);
    setTrackError('');
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setCurrentReport(data);
      } else {
        setTrackError(data.error || 'Không tìm thấy hồ sơ báo cáo.');
        setCurrentReport(null);
      }
    } catch (err) {
      setTrackError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      setCurrentReport(null);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const categoryLabels: Record<string, string> = {
        violence: 'Bạo lực học đường (Đánh đập, đe dọa, cô lập)',
        cyberbullying: 'Bắt nạt trên mạng (Cyberbullying)',
        drugs: 'Ma túy ngụy trang & Chất kích thích lạ',
        vape: 'Thuốc lá điện tử (Pod / Vape)',
      };

      const finalDescription = isAnonymous
        ? description
        : `${description}\n\n[Thông tin người gửi]: ${contactInfo || 'Học sinh'}`;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          categoryLabel: categoryLabels[category],
          urgency,
          title: title.trim() || `Báo cáo ${categoryLabels[category]}`,
          location: location.trim() || 'Khu vực trường học',
          incidentTime: incidentTime.trim() || 'Gần đây',
          description: finalDescription,
          evidenceUrl: evidenceUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedTicket({
          ticketCode: data.report.ticketCode,
          pin: data.report.pin,
        });
        setSearchTicketCode(data.report.ticketCode);
        // Refresh admin list in background
        fetchAdminReports();
      }
    } catch (err) {
      alert('Không thể gửi báo cáo. Vui lòng kiểm tra lại kết nối mạng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (senderType: 'student' | 'counselor') => {
    if (!currentReport || !newReplyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/reports/${currentReport.ticketCode}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newReplyMessage.trim(),
          sender: senderType,
          senderName: senderType === 'student' ? 'Học sinh ẩn danh' : 'Ban Giám Hiệu & Tiếp Nhận',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentReport(data.report);
        setNewReplyMessage('');
        fetchAdminReports();
      }
    } catch (err) {
      alert('Không thể gửi tin nhắn.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAdminUpdateReport = async (ticketCode: string) => {
    try {
      const res = await fetch(`/api/reports/${ticketCode}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: adminStatusUpdate || undefined,
          notesFromSchool: adminNoteUpdate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã cập nhật trạng thái xử lý thành công!');
        fetchAdminReports();
        if (currentReport?.ticketCode === ticketCode) {
          setCurrentReport(data.report);
        }
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return {
          label: 'Đã Tiếp Nhận',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          step: 1,
        };
      case 'verifying':
        return {
          label: 'Đang Xác Minh',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          step: 2,
        };
      case 'intervening':
        return {
          label: 'Đang Can Thiệp Bảo Vệ',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          step: 3,
        };
      case 'resolved':
        return {
          label: 'Đã Giải Quyết An Toàn',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          step: 4,
        };
      default:
        return {
          label: status,
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          step: 1,
        };
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner & Scope of Anonymity */}
      <section className="bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-200">
              ĐƯỜNG DÂY TIẾP NHẬN BẢO MẬT
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
              Hộp Thư Báo Cáo Ẩn Danh – Cần Giúp Đỡ
            </h2>
          </div>
        </div>

        <p className="text-xs text-red-100 mt-2 leading-relaxed">
          Nơi học sinh có thể phản ánh các sự việc về ma túy, bạo lực học đường, thuốc lá, pod/vape một cách an toàn. Bạn không bắt buộc phải cung cấp họ tên, lớp học hay số điện thoại.
        </p>

        {/* Clear Anonymity Statement according to user guidelines */}
        <div className="mt-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-[11px] text-red-100 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
          <span>
            <strong>Phạm vi bảo mật:</strong> Báo cáo qua ứng dụng không thu thập IP hay thông tin thiết bị. Bạn sẽ nhận được <strong>Mã Tra Cứu</strong> để theo dõi tiến độ và trao đổi 2 chiều với thầy cô tiếp nhận mà hoàn toàn không lộ danh tính.
          </span>
        </div>
      </section>

      {/* Urgent Hotline Direct Call vs Anonymous Report clarification */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <PhoneCall className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-amber-900">
              Cần cứu viện ngay tức khắc?
            </div>
            <div className="text-[11px] text-amber-800">
              Nếu đang bị đánh hoặc bị ép dùng chất cấm tại chỗ, hãy bấm gọi ngay:
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:111"
            className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            Tổng đài 111
          </a>
          <a
            href="tel:113"
            className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            Cảnh sát 113
          </a>
        </div>
      </section>

      {/* Tabs Selector: Gửi Báo Cáo / Tra Cứu / Quản Trị Tiếp Nhận */}
      <div className="flex p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setSubTab('create')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
            subTab === 'create'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-red-600" />
          <span>Gửi Báo Cáo Mới</span>
        </button>

        <button
          onClick={() => {
            setSubTab('track');
            if (searchTicketCode && !currentReport) {
              handleSearchTicket();
            }
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
            subTab === 'track'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 text-blue-600" />
          <span>Tra Cứu & Trò Chuyện 2 Chiều</span>
        </button>

        {isAdminMode && (
          <button
            onClick={() => {
              setSubTab('admin');
              fetchAdminReports();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              subTab === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-800 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Cổng Tiếp Nhận ({adminReportsList.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: FORM GỬI BÁO CÁO MỚI */}
      {subTab === 'create' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          {!createdTicket ? (
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Chọn vấn đề cần phản ánh: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'drugs', label: 'Ma túy & Pod Chill / Nước Vui', icon: '🚨' },
                    { id: 'violence', label: 'Bạo lực học đường / Đe dọa', icon: '🥊' },
                    { id: 'vape', label: 'Thuốc lá & Pod / Vape', icon: '💨' },
                    { id: 'cyberbullying', label: 'Bắt nạt mạng / Tống tiền', icon: '📱' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as any)}
                      className={`p-3 rounded-2xl border text-left font-bold transition flex items-center gap-2 ${
                        category === item.id
                          ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-400/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Mức độ khẩn cấp: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'low', label: 'Thấp (Cần tư vấn / Khuyên ngăn)', desc: 'Chưa có nguy hại ngay' },
                    { id: 'medium', label: 'Trung bình (Đang âm ỉ)', desc: 'Có thể xảy ra trong tuần' },
                    { id: 'high', label: 'Khẩn cấp (Nguy hiểm tính mạng)', desc: 'Cần can thiệp ngay' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUrgency(item.id as any)}
                      className={`p-2.5 rounded-2xl border text-center transition ${
                        urgency === item.id
                          ? item.id === 'high'
                            ? 'bg-red-100 border-red-600 text-red-950 font-black'
                            : 'bg-blue-50 border-blue-600 text-blue-950 font-black'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{item.label}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Địa điểm xảy ra: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Khu nhà vệ sinh tầng 2, Quán trà sữa cổng phụ..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. Thời gian xảy ra / thường xuyên:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giờ ra chơi tiết 3, hoặc tan học thứ Sáu lúc 17h..."
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Tiêu đề tóm tắt:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phát hiện người lạ rủ hút Pod kẹo ở cổng sau trường..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. Chi tiết diễn biến sự việc: <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hãy mô tả chi tiết: Có bao nhiêu người tham gia? Dấu hiệu của chất lạ hoặc lời đe dọa như thế nào? (Không cần nhắc tên của em)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 leading-relaxed"
                />
              </div>

              {/* Attach evidence / Photo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  7. Hình ảnh / Bằng chứng chụp màn hình (Tùy chọn):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dán đường dẫn ảnh hoặc bấm chọn ảnh mẫu bằng chứng..."
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEvidenceUrl(
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Đính kèm mẫu
                  </button>
                </div>
                {evidenceUrl && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={evidenceUrl}
                      alt="Bằng chứng"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="text-[11px] text-slate-600 flex-1">
                      <span>Đã đính kèm ảnh bằng chứng. Ảnh sẽ được bảo vệ bảo mật.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEvidenceUrl('')}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              {/* Anonymity settings */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Tôi muốn gửi hoàn toàn ẨN DANH (Khuyên dùng)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  Khi chọn gửi ẩn danh, bạn không cần điền tên, lớp hay số điện thoại. Hệ thống chỉ cấp một Mã Tra Cứu ngẫu nhiên để bạn theo dõi kết quả.
                </p>

                {!isAnonymous && (
                  <div className="mt-3 pl-6">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thông tin liên hệ của bạn (Nếu muốn được liên hệ trực tiếp):
                    </label>
                    <input
                      type="text"
                      placeholder="Họ tên, lớp hoặc số điện thoại..."
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="w-full py-3.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black rounded-2xl text-sm shadow-md shadow-red-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang mã hóa và gửi báo cáo an toàn...</span>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-amber-200" />
                    <span>Gửi Báo Cáo Bảo Mật Đến Ban Tiếp Nhận</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Submission Success State */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Báo Cáo Của Bạn Đã Được Chuyển Tiếp An Toàn!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Cảm ơn sự dũng cảm và tinh thần trách nhiệm của bạn. Ban Tiếp Nhận & An Ninh Trường Học đã nhận được thông tin và đang xử lý theo quy trình bảo vệ học sinh.
                </p>
              </div>

              {/* Ticket Code Card */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-5 max-w-sm mx-auto text-left shadow-inner">
                <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider mb-1">
                  MÃ TRA CỨU THEO DÕI RIÊNG CỦA BẠN:
                </div>
                <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 shadow-xs mb-3">
                  <span className="font-mono font-black text-lg text-blue-900 tracking-wider">
                    {createdTicket.ticketCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdTicket.ticketCode)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                    title="Sao chép mã"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Mã PIN bí mật:</span>
                  <span className="font-mono font-bold text-slate-900">{createdTicket.pin}</span>
                </div>

                <p className="text-[10px] text-slate-500 italic mt-2.5 pt-2 border-t border-blue-100">
                  * Hãy chụp màn hình hoặc lưu mã này lại để xem tiến độ xử lý và trò chuyện bảo mật với thầy cô!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <button
                  onClick={() => {
                    handleSearchTicket(createdTicket.ticketCode);
                    setSubTab('track');
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Tra Cứu & Trò Chuyện Ngay</span>
                </button>

                <button
                  onClick={() => {
                    setCreatedTicket(null);
                    setDescription('');
                    setLocation('');
                    setTitle('');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Gửi Báo Cáo Khác
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRA CỨU & TRÒ CHUYỆN BẢO MẬT 2 CHIỀU */}
      {subTab === 'track' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          {/* Search Bar */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nhập Mã Tra Cứu (Ticket Code):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: LCHD-8821 hoặc LCHD-7492..."
                value={searchTicketCode}
                onChange={(e) => setSearchTicketCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSearchTicket()}
                disabled={isLoadingReport || !searchTicketCode.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoadingReport ? <span>Đang tìm...</span> : <Search className="w-4 h-4" />}
                <span>Tra Cứu</span>
              </button>
            </div>

            {/* Quick Demo Tickets Bar */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
              <span>Hồ sơ có sẵn:</span>
              {['LCHD-8821', 'LCHD-7492', 'LCHD-3319'].map((demo) => (
                <button
                  key={demo}
                  onClick={() => {
                    setSearchTicketCode(demo);
                    handleSearchTicket(demo);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 font-mono font-bold transition"
                >
                  {demo}
                </button>
              ))}
            </div>

            {trackError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {trackError}
              </div>
            )}
          </div>

          {/* Ticket Details & Timeline & 2-Way Chat */}
          {currentReport && (
            <div className="space-y-5 pt-3 border-t border-slate-200 animate-in fade-in">
              {/* Header of Report */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-blue-900 text-base">
                      {currentReport.ticketCode}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">
                      {currentReport.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{currentReport.title}</h3>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Địa điểm: <span className="font-semibold">{currentReport.location}</span> | Thời gian: <span className="font-semibold">{currentReport.incidentTime}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {(() => {
                    const badge = getStatusBadge(currentReport.status);
                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Progress 4 Steps Timeline */}
              <div className="py-2">
                <div className="text-xs font-bold text-slate-700 mb-2">Tiến độ can thiệp bảo vệ:</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { step: 1, label: 'Đã Tiếp Nhận', desc: 'Hệ thống ghi nhận' },
                    { step: 2, label: 'Đang Xác Minh', desc: 'Thầy cô kiểm tra' },
                    { step: 3, label: 'Đang Can Thiệp', desc: 'Bảo vệ học sinh' },
                    { step: 4, label: 'Đã Giải Quyết', desc: 'Đảm bảo an toàn' },
                  ].map((s) => {
                    const badge = getStatusBadge(currentReport.status);
                    const isDone = badge.step >= s.step;
                    const isCurrent = badge.step === s.step;

                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : s.step}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            isDone ? 'text-emerald-800' : 'text-slate-400'
                          }`}
                        >
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official Notes from School */}
              {currentReport.notesFromSchool && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-900">Ghi chú từ Ban Giám Hiệu & An Ninh:</div>
                    <p className="mt-0.5 leading-relaxed text-blue-800">
                      {currentReport.notesFromSchool}
                    </p>
                  </div>
                </div>
              )}

              {/* 2-Way Anonymous Conversation Area */}
              <div className="border border-slate-200 rounded-3xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Kênh Trao Đổi 2 Chiều Ẩn Danh (Bảo Mật 100%)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {currentReport.messages.length} tin nhắn
                  </span>
                </div>

                {/* Messages Box */}
                <div className="p-4 space-y-3 max-h-72 overflow-y-auto bg-slate-50/50">
                  {currentReport.messages.map((msg) => {
                    const isFromStudent = msg.sender === 'student';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isFromStudent ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                          {msg.senderName} •{' '}
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isFromStudent
                              ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send Reply Input */}
                <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Gửi thêm chi tiết mới hoặc câu hỏi cho người tiếp nhận..."
                    value={newReplyMessage}
                    onChange={(e) => setNewReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage('student');
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSendMessage('student')}
                    disabled={isSendingReply || !newReplyMessage.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CỔNG TIẾP NHẬN DÀNH CHO NHÀ TRƯỜNG & ĐƯỜNG DÂY NÓNG (Admin Receiver Portal) */}
      {subTab === 'admin' && isAdminMode && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>GIAO DIỆN CÁN BỘ TIẾP NHẬN HỌC ĐƯỜNG</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Danh Sách Hồ Sơ Báo Cáo Chờ Xử Lý
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/sync/excel/export"
                download
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                title="Xuất toàn bộ báo cáo ra file Excel chuẩn thể thức"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>Xuất Excel (.xlsx)</span>
              </a>

              <select
                value={adminFilterUrgency}
                onChange={(e) => setAdminFilterUrgency(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="high">Khẩn cấp</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>

              <button
                onClick={fetchAdminReports}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* List of Reports */}
          <div className="space-y-3">
            {adminReportsList
              .filter((r) => adminFilterUrgency === 'all' || r.urgency === adminFilterUrgency)
              .map((rep) => {
                const badge = getStatusBadge(rep.status);
                const isSelected = selectedAdminTicket === rep.ticketCode;

                return (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-2xl border transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-300/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-900">
                            {rep.ticketCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              rep.urgency === 'high'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Mức: {rep.urgency === 'high' ? 'Khẩn cấp' : 'Bình thường'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {rep.categoryLabel}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{rep.title}</h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {rep.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        📍 {rep.location} • 🕒 {rep.incidentTime}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAdminTicket(isSelected ? null : rep.ticketCode);
                          setAdminStatusUpdate(rep.status);
                          setAdminNoteUpdate(rep.notesFromSchool || '');
                          handleSearchTicket(rep.ticketCode);
                        }}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        {isSelected ? 'Thu gọn' : 'Xử lý & Phản hồi ➔'}
                      </button>
                    </div>

                    {/* Admin Action Sub-Panel */}
                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-blue-200 bg-white p-3.5 rounded-xl space-y-3">
                        <div className="text-xs font-bold text-slate-800">
                          Cập nhật trạng thái xử lý cho học sinh:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {[
                            { id: 'received', label: '1. Đã Tiếp Nhận' },
                            { id: 'verifying', label: '2. Đang Xác Minh' },
                            { id: 'intervening', label: '3. Đang Can Thiệp' },
                            { id: 'resolved', label: '4. Đã Giải Quyết' },
                          ].map((st) => (
                            <button
                              key={st.id}
                              onClick={() => setAdminStatusUpdate(st.id)}
                              className={`p-2 rounded-xl border text-xs font-bold ${
                                adminStatusUpdate === st.id
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Ghi chú dặn dò bảo vệ học sinh:
                          </label>
                          <textarea
                            rows={2}
                            value={adminNoteUpdate}
                            onChange={(e) => setAdminNoteUpdate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                            placeholder="Ví dụ: Đội giám thị và Công an phường đã tuần tra và chốt chặn..."
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAdminUpdateReport(rep.ticketCode)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                          >
                            Lưu Cập Nhật & Thông Báo Cho Học Sinh
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
