import React, { useState, useRef, useEffect } from 'react';
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
  FolderOpen,
  BookOpen,
  CheckSquare,
  Gamepad2,
  Bot,
  Home,
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside without blocking any buttons
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const showVideoNav = true; // Always visible so all students and users can watch videos

  return (
    <>
      {/* Top Banner & Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        {/* Urgent Hotline Bar */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs overflow-hidden">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium text-[11px] sm:text-xs truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Tổng đài 24/7:</span>
              <span className="sm:hidden font-bold">Hotline:</span>
              <a
                href="tel:111"
                className="bg-white/15 hover:bg-white/25 px-1.5 py-0.5 rounded font-bold transition text-emerald-100 flex items-center gap-1"
                title="Tổng đài Quốc gia Bảo vệ Trẻ em"
              >
                <PhoneCall className="w-3 h-3 text-emerald-300 shrink-0 hidden xs:inline" />
                <span>111</span>
                <span className="hidden sm:inline font-normal">(Trẻ em)</span>
              </a>
              <span className="text-emerald-400/60">|</span>
              <a
                href="tel:113"
                className="bg-white/15 hover:bg-white/25 px-1.5 py-0.5 rounded font-bold transition text-emerald-100"
                title="Cảnh sát khẩn cấp"
              >
                113
              </a>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {currentUser?.role === 'admin' ? (
                <>
                  <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md text-[10px] flex items-center gap-1 shadow-xs">
                    <Shield className="w-2.5 h-2.5 text-slate-950" />
                    <span>Admin</span>
                  </span>
                  <button
                    onClick={onOpenGoogleSheetSync}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-700/90 hover:bg-emerald-600 text-emerald-100 font-bold border border-emerald-500/40 transition flex items-center gap-1"
                    title="Quản lý và đồng bộ dữ liệu vào Google Sheet"
                  >
                    <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-300" />
                    <span className="hidden sm:inline">Google Sheet</span>
                    <span className="sm:hidden">Sheet</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-emerald-100 font-medium border border-white/20 transition flex items-center gap-1"
                  title="Đăng nhập tài khoản"
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 relative">
          {/* Logo & School Branding */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0 shrink"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-linear-to-tr from-emerald-700 via-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[8px] sm:text-[9px] text-white px-1 rounded-full font-bold">
                XANH
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-emerald-900 leading-tight truncate">
                  TRƯỜNG HỌC XANH
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Mầm Sống Khỏe
                </span>
              </div>
              <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Tâm Sáng – Thân Trong – Trí Kiên • Trọn Tuổi Hoa Học Đường
              </p>
              <p className="sm:hidden text-[10px] text-emerald-700 font-bold truncate">
                Lá Chắn An Toàn Học Đường
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Student Video tab shortcut on large screens */}
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200 shadow-2xs active:scale-95"
                  title="Nhấn để xem menu chức năng tài khoản"
                >
                  <img
                    src={currentUser.avatarUrl || '/images/hero_primary_students.jpg'}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-emerald-500/30"
                  />
                  <span className="truncate max-w-[80px] sm:max-w-[130px]">{currentUser.fullName}</span>
                  {currentUser.role === 'admin' ? (
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black shrink-0 shadow-xs">
                      Admin
                    </span>
                  ) : currentUser.role === 'teacher' ? (
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold border border-teal-200 shrink-0">
                      GV
                    </span>
                  ) : (
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shrink-0">
                      HS
                    </span>
                  )}
                </button>

                {/* Dropdown Menu - Full Functional Menu with Direct Access to All Features */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95">
                    {/* User Profile Info Card */}
                    <div className="border-b border-slate-100 pb-2.5">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-slate-900 text-sm truncate">{currentUser.fullName}</div>
                        <span className="text-[10px] text-emerald-800 font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 shrink-0">
                          {currentUser.role === 'admin'
                            ? 'Admin Quản Trị'
                            : currentUser.role === 'teacher'
                            ? 'Giáo Viên'
                            : 'Học Sinh'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {currentUser.school} • {currentUser.gradeClass}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Tài khoản: {currentUser.username}
                      </div>
                    </div>

                    {/* Danh sách ĐẦY ĐỦ các nút chức năng để không bao giờ bị ẩn */}
                    <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-0.5">
                        Menu chức năng ứng dụng
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('home');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'home' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Home className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Trang Chủ Trường Học Xanh</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('student-videos');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'student-videos' ? 'bg-teal-100 text-teal-900' : 'hover:bg-teal-50 text-teal-900'
                        }`}
                      >
                        <Film className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Video Học Sinh & GD (Tất Cả Xem Được)</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('report');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'report' ? 'bg-rose-100 text-rose-900' : 'hover:bg-rose-50 text-rose-900'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Cổng Báo Cáo Sự Việc (Ẩn Danh)</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('knowledge');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'knowledge' ? 'bg-blue-100 text-blue-900' : 'hover:bg-blue-50 text-blue-900'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Báo Chí, Y Tế & An Ninh Mạng</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('quiz');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'quiz' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Trắc Nghiệm Kiến Thức 10 Câu</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('games');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'games' ? 'bg-purple-100 text-purple-900' : 'hover:bg-purple-50 text-purple-900'
                        }`}
                      >
                        <Gamepad2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>8 Trò Chơi Giáo Dục An Toàn</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('ai');
                        }}
                        className={`w-full text-left p-2 rounded-xl font-bold flex items-center gap-2 transition ${
                          activeTab === 'ai' ? 'bg-amber-100 text-amber-900' : 'hover:bg-amber-50 text-amber-900'
                        }`}
                      >
                        <Bot className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Cố Vấn AI Học Đường 24/7</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenCommitment();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-2 transition"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Ký Cam Kết Trường Học Xanh</span>
                      </button>

                      {/* Quản trị viên Admin */}
                      {currentUser.role === 'admin' && (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider px-2">
                            Quyền Quản Trị Viên (Admin)
                          </div>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenGoogleSheetSync();
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-amber-950 font-bold flex items-center gap-2 transition"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Quản Trị Google Sheet Dữ Liệu</span>
                          </button>

                          <a
                            href="https://drive.google.com/drive/folders/1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-amber-950 font-bold flex items-center gap-2 transition"
                          >
                            <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Thư Mục Google Drive Trường</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-red-50 text-red-600 font-bold flex items-center gap-2 transition"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1 sm:gap-1.5 border border-emerald-300 transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Đăng Nhập / Quản Trị</span>
                <span className="sm:hidden">Đăng nhập</span>
              </button>
            )}

            {/* Quick Report Emergency Button */}
            <button
              onClick={() => setActiveTab('report')}
              className="relative px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 shadow-md shadow-red-500/25 active:scale-95 transition shrink-0"
              title="Báo Cáo Ẩn Danh"
            >
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 animate-bounce shrink-0" />
              <span className="sm:hidden">Báo Cáo</span>
              <span className="hidden sm:inline">Báo Cáo Ẩn Danh</span>
            </button>

            {/* Help Dialog */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition shrink-0 hidden xs:flex"
              title="Hướng dẫn bảo vệ bản thân & Đường dây nóng"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl md:hidden transition shrink-0"
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
