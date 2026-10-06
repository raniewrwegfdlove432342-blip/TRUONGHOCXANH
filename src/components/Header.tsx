import React, { useState } from 'react';
import { Shield, PhoneCall, AlertTriangle, HelpCircle, Lock, Menu, X, Sparkles, UserCheck } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCommitment: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommitment,
  isAdminMode,
  setIsAdminMode,
}) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Banner & Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        {/* Urgent Hotline Bar */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-3 py-1.5 text-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Đường dây nóng khẩn cấp 24/7 (Miễn cước):</span>
              <span className="sm:hidden">Hotline:</span>
              <a href="tel:111" className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded font-bold transition">
                Tổng đài 111 (Trẻ em)
              </a>
              <span className="text-blue-200">|</span>
              <a href="tel:113" className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded font-bold transition">
                Cảnh sát 113
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`text-[11px] px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                  isAdminMode
                    ? 'bg-amber-500 border-amber-300 text-slate-900 font-bold'
                    : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                }`}
                title="Chuyển chế độ Quản trị nhà trường để xem danh sách báo cáo"
              >
                <UserCheck className="w-3 h-3" />
                <span className="hidden md:inline">Chế độ:</span> {isAdminMode ? 'Cán Bộ Tiếp Nhận' : 'Học Sinh'}
              </button>
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
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <Shield className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[9px] text-white px-1 rounded-full font-bold">
                24/7
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-emerald-800 leading-tight">
                  TRƯỜNG HỌC XANH
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Lá Chắn Học Đường • An toàn hôm nay – Tương lai ngày mai
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
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
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition"
              title="Hướng dẫn bảo vệ bản thân & Đường dây nóng"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl md:hidden transition"
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
                className={`p-2.5 rounded-lg text-left ${activeTab === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                🏠 Trang chủ
              </button>
              <button
                onClick={() => {
                  setActiveTab('knowledge');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'knowledge' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                📖 Cẩm nang nhận diện
              </button>
              <button
                onClick={() => {
                  setActiveTab('quiz');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'quiz' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                📝 Trắc nghiệm 10 câu
              </button>
              <button
                onClick={() => {
                  setActiveTab('games');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'games' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                🎮 8 Trò chơi giáo dục
              </button>
              <button
                onClick={() => {
                  setActiveTab('video');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'video' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                🎥 Video tuyên truyền
              </button>
              <button
                onClick={() => {
                  setActiveTab('ai');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left ${activeTab === 'ai' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                👮 Cố vấn AI học đường
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  onOpenCommitment();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ký Cam Kết An Toàn
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

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 mb-5 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>
                <strong>Cam kết ẩn danh:</strong> Nếu em phát hiện hành vi bạo lực, hút Pod hay buôn bán ma túy quanh trường, hãy dùng tính năng <strong>Báo Cáo Ẩn Danh</strong>. Hệ thống không lưu bất kỳ thông tin cá nhân nào của em.
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
