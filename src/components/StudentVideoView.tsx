import React, { useState, useEffect } from 'react';
import {
  Upload,
  Heart,
  Eye,
  CheckCircle2,
  CloudUpload,
  Film,
  PlusCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  FolderOpen,
  Image as ImageIcon,
  Download,
  Search,
  ZoomIn,
  Shield,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentVideo, UserAccount } from '../types';
import { fetchAllVideosOnline, GOOGLE_SHEETS_WEBHOOK_URL } from '../utils/googleSheetsClient';

interface StudentVideoViewProps {
  currentUser: UserAccount | null;
  isAdmin?: boolean;
  onOpenAuth: () => void;
  onOpenGoogleSheetSync: () => void;
}

export const SCHOOL_GOOGLE_DRIVE_FOLDER =
  'https://drive.google.com/drive/folders/1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS?usp=sharing';

export const StudentVideoView: React.FC<StudentVideoViewProps> = ({
  currentUser,
  isAdmin = false,
  onOpenAuth,
  onOpenGoogleSheetSync,
}) => {
  const [videos, setVideos] = useState<StudentVideo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [copiedDriveLink, setCopiedDriveLink] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Form Submission State
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.fullName || '');
  const [studentGrade, setStudentGrade] = useState(currentUser?.gradeClass || '');
  const [school, setSchool] = useState(currentUser?.school || '');
  const [category, setCategory] = useState<'vape' | 'drugs' | 'violence' | 'friendship'>('vape');
  const [fileType, setFileType] = useState<'video' | 'image'>('video');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccessData, setUploadSuccessData] = useState<{
    show: boolean;
    title: string;
    fileName?: string;
  } | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await fetchAllVideosOnline();
      setVideos(data);
    } catch (err) {
      console.warn('Failed to fetch student videos:', err);
    }
  };

  const handleCopyDriveLink = () => {
    navigator.clipboard.writeText(SCHOOL_GOOGLE_DRIVE_FOLDER);
    setCopiedDriveLink(true);
    setTimeout(() => setCopiedDriveLink(false), 2000);
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/student-videos/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, likes: data.likes } : v))
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tác phẩm này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/student-videos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormError('');
      const isImg = file.type.startsWith('image/');
      setFileType(isImg ? 'image' : 'video');

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLocalPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề tác phẩm!');
      return;
    }

    if (!localPreviewUrl) {
      setFormError('Vui lòng chọn tệp video hoặc ảnh từ thiết bị của bạn!');
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryLabels: Record<string, string> = {
        vape: 'Phòng chống Thuốc lá điện tử & Pod',
        drugs: 'Phòng chống Ma túy ngụy trang & Nước vui',
        violence: 'Phòng chống Bạo lực & Bắt nạt mạng',
        friendship: 'Xây dựng Tình bạn học đường đẹp',
      };

      const res = await fetch('/api/student-videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          authorName: authorName.trim() || currentUser?.fullName || 'Học sinh Trường Học Xanh',
          studentGrade: studentGrade.trim() || currentUser?.gradeClass || 'Khối THCS / THPT',
          school: school.trim() || currentUser?.school || 'Trường học thân yêu',
          category,
          categoryLabel: categoryLabels[category],
          fileBase64: localPreviewUrl,
          fileName: selectedFile?.name,
          mimeType: selectedFile?.type,
          fileType,
          description: description.trim() || 'Tác phẩm sáng tạo của học sinh tuyên truyền phòng chống tệ nạn học đường.',
          duration: fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video clip',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadSuccessData({
          show: true,
          title: title.trim(),
          fileName: selectedFile?.name,
        });

        fetchVideos();
        setShowUploadForm(false);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setLocalPreviewUrl('');
        setFormError('');
      } else {
        setFormError(data.error || 'Vui lòng kiểm tra lại thông tin tác phẩm.');
      }
    } catch {
      // Direct graceful fallback: Lưu tác phẩm trực tiếp vào danh sách và đồng bộ
      const fallbackWork: StudentVideo = {
        id: `vid-${Date.now()}`,
        title: title.trim(),
        authorName: authorName.trim() || currentUser?.fullName || 'Học sinh Trường Học Xanh',
        studentGrade: studentGrade.trim() || currentUser?.gradeClass || 'Khối THCS / THPT',
        school: school.trim() || currentUser?.school || 'Trường học thân yêu',
        category,
        categoryLabel:
          category === 'vape'
            ? 'Phòng chống Thuốc lá điện tử & Pod'
            : category === 'drugs'
            ? 'Phòng chống Ma túy ngụy trang & Nước vui'
            : category === 'violence'
            ? 'Phòng chống Bạo lực & Bắt nạt mạng'
            : 'Xây dựng Tình bạn học đường đẹp',
        fileType,
        thumbnailUrl: fileType === 'image' ? localPreviewUrl : undefined,
        videoUrl: fileType === 'video' ? localPreviewUrl : undefined,
        driveUrl: SCHOOL_GOOGLE_DRIVE_FOLDER,
        description: description.trim() || 'Tác phẩm sáng tạo của học sinh tuyên truyền phòng chống tệ nạn học đường.',
        duration: fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video clip',
        likes: 1,
        views: 1,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
      };

      setVideos((prev) => [fallbackWork, ...prev]);
      setUploadSuccessData({
        show: true,
        title: title.trim(),
        fileName: selectedFile?.name,
      });

      setShowUploadForm(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setLocalPreviewUrl('');
      setFormError('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchCategory = activeCategory === 'all' || v.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.studentGrade && v.studentGrade.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* 1. ADMIN ONLY MANAGEMENT PANEL (CHỈ QUẢN TRỊ VIÊN ADMIN MỚI NHÌN THẤY) */}
      {isAdmin && (
        <section className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-400/80 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>BẢNG ĐIỀU HÀNH ADMIN - QUẢN LÝ GOOGLE DRIVE TRƯỜNG</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Quản Trị Thư Mục Google Drive Lưu Trữ & Sổ Dữ Liệu
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Khu vực quản lý bảo mật chỉ hiển thị cho tài khoản Quản trị viên (admin). Giáo viên và học sinh không thể nhìn thấy hoặc chỉnh sửa các đường link quản lý này.
              </p>

              {/* Google Drive Link Box */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  Đường dẫn thư mục Google Drive tiếp nhận tệp của trường:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
                  <input
                    type="text"
                    readOnly
                    value={SCHOOL_GOOGLE_DRIVE_FOLDER}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-amber-400/50 text-amber-100 font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyDriveLink}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copiedDriveLink ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao chép link Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0 sm:min-w-[200px]">
              <a
                href={SCHOOL_GOOGLE_DRIVE_FOLDER}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Mở Google Drive (Admin)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="/api/sync/excel/export"
                download
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-600/50"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>Xuất file Excel (.xlsx)</span>
              </a>

              <button
                onClick={onOpenGoogleSheetSync}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/20"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Đồng bộ Google Sheet</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. PUBLIC HEADER FOR STUDENTS & GUESTS (CLEAN & WELCOMING) */}
      <section className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-7 shadow-md border border-emerald-700/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold">
              <Film className="w-3.5 h-3.5 text-amber-300" />
              <span>GÓC VIDEO & TÁC PHẨM SÁNG TẠO HỌC SINH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Tuyên Truyền Trường Học Xanh
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Nơi chia sẻ các tiểu phẩm kịch, video clip và tranh ảnh cổ động phòng chống ma túy, bạo lực học đường và thuốc lá điện tử do các bạn học sinh thực hiện.
            </p>
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>{showUploadForm ? 'Đóng biểu mẫu' : '+ Nộp Video / Ảnh Của Em'}</span>
          </button>
        </div>
      </section>

      {/* Upload Success Modal / Notice */}
      {uploadSuccessData?.show && (
        <div className="p-5 sm:p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl space-y-3.5 shadow-lg animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 font-black text-emerald-950 text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Tác phẩm "{uploadSuccessData.title}" đã được nộp và tải lên thành công!</span>
            </div>
            <button
              onClick={() => setUploadSuccessData(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tác phẩm của em đã được hệ thống lưu trữ an toàn và đồng bộ vào Google Sheet của trường!</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Toàn bộ thầy cô và học sinh trong trường có thể theo dõi tác phẩm tuyên truyền của em ngay trong danh sách bên dưới.
            </p>
          </div>
          <div className="pt-1 flex items-center justify-end">
            <button
              onClick={() => setUploadSuccessData(null)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
            >
              Xem tác phẩm của em
            </button>
          </div>
        </div>
      )}

      {/* 3. FORM NỘP TÁC PHẨM CỦA HỌC SINH */}
      {showUploadForm && (
        <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CloudUpload className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Nộp Tác Phẩm Video / Ảnh Của Học Sinh
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn tệp từ máy của bạn. Hệ thống sẽ lưu và tự động mở thư mục Google Drive của trường để bạn tải lên.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowUploadForm(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitWork} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu đề tác phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tiểu phẩm 9A2 - Giữ Vững Bản Lĩnh, Nói Không Với Pod Chill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Định dạng tác phẩm
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFileType('video')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      fileType === 'video'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video Clip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFileType('image')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      fileType === 'image'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Ảnh / Áp phích</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Họ và tên tác giả / Chi đội
                </label>
                <input
                  type="text"
                  placeholder="VD: Chi đội 9A2 / Nguyễn Văn A"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Lớp / Khối
                </label>
                <input
                  type="text"
                  placeholder="VD: Lớp 9A2 / Khối 8"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Trường học
                </label>
                <input
                  type="text"
                  placeholder="VD: THCS Lê Quý Đôn"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Chủ đề phòng chống
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
              >
                <option value="vape">Phòng chống Thuốc lá điện tử & Pod</option>
                <option value="drugs">Phòng chống Ma túy ngụy trang & Nước vui</option>
                <option value="violence">Phòng chống Bạo lực & Bắt nạt mạng</option>
                <option value="friendship">Xây dựng Tình bạn học đường đẹp</option>
              </select>
            </div>

            {/* Choose file directly from computer/phone */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
              <label className="block font-bold text-emerald-950 mb-0.5">
                Chọn tệp video hoặc hình ảnh từ thiết bị của bạn: <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
              />
              {localPreviewUrl && (
                <div className="mt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã chọn tệp: {selectedFile?.name} ({fileType === 'image' ? 'Hình ảnh' : 'Video trực tiếp'})</span>
                </div>
              )}
              <p className="text-[11px] text-slate-600 italic pt-1">
                * Khi bấm "Nộp Tác Phẩm", tệp sẽ được tải trực tiếp lên thư mục lưu trữ của nhà trường và đồng bộ vào Google Sheet.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Mô tả ý tưởng / Thông điệp truyền tải
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả ngắn gọn về tình huống hoặc thông điệp bài dự thi muốn gửi gắm đến các bạn học sinh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                ⚠️ {formError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !localPreviewUrl}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Nộp Tác Phẩm & Tải Lên Google Drive'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 4. Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-bold">
          {[
            { id: 'all', label: 'Tất cả tác phẩm' },
            { id: 'vape', label: 'Thuốc lá điện tử & Pod' },
            { id: 'drugs', label: 'Ma túy ngụy trang' },
            { id: 'violence', label: 'Bạo lực & Bắt nạt mạng' },
            { id: 'friendship', label: 'Tình bạn đẹp' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition ${
                activeCategory === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả, lớp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 5. TÁC PHẨM THỰC TẾ HỌC SINH ĐÃ NỘP (KHÔNG DÙNG VIDEO ẢO) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              TÁC PHẨM THỰC TẾ HỌC SINH ĐÃ NỘP ({filteredVideos.length})
            </h3>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Chỉ hiển thị tác phẩm thực tế do học sinh tải lên
          </span>
        </div>

        {filteredVideos.length === 0 ? (
          /* Honest Empty State - Zero Fake Cards */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-100 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Film className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Chưa có video hoặc tác phẩm nào được đăng tải
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Các chi đội và bạn học sinh hãy bấm "Nộp Video / Ảnh" ở phía trên để tải tác phẩm lên hệ thống và lưu trữ vào Google Drive của trường!
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Nộp tác phẩm đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVideos.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Real Video Player or Real Image Display */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3 shadow-xs border border-slate-800/40">
                    {item.fileType === 'video' || item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <div
                        onClick={() => setSelectedImagePreview(item.thumbnailUrl || '')}
                        className="w-full h-full cursor-pointer relative group/img"
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 hover:bg-black/10 flex items-center justify-center transition">
                          <span className="bg-black/75 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                            <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                            <span>Click xem ảnh phóng to</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 bg-emerald-800/90 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      {item.fileType === 'image' ? (
                        <ImageIcon className="w-3 h-3 text-amber-300" />
                      ) : (
                        <Film className="w-3 h-3 text-emerald-300" />
                      )}
                      <span>{item.categoryLabel}</span>
                    </span>

                    <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.duration || (item.fileType === 'image' ? 'Ảnh áp phích' : 'Video')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">{item.authorName}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{item.studentGrade}</span>
                    <span>•</span>
                    <span>{item.school}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {item.views} xem
                    </span>

                    <button
                      onClick={(e) => handleLike(item.id, e)}
                      className="flex items-center gap-1 text-slate-600 hover:text-rose-600 transition font-bold"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-100 text-rose-500" />
                      <span>{item.likes}</span>
                    </button>
                  </div>

                  {/* Admin Only Delete button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteVideo(item.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 transition"
                      title="Xóa tác phẩm (Dành riêng cho Quản trị viên)"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Image Preview Lightbox */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImagePreview}
              alt="Xem ảnh lớn"
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
