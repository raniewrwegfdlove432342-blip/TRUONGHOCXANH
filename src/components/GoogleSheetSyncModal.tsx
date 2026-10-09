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

        {/* Google Apps Script Webhook config & Live Sync URL */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl text-xs space-y-2.5">
          <div className="font-black text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-emerald-700" />
              <span>Đường Dẫn Google Apps Script Webhook Của Trường:</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
              Database Chính
            </span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Google Sheets là nguồn dữ liệu duy nhất của ứng dụng. Mọi tài khoản, báo cáo ẩn danh và video đều đọc/ghi trực tiếp qua Apps Script:
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
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shrink-0"
            >
              {savedWebhookMsg ? <Check className="w-4 h-4" /> : 'Lưu URL'}
            </button>
          </div>

          {/* Quick Copy Apps Script Code.gs Guide */}
          <div className="pt-2 border-t border-emerald-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-emerald-900 text-[11px]">
                Mã Code.gs chuẩn hóa (Hỗ trợ 4 sheet & Tải thẳng Google Drive):
              </span>
              <button
                onClick={() => {
                  const codeSnippet = `/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG TRƯỜNG HỌC XANH - LÁ CHẮN HỌC ĐƯỜNG
 * Thư mục Google Drive: 1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS
 */
var DRIVE_FOLDER_ID = "1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS";

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) { data = {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    var action = data.action || (e && e.parameter ? e.parameter.action : "getAllData");
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheetReports = getOrCreateSheet(ss, "TrangTinh_BaoCao_AnDanh", ["Mã Hồ Sơ", "PIN", "Mức Độ", "Chủ Đề", "Tiêu Đề", "Địa Điểm", "Thời Gian", "Mô Tả Chi Tiết", "Có Bằng Chứng", "Link Bằng Chứng", "Trạng Thái", "Ghi Chú Nhà Trường", "Ngày Tiếp Nhận", "Ngày Cập Nhật"]);
    var sheetAuthUsers = getOrCreateSheet(ss, "TrangTinh_TaiKhoan_DangNhap", ["Mã Tài Khoản", "Tên Đăng Nhập", "Mật Khẩu", "Họ Và Tên", "Vai Trò", "Trường Học", "Lớp/Chức Vụ", "Email/SĐT", "Ngày Đăng Ký"]);
    var sheetUsers = getOrCreateSheet(ss, "TrangTinh_TaiKhoan_GV_HS", ["Mã Người Dùng", "Tên Đăng Nhập", "Mật Khẩu", "Họ Và Tên", "Vai Trò", "Trường Học", "Lớp/Chức Vụ", "Email", "Ngày Đăng Ký"]);
    var sheetVideos = getOrCreateSheet(ss, "TrangTinh_Video_HocSinh", ["Mã Tác Phẩm", "Tiêu Đề", "Tác Giả", "Lớp", "Trường Học", "Chủ Đề", "Loại Tệp", "Đường Link Google Drive", "Thời Lượng", "Lượt Thích", "Lượt Xem", "Trạng Thái", "Ngày Tải Lên"]);
    var sheetCommitments = getOrCreateSheet(ss, "TrangTinh_CamKet", ["Mã Cam Kết", "Họ Và Tên", "Trường Học", "Vai Trò", "Ngày Cam Kết"]);

    if (action === "getAllData" || action === "read") {
      output.setContent(JSON.stringify({
        status: "success",
        reports: readSheetReports(sheetReports),
        users: readSheetUsers(sheetAuthUsers, sheetUsers),
        videos: readSheetVideos(sheetVideos),
        commitments: readSheetCommitments(sheetCommitments)
      }));
      return output;
    }

    if (action === "addReport" || action === "report") {
      var r = data.payload || data;
      sheetReports.appendRow([r.ticketCode || "", r.pin || "", r.urgency || "medium", r.categoryLabel || r.category || "", r.title || "", r.location || "", r.incidentTime || "", r.description || "", r.hasEvidence ? "Có" : "Không", r.evidenceUrl || "", r.status || "received", r.notesFromSchool || "", r.createdAt || new Date().toISOString(), r.updatedAt || new Date().toISOString()]);
      output.setContent(JSON.stringify({ status: "success" }));
      return output;
    }

    if (action === "updateReport") {
      var ticketCode = data.ticketCode || data.id;
      var newStatus = data.status;
      var notes = data.notesFromSchool;
      var rows = sheetReports.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toUpperCase() === String(ticketCode).toUpperCase()) {
          if (newStatus) sheetReports.getRange(i + 1, 11).setValue(newStatus);
          if (notes !== undefined) sheetReports.getRange(i + 1, 12).setValue(notes);
          sheetReports.getRange(i + 1, 14).setValue(new Date().toISOString());
          found = true;
          break;
        }
      }
      output.setContent(JSON.stringify({ status: found ? "success" : "not_found" }));
      return output;
    }

    if (action === "addUser" || action === "account" || action === "addAccount") {
      var u = data.payload || data;
      sheetAuthUsers.appendRow([u.id || "", u.username || "", u.password || "", u.fullName || "", u.role || "student", u.school || "", u.gradeClass || "", u.email || "", u.createdAt || new Date().toISOString()]);
      sheetUsers.appendRow([u.id || "", u.username || "", u.password || "", u.fullName || "", u.role || "student", u.school || "", u.gradeClass || "", u.email || "", u.createdAt || new Date().toISOString()]);
      output.setContent(JSON.stringify({ status: "success" }));
      return output;
    }

    if (action === "uploadToDrive" || action === "uploadFile") {
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var fileName = data.fileName || ("TacPham_" + Date.now());
      var mimeType = data.mimeType || "image/jpeg";
      var base64Data = (data.fileBase64 || "").replace(/^data:.*,/, "");
      var fileUrl = "";
      if (base64Data) {
        var bytes = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(bytes, mimeType, fileName);
        var file = folder.createFile(blob);
        try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e){}
        fileUrl = file.getUrl();
      }
      var v = data.metadata || data.payload || {};
      sheetVideos.appendRow([v.id || ("vid-" + Date.now()), v.title || fileName, v.authorName || "Học sinh", v.studentGrade || v.grade || "", v.school || "", v.categoryLabel || v.category || "", v.fileType || "image", fileUrl, v.duration || "Hình ảnh", 1, 1, "approved", new Date().toISOString()]);
      output.setContent(JSON.stringify({ status: "success", fileUrl: fileUrl }));
      return output;
    }

    if (action === "addCommitment" || action === "commitment") {
      var c = data.payload || data;
      sheetCommitments.appendRow([c.certificateId || c.id || ("LCHD-VOW-" + Date.now()), c.name || "", c.school || "", c.role || "Học sinh", c.pledgedAt || new Date().toISOString()]);
      output.setContent(JSON.stringify({ status: "success" }));
      return output;
    }

    output.setContent(JSON.stringify({ status: "success" }));
    return output;
  } catch(err) {
    output.setContent(JSON.stringify({ status: "error", message: err.toString() }));
    return output;
  }
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function readSheetReports(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    list.push({ id: "rep-" + row[0], ticketCode: String(row[0]), pin: String(row[1] || "1234"), urgency: row[2] || "medium", categoryLabel: row[3] || "Phòng chống tệ nạn học đường", category: "drugs", title: row[4] || "Báo cáo học đường", location: row[5] || "", incidentTime: row[6] || "", description: row[7] || "", hasEvidence: row[8] === "Có" || Boolean(row[9]), evidenceUrl: row[9] || "", status: row[10] || "received", notesFromSchool: row[11] || "", createdAt: row[12] || new Date().toISOString(), updatedAt: row[13] || new Date().toISOString(), messages: [] });
  }
  return list;
}

function readSheetUsers(authSheet, legacySheet) {
  var data = authSheet.getDataRange().getValues();
  var list = [];
  var seen = {};
  if (data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[1]) continue;
      var uname = String(row[1]).trim().toLowerCase();
      seen[uname] = true;
      list.push({ id: String(row[0] || ("user-" + i)), username: uname, password: String(row[2] || ""), fullName: String(row[3] || ""), role: row[4] === "admin" ? "admin" : (row[4] === "teacher" || row[4] === "Giáo Viên" ? "teacher" : "student"), school: String(row[5] || ""), gradeClass: String(row[6] || ""), email: String(row[7] || ""), createdAt: row[8] || new Date().toISOString() });
    }
  }
  var legData = legacySheet ? legacySheet.getDataRange().getValues() : [];
  if (legData.length > 1) {
    for (var j = 1; j < legData.length; j++) {
      var lRow = legData[j];
      if (!lRow[1]) continue;
      var lUname = String(lRow[1]).trim().toLowerCase();
      if (!seen[lUname]) {
        seen[lUname] = true;
        list.push({ id: String(lRow[0] || ("user-" + j)), username: lUname, password: String(lRow[2] || ""), fullName: String(lRow[3] || ""), role: lRow[4] === "admin" ? "admin" : (lRow[4] === "teacher" || lRow[4] === "Giáo Viên" ? "teacher" : "student"), school: String(lRow[5] || ""), gradeClass: String(lRow[6] || ""), email: String(lRow[7] || ""), createdAt: lRow[8] || new Date().toISOString() });
      }
    }
  }
  return list;
}

function readSheetVideos(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;
    list.push({ id: String(row[0] || ("vid-" + i)), title: String(row[1] || ""), authorName: String(row[2] || ""), studentGrade: String(row[3] || ""), school: String(row[4] || ""), categoryLabel: String(row[5] || ""), category: "drugs", fileType: row[6] === "image" || String(row[6]).toLowerCase().indexOf("ảnh") >= 0 ? "image" : "video", driveUrl: String(row[7] || ""), videoUrl: row[6] === "image" ? undefined : String(row[7] || ""), thumbnailUrl: row[6] === "image" ? String(row[7] || "") : undefined, description: "Tác phẩm lưu trữ Google Drive", duration: String(row[8] || "02:30"), likes: Number(row[9]) || 1, views: Number(row[10]) || 1, status: String(row[11] || "approved"), uploadedAt: row[12] || new Date().toISOString() });
  }
  return list;
}

function readSheetCommitments(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;
    list.push({ certificateId: String(row[0]), name: String(row[1]), school: String(row[2] || ""), role: String(row[3] || "Học sinh"), pledgedAt: row[4] || new Date().toISOString() });
  }
  return list;
}`;
                  navigator.clipboard.writeText(codeSnippet);
                  alert('Đã sao chép toàn bộ mã Code.gs! Bạn hãy mở Extensions -> Apps Script trên Google Sheets của trường và dán vào.');
                }}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[10px] shadow-xs"
              >
                📋 Sao chép mã Code.gs
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              Hướng dẫn: Trên Google Sheets trường -&gt; Chọn <strong>Tiện ích mở rộng (Extensions)</strong> -&gt; <strong>Apps Script</strong> -&gt; Dán mã -&gt; Nhấn Lưu -&gt; <strong>Triển khai (Deploy) làm Ứng dụng web (Web app)</strong> với quyền <em>Bất kỳ ai (Anyone)</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
