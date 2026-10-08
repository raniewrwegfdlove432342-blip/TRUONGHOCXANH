import React, { useState } from 'react';
import { X, User, Lock, Sparkles, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [gradeClass, setGradeClass] = useState('');
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
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            fullName,
            school: school || 'Trường THCS / THPT Thân Yêu',
            gradeClass: gradeClass || 'Toàn trường',
            email,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessMsg('Đăng ký thành công! Đang đăng nhập...');
          setTimeout(() => {
            onLoginSuccess(data.user);
            onClose();
          }, 800);
        } else {
          setErrorMsg(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (res.ok) {
          onLoginSuccess(data.user);
          onClose();
        } else {
          setErrorMsg(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
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
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>HỆ THỐNG XÁC THỰC TRƯỜNG HỌC XANH</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị viên (admin / admin) và thành viên toàn trường
          </p>
        </div>

        {/* Quick Admin Login Box */}
        {!isRegisterMode && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="text-[11px] font-bold text-amber-950 mb-1.5 flex items-center justify-between">
              <span>Tài khoản Quản Trị Viên (Admin):</span>
              <span className="text-[10px] text-amber-700 font-mono font-bold">tk: admin | mk: admin</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin');
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98"
            >
              <span>🔑 Điền nhanh tài khoản Admin (admin / admin)</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên đầy đủ: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Phương Linh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {isRegisterMode && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trường học:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: THCS Lê Quý Đôn"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lớp học:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lớp 9A2"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên đăng nhập (Username): <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ví dụ: lebaongoc hoặc gv_an"
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
              <strong>Lưu trữ tập trung:</strong> Mọi tài khoản và báo cáo mới sẽ được tự động lưu và đồng bộ lên Google Sheet quản lý của nhà trường.
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
            {loading ? 'Đang xử lý...' : isRegisterMode ? 'Đăng Ký & Đồng Bộ Google Sheet' : 'Đăng Nhập Hệ Thống'}
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
                Tạo tài khoản thành viên mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
