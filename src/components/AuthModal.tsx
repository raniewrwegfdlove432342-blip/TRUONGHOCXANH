import React, { useState } from 'react';
import { X, User, Lock, Sparkles, CheckCircle2, AlertCircle, FileSpreadsheet, GraduationCap, School } from 'lucide-react';
import { UserAccount } from '../types';
import { authenticateUser, registerNewUser } from '../utils/googleSheetsClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [departmentOrTitle, setDepartmentOrTitle] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        const payloadRole = registerRole;
        const payloadGradeClass =
          payloadRole === 'teacher'
            ? departmentOrTitle.trim() || 'Giáo viên bộ môn'
            : gradeClass.trim() || 'Học sinh toàn trường';

        const result = await registerNewUser({
          username,
          password,
          fullName,
          role: payloadRole,
          school: school.trim() || 'Trường THCS / THPT Thân Yêu',
          gradeClass: payloadGradeClass,
          email: email.trim(),
          studentCode: payloadRole === 'student' ? studentCode.trim() : undefined,
        });

        if (result.success && result.user) {
          setSuccessMsg(
            `Đăng ký tài khoản ${payloadRole === 'teacher' ? 'Thầy Cô (GV)' : 'Học Sinh (HS)'} thành công! Đang đăng nhập...`
          );
          setTimeout(() => {
            onLoginSuccess(result.user!);
            onClose();
          }, 800);
        } else {
          setErrorMsg(result.error || 'Đăng ký không thành công. Vui lòng thử lại.');
        }
      } else {
        const result = await authenticateUser(username, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
          onClose();
        } else {
          setErrorMsg(result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
      }
    } catch {
      // In case of unexpected client issue
      setErrorMsg('Vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 my-8 border border-emerald-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>HỆ THỐNG XÁC THỰC TRƯỜNG HỌC XANH</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isRegisterMode ? 'Đăng Ký Tài Khoản Mới' : 'Đăng Nhập'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegisterMode
              ? 'Tùy chọn đăng ký dành riêng cho Giáo viên (GV) hoặc Học sinh (HS)'
              : 'Hệ thống đăng nhập dành cho Quản trị viên, Thầy Cô và Học sinh'}
          </p>
        </div>

        {/* 2 Modes Role Selector for Registration */}
        {isRegisterMode && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn đối tượng đăng ký tài khoản: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegisterRole('student')}
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition ${
                  registerRole === 'student'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${registerRole === 'student' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>🎓 Học Sinh (HS)</span>
              </button>

              <button
                type="button"
                onClick={() => setRegisterRole('teacher')}
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition ${
                  registerRole === 'teacher'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <School className={`w-4 h-4 ${registerRole === 'teacher' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>👨‍🏫 Giáo Viên (GV)</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {registerRole === 'teacher' ? 'Họ và tên Thầy / Cô:' : 'Họ và tên Học sinh:'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={registerRole === 'teacher' ? 'Ví dụ: Cô Nguyễn Thị Mai' : 'Ví dụ: Trần Minh Đức'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {isRegisterMode && registerRole === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trường học: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: THCS Chu Văn An"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp / Khối: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lớp 8A3"
                    value={gradeClass}
                    onChange={(e) => setGradeClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã học sinh / Số thẻ học sinh (nếu có):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: HS2026-88 (không bắt buộc)"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </>
          )}

          {isRegisterMode && registerRole === 'teacher' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trường công tác: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tổ chuyên môn / Chức vụ / Bộ môn: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: GVCN Lớp 10A1 / Tổ Khoa Học Xã Hội / Tổng Phụ Trách"
                  value={departmentOrTitle}
                  onChange={(e) => setDepartmentOrTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email công tác / SĐT liên hệ:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: giaovien@hanoiamsterdam.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên đăng nhập (Username): <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={isRegisterMode ? (registerRole === 'teacher' ? 'Ví dụ: gv_maith' : 'Ví dụ: lebaongoc_8a') : 'Nhập tên đăng nhập...'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu: <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Google Sheets Sync Assurance Note */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu trữ trực tuyến:</strong> Tài khoản và mật khẩu được lưu vào trang tính <code>TrangTinh_TaiKhoan_DangNhap</code> trên Google Sheets, cho phép đăng nhập từ bất kỳ thiết bị nào.
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50"
          >
            {loading
              ? 'Đang xử lý...'
              : isRegisterMode
              ? `Đăng Ký Tài Khoản ${registerRole === 'teacher' ? 'Giáo Viên' : 'Học Sinh'} & Lưu Google Sheet`
              : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          {isRegisterMode ? (
            <div>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMsg('');
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <div>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMsg('');
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Tạo tài khoản mới (GV & HS)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

