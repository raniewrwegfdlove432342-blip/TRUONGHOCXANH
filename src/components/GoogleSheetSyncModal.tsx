import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Download,
  Users,
  Shield,
  Video as VideoIcon,
  Sparkles,
  Link2,
  Check,
} from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [syncData, setSyncData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savedWebhookMsg, setSavedWebhookMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSyncStatus();
    }
  }, [isOpen]);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync/googlesheet/status');
      const data = await res.json();
      setSyncData(data);
      if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
    } catch (err) {
      console.error('Failed to get sync status:', err);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/googlesheet/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchSyncStatus();
      }
    } catch (err) {
      alert('Lỗi đồng bộ dữ liệu.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveWebhook = async () => {
    try {
      const res = await fetch('/api/sync/googlesheet/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedWebhookMsg(true);
        setTimeout(() => setSavedWebhookMsg(false), 2000);
      }
    } catch (err) {
      alert('Lỗi lưu cấu hình Webhook.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 my-8 border border-emerald-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>HỆ THỐNG LƯU TRỮ GOOGLE SHEETS TỰ ĐỘNG</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Quản Lý & Đồng Bộ Dữ Liệu Google Sheet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mọi tài khoản GV/HS mới, báo cáo sự việc ẩn danh và video đều được lưu trữ tập trung
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-lg font-black text-emerald-950">
              {syncData?.totalAccountsSynced || 3}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">Tài Khoản GV & HS</div>
          </div>

          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
            <Shield className="w-5 h-5 text-teal-600 mx-auto mb-1" />
            <div className="text-lg font-black text-teal-950">
              {syncData?.totalReportsSynced || 3}
            </div>
            <div className="text-[10px] text-teal-700 font-bold">Báo Cáo Ẩn Danh</div>
          </div>

          <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200">
            <VideoIcon className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
            <div className="text-lg font-black text-cyan-950">
              {syncData?.totalVideosSynced || 2}
            </div>
            <div className="text-[10px] text-cyan-700 font-bold">Video Học Sinh</div>
          </div>
        </div>

        {/* Sheet status bar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Trạng thái đồng bộ:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Đang hoạt động (Tự động lưu)
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Thời điểm đồng bộ gần nhất:</span>
            <span className="font-semibold text-slate-700">
              {syncData?.lastSyncedAt
                ? new Date(syncData.lastSyncedAt).toLocaleString('vi-VN')
                : 'Vừa xong'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-600 truncate max-w-[280px]">
              Bảng tính: <strong>TRUONGHOCXANH_DATABASE_2026</strong>
            </span>
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Đồng bộ ngay</span>
            </button>
          </div>
        </div>

        {/* Export Excel (.xlsx) and CSV for Google Sheets */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Xuất toàn bộ hệ thống ra file Excel (.xlsx):</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Chuẩn thể thức 4 Sheet
            </span>
          </div>

          <a
            href="/api/sync/excel/export"
            download
            className="w-full p-3 bg-linear-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-center text-xs font-black flex items-center justify-center gap-2 transition shadow-md active:scale-98"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Tải Sổ Dữ Liệu Tổng Hợp Excel (.xlsx) - Đầy Đủ 4 Sheet</span>
          </a>

          <div className="text-[11px] font-bold text-slate-600 pt-1">
            Hoặc xuất từng bảng riêng dạng CSV nhập vào Google Sheets:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a
              href="/api/sync/googlesheet/export-csv?type=accounts"
              download
              className="p-2.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-center text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Bảng Tài Khoản</span>
            </a>

            <a
              href="/api/sync/googlesheet/export-csv?type=reports"
              download
              className="p-2.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-center text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Bảng Báo Cáo</span>
            </a>

            <a
              href="/api/sync/googlesheet/export-csv?type=videos"
              download
              className="p-2.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-center text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Bảng Video HS</span>
            </a>
          </div>
        </div>

        {/* Google Apps Script Webhook config (Optional live hook) */}
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs space-y-2">
          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-emerald-700" />
            <span>Kết nối Google Apps Script Webhook của trường (Tùy chọn):</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Dán đường dẫn Webhook Deploy từ Google Sheet của trường để đẩy thẳng từng dòng vào bảng tính thật:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
            />
            <button
              onClick={handleSaveWebhook}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs"
            >
              {savedWebhookMsg ? <Check className="w-4 h-4" /> : 'Lưu URL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
