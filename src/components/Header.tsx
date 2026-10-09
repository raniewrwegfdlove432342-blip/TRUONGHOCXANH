import React, { useState } from 'react';
import {
  Shield,
  PhoneCall,
  AlertTriangle,
  HelpCircle,
  Lock,
  Menu,
  X,
  Sparkles,
  UserCheck,
  User,
  LogOut,
  FileSpreadsheet,
  Film,
  GraduationCap,
  School,
} from 'lucide-react';
import { ActiveTab, UserAccount } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCommitment: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenGoogleSheetSync: () => void;
  hasVideos?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommitment,
  isAdminMode,
  setIsAdminMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenGoogleSheetSync,
  hasVideos = false,
}) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const showVideoNav = hasVideos || currentUser?.role === 'admin' || activeTab === 'student-videos';

  return (
    <>
      {/* Top Banner & Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        {/* Urgent Hotline Bar */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-3 py-1.5 text-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Đường dây nóng khẩn cấp 24/7 (Miễn cước):</span>
              <span className="sm:hidden">Hotline:</span>
              <a
                href="tel:111"
                className="bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded font-bold transition text-emerald-100"
              >
                Tổng đài 111 (Trẻ em)
              </a>
              <span className="text-emerald-300">|</span>
              <a
                href="tel:113"
                className="bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded font-bold transition text-emerald-100"
              >
                Cảnh sát 113
              </a>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.role === 'admin' ? (
                <>
                  <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 shadow-xs">
                    <Shield className="w-3 h-3 text-slate-950" />
                    <span>Admin</span>
                  </span>
                  <button
                    onClick={onOpenGoogleSheetSync}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 font-bold border border-emerald-500/40 transition flex items-center gap-1"
                    title="Quản lý và đồng bộ dữ liệu vào Google Sheet"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
                    <span>Google Sheet</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 font-medium border border-white/20 transition flex items-center gap-1"
                  title="Đăng nhập tài khoản Quản trị & Thầy Cô"
                >
                  <Lock className="w-3 h-3" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo & School Branding */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-700 via-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
                <Shield className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[9px] text-white px-1 rounded-full font-bold">
                XANH
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-emerald-900 leading-tight">
                  TRƯỜNG HỌC XANH
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Mầm Sống Khỏe
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Tâm Sáng – Thân Trong – Trí Kiên • Trọn Tuổi Hoa Học Đường
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Student Video tab shortcut */}
            {showVideoNav && (
              <button
                onClick={() => setActiveTab('student-videos')}
                className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition"
              >
                <Film className="w-3.5 h-3.5 text-teal-600" />
                <span>Video Học Sinh</span>
              </button>
            )}

            {/* User Account Login / Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt="Avatar"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
                  {currentUser.role === 'admin' ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black">
                      Admin
                    </span>
                  ) : currentUser.role === 'teacher' ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold border border-teal-200">
                      GV
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      HS
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="font-bold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {currentUser.school} • {currentUser.gradeClass}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                        {currentUser.role === 'admin'
                          ? '🛡️ Quyền: Quản Trị Viên (Admin)'
                          : currentUser.role === 'teacher'
                          ? '👨‍🏫 Quyền: Thầy Cô / Giáo Viên (GV)'
                          : '🎓 Quyền: Học Sinh (HS)'}
                      </div>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenGoogleSheetSync();
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Xem Bảng Google Sheet</span>
                      </button>
                    )}

                    {showVideoNav && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('student-videos');
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Góc Video Của Học Sinh</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-red-50 text-red-600 font-bold flex items-center gap-1.5 border-t border-slate-100 pt-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Đăng Nhập / Quản Trị</span>
              </button>
            )}

            {/* Quick Report Emergency Button */}
            <button
              onClick={() => setActiveTab('report')}
              className="relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-red-500/25 active:scale-95 transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce" />
              <span>Báo Cáo Ẩn Danh</span>
            </button>

            {/* Help Dialog */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
              title="Hướng dẫn bảo vệ bản thân & Đường dây nóng"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl md:hidden transition"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                🏠 Trang chủ
              </button>
              <button
                onClick={() => {
                  setActiveTab('knowledge');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'knowledge' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                📖 Báo chí & An ninh mạng
              </button>
              {showVideoNav && (
                <button
                  onClick={() => {
                    setActiveTab('student-videos');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-left ${activeTab === 'student-videos' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  🎥 Video học sinh tải lên
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('quiz');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'quiz' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                📝 Trắc nghiệm 10 câu
              </button>
              <button
                onClick={() => {
                  setActiveTab('games');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'games' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                🎮 8 Trò chơi giáo dục
              </button>
              <button
                onClick={() => {
                  setActiveTab('ai');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'ai' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                👮 Cố vấn AI học đường
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    onOpenGoogleSheetSync();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg text-left text-emerald-800 font-bold bg-emerald-50"
                >
                  📊 Xem Google Sheet
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  onOpenCommitment();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Ký Cam Kết Trường Học Xanh
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Emergency Guidance Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Khi Bạn Cần Giúp Đỡ Khẩn Cấp</h3>
                <p className="text-xs text-slate-500">Chúng tôi luôn ở bên bạn 24/7</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-red-800 text-sm">Tổng đài Quốc Gia 111</div>
                  <div className="text-xs text-red-600">Bảo vệ trẻ em khỏi bạo lực, xâm hại & lôi kéo</div>
                </div>
                <a
                  href="tel:111"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Gọi 111
                </a>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 text-sm">Cảnh sát Phản ứng nhanh 113</div>
                  <div className="text-xs text-blue-700">Tố giác tội phạm tàng trữ, buôn bán ma túy</div>
                </div>
                <a
                  href="tel:113"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Gọi 113
                </a>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Cấp cứu Y tế 115</div>
                  <div className="text-xs text-slate-600">Ngộ độc cấp do dùng chất lạ hoặc chấn thương</div>
                </div>
                <a
                  href="tel:115"
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Gọi 115
                </a>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 mb-5 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <span>
                <strong>Bảo mật thông tin:</strong> Nếu em phát hiện hành vi bạo lực, hút Pod hay buôn bán ma túy quanh trường, hãy dùng tính năng <strong>Báo Cáo Ẩn Danh</strong>. Hệ thống không lưu bất kỳ thông tin nhận dạng cá nhân nào của em.
              </span>
            </div>

            <button
              onClick={() => {
                setShowEmergencyModal(false);
                setActiveTab('report');
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition"
            >
              Mở Hộp Thư Báo Cáo Ẩn Danh Ngay
            </button>
          </div>
        </div>
      )}
    </>
  );
};
