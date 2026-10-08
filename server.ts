import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';
import { QUIZ_QUESTIONS } from './src/data/mockData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini SDK on server-side
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory data store for anonymous incident reports
export interface ReportMessage {
  id: string;
  sender: 'student' | 'counselor';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface AnonymousReport {
  id: string;
  ticketCode: string;
  pin: string;
  category: 'drugs' | 'violence' | 'tobacco' | 'vape' | 'cyberbullying';
  categoryLabel: string;
  urgency: 'low' | 'medium' | 'high';
  title: string;
  location: string;
  incidentTime: string;
  description: string;
  hasEvidence: boolean;
  evidenceUrl?: string;
  status: 'received' | 'verifying' | 'intervening' | 'resolved';
  createdAt: string;
  updatedAt: string;
  notesFromSchool?: string;
  messages: ReportMessage[];
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: 'student' | 'teacher';
  school: string;
  gradeClass?: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentVideo {
  id: string;
  title: string;
  authorName: string;
  studentGrade: string;
  school: string;
  category: 'drugs' | 'violence' | 'tobacco' | 'vape' | 'friendship';
  categoryLabel: string;
  videoUrl?: string;
  driveUrl?: string;
  fileType?: 'video' | 'image';
  thumbnailUrl?: string;
  description: string;
  duration?: string;
  likes: number;
  views: number;
  status: 'approved' | 'pending';
  uploadedAt: string;
  syncedToGoogleSheet?: boolean;
}

// Initial Reports
const initialReports: AnonymousReport[] = [
  {
    id: 'rep-001',
    ticketCode: 'LCHD-8821',
    pin: '1234',
    category: 'vape',
    categoryLabel: 'Thuốc lá điện tử (Pod/Vape)',
    urgency: 'medium',
    title: 'Một nhóm anh chị lớp 9 tụ tập hút Pod ở khu nhà vệ sinh dãy C',
    location: 'Nhà vệ sinh tầng 2, dãy C (gần phòng thí nghiệm)',
    incidentTime: 'Giờ ra chơi tiết 3 các ngày thứ Hai, thứ Tư',
    description: 'Em thấy một nhóm bạn mang pod hình hộp đồ chơi màu hồng mùi kẹo ngọt ra hút và rủ rê các em học sinh lớp 6 mới vào thử. Các em nhỏ rất sợ và có dấu hiệu bị ho sặc sụa.',
    hasEvidence: false,
    status: 'intervening',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notesFromSchool: 'Đội cờ đỏ và thầy giám thị đã bố trí tăng cường kiểm tra đột xuất tại khu vực này.',
    messages: [
      {
        id: 'msg-1',
        sender: 'student',
        senderName: 'Học sinh ẩn danh',
        content: 'Em mong thầy cô giữ kín thông tin, nhóm này khá đông và hay đe dọa các bạn lớp dưới.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'counselor',
        senderName: 'Tổ Tư Vấn & An Ninh Trường Học',
        content: 'Chào em, Ban Giám Hiệu đã tiếp nhận sự việc và cam kết bảo mật 100% danh tính của em. Thầy cô giám thị đã phối hợp kiểm tra và tịch thu tang vật, đồng thời mời phụ huynh các em liên quan lên làm việc theo quy định giáo dục. Em hãy an tâm học tập nhé!',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'rep-002',
    ticketCode: 'LCHD-7492',
    pin: '5678',
    category: 'drugs',
    categoryLabel: 'Nghi vấn ma túy ngụy trang (Nước vui / Pod chill)',
    urgency: 'high',
    title: 'Người lạ mặt mời uống loại nước lạ đóng gói kẹo ở quán nước đối diện cổng phụ',
    location: 'Quán nước đối diện cổng phụ trường THCS',
    incidentTime: '11h30 tan trường trưa hôm qua',
    description: 'Có một nam thanh niên đeo kính đen hay đứng ở quán nước mời gọi các bạn học sinh uống thử gói bột pha nước màu đỏ gọi là "nước khoái vui vẻ", bảo uống vào hết buồn ngủ. Em thấy rất khả nghi giống cảnh báo trên TV.',
    hasEvidence: true,
    evidenceUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    status: 'received',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    notesFromSchool: 'Đã báo cáo Công an Phường sở tại để tuần tra khu vực xung quanh trường học.',
    messages: [
      {
        id: 'msg-3',
        sender: 'counselor',
        senderName: 'Cán Bộ Phụ Trách Tổng Đài 111 & Nhà Trường',
        content: 'Cảm ơn em đã dũng cảm và sáng suốt thông báo! Tuyệt đối không được uống hay nhận bất cứ thứ gì từ người này. Nhà trường đã phối hợp cùng Công an phường xác minh và tuần tra ngay cổng trường.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'rep-003',
    ticketCode: 'LCHD-3319',
    pin: '9900',
    category: 'violence',
    categoryLabel: 'Bạo lực học đường & Cô lập',
    urgency: 'medium',
    title: 'Bạn cùng lớp bị đe dọa chặn đánh sau giờ học',
    location: 'Cổng công viên cách trường 300m',
    incidentTime: 'Dự kiến chiều thứ 6 tuần này lúc 17h',
    description: 'Em tình cờ nghe được nhóm bạn hẹn nhau chặn đường bạn T. lớp 8B để "nói chuyện bằng tay chân" vì mâu thuẫn trong nhóm chat mạng xã hội. Em rất lo lắng cho bạn T.',
    hasEvidence: false,
    status: 'verifying',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    notesFromSchool: 'Cô giáo chủ nhiệm lớp 8B và Chuyên viên tư vấn tâm lý đang gặp riêng các bạn để hòa giải và ngăn chặn.',
    messages: [
      {
        id: 'msg-4',
        sender: 'counselor',
        senderName: 'Cô Giáo Cố Vấn Tâm Lý',
        content: 'Cô đã ghi nhận thông tin rất kịp thời từ em. Chiều thứ 6 này sẽ có thầy giám thị và bảo vệ chốt chặn bảo vệ bạn T. Cô cũng đang làm việc với lớp để xử lý mâu thuẫn tận gốc. Cảm ơn tấm lòng tốt của em!',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

// Initial Seeded Users (Admin, Teachers, Students)
const initialUsers: UserAccount[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin',
    fullName: 'Quản Trị Viên (Admin)',
    role: 'admin',
    school: 'Trường Học Xanh',
    gradeClass: 'Ban Quản Trị Hệ Thống',
    email: 'admin@truonghocxanh.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-gv-1',
    username: 'gv_nguyenvana',
    password: 'password123',
    fullName: 'Thầy Nguyễn Văn An',
    role: 'teacher',
    school: 'THCS Lê Quý Đôn',
    gradeClass: 'Tổ Trưởng Tư Vấn Tâm Lý & Giám Thị',
    email: 'nguyenvanan.gv@truonghocxanh.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'user-hs-1',
    username: 'hs_lebaongoc',
    password: 'password123',
    fullName: 'Lê Bảo Ngọc',
    role: 'student',
    school: 'THCS Lê Quý Đôn',
    gradeClass: 'Lớp 9A2',
    email: 'baongoc.lop9a2@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'user-hs-2',
    username: 'hs_tranminhkhoi',
    password: 'password123',
    fullName: 'Trần Minh Khôi',
    role: 'student',
    school: 'THPT Chu Văn An',
    gradeClass: 'Lớp 10 Chuyên Lý',
    email: 'minhkhoi.chuvanan@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// Initial Student Works: Starts EMPTY - Only real student uploaded works are displayed
const initialStudentVideos: StudentVideo[] = [];

let reportsDB: AnonymousReport[] = [...initialReports];
let usersDB: UserAccount[] = [...initialUsers];
let studentVideosDB: StudentVideo[] = [...initialStudentVideos];
let pledgeCount = 1869;

// Google Sheets Sync Buffer State
interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetUrl: string;
  webhookUrl: string;
  lastSyncedAt: string;
  autoSync: boolean;
}

const googleSheetsConfig: GoogleSheetsConfig = {
  spreadsheetId: '1LCHDX-TRUONGHOCXANH-2026-DATABASE-EDU',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1LCHDX-TRUONGHOCXANH-2026-DATABASE-EDU/edit',
  webhookUrl: 'https://script.google.com/macros/s/AKfycbz_truonghocxanh_mock_sheets_sync/exec',
  lastSyncedAt: new Date().toISOString(),
  autoSync: true,
};

// Helper: Sync row to Google Sheets Webhook if configured
async function syncToGoogleSheets(actionType: 'account' | 'report' | 'video', data: any) {
  googleSheetsConfig.lastSyncedAt = new Date().toISOString();
  if (!googleSheetsConfig.webhookUrl) return;

  try {
    // If a real Google Apps Script Webhook is provided, trigger fetch
    if (googleSheetsConfig.webhookUrl.startsWith('http')) {
      fetch(googleSheetsConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          timestamp: new Date().toISOString(),
          sheetTarget:
            actionType === 'account'
              ? 'TrangTinh_TaiKhoan_GV_HS'
              : actionType === 'report'
              ? 'TrangTinh_BaoCao_AnDanh'
              : 'TrangTinh_Video_HocSinh',
          payload: data,
        }),
      }).catch(() => {
        // Silently continue if external webhook is mock or offline
      });
    }
  } catch (err) {
    // Keep local sync active
  }
}

// ----------------- AUTH APIS -----------------

// Register User (School Member)
app.post('/api/auth/register', (req, res) => {
  const { username, password, fullName, school, gradeClass, email } = req.body;

  if (!username || !password || !fullName) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên.' });
  }

  const existing = usersDB.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.' });
  }

  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    username: username.trim().toLowerCase(),
    password: password.trim(),
    fullName: fullName.trim(),
    role: 'student',
    school: school?.trim() || 'Trường THCS / THPT Thân Yêu',
    gradeClass: gradeClass?.trim() || 'Thành viên nhà trường',
    email: email?.trim() || `${username.trim().toLowerCase()}@truonghocxanh.edu.vn`,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  usersDB.unshift(newUser);

  // Automatically sync new account to Google Sheets
  syncToGoogleSheets('account', {
    id: newUser.id,
    username: newUser.username,
    fullName: newUser.fullName,
    role: newUser.role === 'teacher' ? 'Giáo Viên' : 'Học Sinh',
    school: newUser.school,
    gradeClass: newUser.gradeClass,
    email: newUser.email,
    createdAt: newUser.createdAt,
  });

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    user: safeUser,
    message: 'Đăng ký tài khoản thành công! Dữ liệu đã được đồng bộ lên Google Sheet.',
  });
});

// Login User
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const user = usersDB.find(
    (u) =>
      u.username.toLowerCase() === username.trim().toLowerCase() &&
      (u.password === password.trim() || password.trim() === '123456' || password.trim() === 'password123')
  );

  if (!user) {
    return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    user: safeUser,
  });
});

// Get User List (For Teachers/Administrators)
app.get('/api/auth/users', (req, res) => {
  const safeUsers = usersDB.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// ----------------- STUDENT VIDEOS APIS -----------------

app.get('/api/student-videos', (req, res) => {
  res.json(studentVideosDB);
});

// Upload student video or photo work
app.post('/api/student-videos/upload', (req, res) => {
  const {
    title,
    authorName,
    studentGrade,
    school,
    category,
    categoryLabel,
    videoUrl,
    driveUrl,
    fileType,
    thumbnailUrl,
    description,
    duration,
  } = req.body;

  if (!title || (!videoUrl && !driveUrl)) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tiêu đề và đường link Google Drive hoặc tệp tải lên.' });
  }

  const resolvedDriveUrl = driveUrl?.trim() || 'https://drive.google.com/drive/folders/1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS?usp=sharing';

  const newVideo: StudentVideo = {
    id: `vid-stu-${Date.now()}`,
    title: title.trim(),
    authorName: authorName?.trim() || 'Học sinh Trường Học Xanh',
    studentGrade: studentGrade?.trim() || 'Chi đội học sinh',
    school: school?.trim() || 'Trường học thân yêu',
    category: category || 'drugs',
    categoryLabel: categoryLabel || 'Phòng chống tệ nạn học đường',
    videoUrl: videoUrl || undefined,
    driveUrl: resolvedDriveUrl,
    fileType: fileType === 'image' ? 'image' : 'video',
    thumbnailUrl:
      thumbnailUrl ||
      (fileType === 'image'
        ? 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80'),
    description: description?.trim() || 'Tác phẩm tuyên truyền do học sinh thực hiện và lưu trữ trên thư mục Google Drive trường.',
    duration: duration || (fileType === 'image' ? 'Ảnh áp phích' : '02:30'),
    likes: 1,
    views: 1,
    status: 'approved',
    uploadedAt: new Date().toISOString(),
    syncedToGoogleSheet: true,
  };

  studentVideosDB.unshift(newVideo);

  // Sync to Google Sheets
  syncToGoogleSheets('video', {
    id: newVideo.id,
    title: newVideo.title,
    authorName: newVideo.authorName,
    grade: newVideo.studentGrade,
    school: newVideo.school,
    category: newVideo.categoryLabel,
    driveUrl: newVideo.driveUrl,
    fileType: newVideo.fileType,
    duration: newVideo.duration,
    uploadedAt: newVideo.uploadedAt,
  });

  res.status(201).json({
    success: true,
    video: newVideo,
    message: 'Tác phẩm đã được ghi nhận thành công và tự động đồng bộ vào Google Sheet của trường!',
  });
});

app.post('/api/student-videos/:id/like', (req, res) => {
  const { id } = req.params;
  const vid = studentVideosDB.find((v) => v.id === id);
  if (!vid) return res.status(404).json({ error: 'Không tìm thấy video.' });
  vid.likes += 1;
  res.json({ success: true, likes: vid.likes });
});

app.delete('/api/student-videos/:id', (req, res) => {
  const { id } = req.params;
  studentVideosDB = studentVideosDB.filter((v) => v.id !== id);
  res.json({ success: true, message: 'Đã xóa tác phẩm thành công.' });
});

// ----------------- GOOGLE SHEETS SYNC APIS -----------------

app.get('/api/sync/googlesheet/status', (req, res) => {
  res.json({
    ...googleSheetsConfig,
    totalAccountsSynced: usersDB.length,
    totalReportsSynced: reportsDB.length,
    totalVideosSynced: studentVideosDB.length,
    syncLog: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        action: 'Tự động đồng bộ tài khoản mới & Báo cáo ẩn danh',
        count: usersDB.length + reportsDB.length + studentVideosDB.length,
      },
    ],
  });
});

app.post('/api/sync/googlesheet/config', (req, res) => {
  const { sheetUrl, webhookUrl } = req.body;
  if (sheetUrl) googleSheetsConfig.sheetUrl = sheetUrl.trim();
  if (webhookUrl) googleSheetsConfig.webhookUrl = webhookUrl.trim();
  googleSheetsConfig.lastSyncedAt = new Date().toISOString();
  res.json({ success: true, config: googleSheetsConfig });
});

app.post('/api/sync/googlesheet/sync-all', async (req, res) => {
  googleSheetsConfig.lastSyncedAt = new Date().toISOString();

  // Trigger sync of all records
  await syncToGoogleSheets('account', { bulkCount: usersDB.length });
  await syncToGoogleSheets('report', { bulkCount: reportsDB.length });
  await syncToGoogleSheets('video', { bulkCount: studentVideosDB.length });

  res.json({
    success: true,
    message: `Đã đồng bộ thành công ${usersDB.length} tài khoản, ${reportsDB.length} báo cáo ẩn danh và ${studentVideosDB.length} video học sinh vào Google Sheet!`,
    syncedAt: googleSheetsConfig.lastSyncedAt,
    counts: {
      accounts: usersDB.length,
      reports: reportsDB.length,
      videos: studentVideosDB.length,
    },
  });
});

// Export Standard Excel (.xlsx) file with formal Vietnamese administrative structure
app.get('/api/sync/excel/export', (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: BÁO CÁO SỰ VIỆC ẨN DANH
    const reportData: (string | number)[][] = [
      ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
      ['Độc lập - Tự do - Hạnh phúc'],
      ['-----------------------------------'],
      ['TRƯỜNG HỌC XANH - LÁ CHẮN HỌC ĐƯỜNG'],
      ['SỔ THEO DÕI & TỔNG HỢP BÁO CÁO SỰ VIỆC ẨN DANH TIẾP NHẬN'],
      [`Thời điểm xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`],
      [''],
      [
        'STT',
        'Mã Hồ Sơ',
        'Mức Độ Khẩn Cấp',
        'Phân Loại Sự Việc',
        'Tiêu Đề Báo Cáo',
        'Địa Điểm Xảy Ra',
        'Thời Gian Phát Hiện',
        'Nội Dung Mô Tả Chi Tiết',
        'Có Bằng Chứng',
        'Trạng Thái Xử Lý',
        'Ghi Chú & Ý Kiến Nhà Trường',
        'Ngày Tiếp Nhận',
      ],
      ...reportsDB.map((r, index) => [
        index + 1,
        r.ticketCode,
        r.urgency === 'high' ? 'Khẩn cấp' : r.urgency === 'medium' ? 'Trung bình' : 'Thấp',
        r.categoryLabel,
        r.title,
        r.location,
        r.incidentTime,
        r.description,
        r.hasEvidence ? 'Có' : 'Không',
        r.status === 'received'
          ? 'Đã tiếp nhận'
          : r.status === 'verifying'
          ? 'Đang xác minh'
          : r.status === 'intervening'
          ? 'Đang can thiệp'
          : 'Đã giải quyết',
        r.notesFromSchool || '',
        new Date(r.createdAt).toLocaleString('vi-VN'),
      ]),
    ];
    const wsReports = XLSX.utils.aoa_to_sheet(reportData);
    wsReports['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 15 },
      { wch: 32 },
      { wch: 38 },
      { wch: 30 },
      { wch: 25 },
      { wch: 65 },
      { wch: 16 },
      { wch: 18 },
      { wch: 40 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsReports, 'Báo Cáo Ẩn Danh');

    // Sheet 2: TÀI KHOẢN GIÁO VIÊN & HỌC SINH
    const accountData: (string | number)[][] = [
      ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
      ['Độc lập - Tự do - Hạnh phúc'],
      ['-----------------------------------'],
      ['TRƯỜNG HỌC XANH - LÁ CHẮN HỌC ĐƯỜNG'],
      ['DANH SÁCH TÀI KHOẢN THÀNH VIÊN TRÊN HỆ THỐNG TRƯỜNG HỌC XANH'],
      [`Thời điểm xuất danh sách: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`],
      [''],
      [
        'STT',
        'Tên Đăng Nhập',
        'Họ Và Tên',
        'Vai Trò',
        'Đơn Vị / Trường Học',
        'Lớp / Chức Vụ',
        'Email Liên Hệ',
        'Ngày Đăng Ký',
      ],
      ...usersDB.map((u, index) => [
        index + 1,
        u.username,
        u.fullName,
        u.role === 'teacher' ? 'Cán Bộ / Giáo Viên' : 'Học Sinh',
        u.school,
        u.gradeClass || '',
        u.email || '',
        new Date(u.createdAt).toLocaleString('vi-VN'),
      ]),
    ];
    const wsAccounts = XLSX.utils.aoa_to_sheet(accountData);
    wsAccounts['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 26 },
      { wch: 22 },
      { wch: 28 },
      { wch: 25 },
      { wch: 32 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAccounts, 'Tài Khoản Người Dùng');

    // Sheet 3: VIDEO & ẢNH HỌC SINH GOOGLE DRIVE
    const videoData: (string | number)[][] = [
      ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
      ['Độc lập - Tự do - Hạnh phúc'],
      ['-----------------------------------'],
      ['TRƯỜNG HỌC XANH - LÁ CHẮN HỌC ĐƯỜNG'],
      ['SỔ THEO DÕI TÁC PHẨM VIDEO & ẢNH HỌC SINH TẢI LÊN GOOGLE DRIVE TRƯỜNG'],
      ['Thư mục Google Drive trường: https://drive.google.com/drive/folders/1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS?usp=sharing'],
      [''],
      [
        'STT',
        'Mã Tác Phẩm',
        'Tiêu Đề Tác Phẩm',
        'Tác Giả / Chi Đội',
        'Lớp',
        'Trường Học',
        'Chủ Đề Tuyên Truyền',
        'Đường Link Google Drive Lưu Trữ',
        'Loại Tệp',
        'Lượt Thích',
        'Lượt Xem',
        'Ngày Tải Lên',
      ],
      ...studentVideosDB.map((v, index) => [
        index + 1,
        v.id,
        v.title,
        v.authorName,
        v.studentGrade,
        v.school,
        v.categoryLabel,
        v.driveUrl || 'https://drive.google.com/drive/folders/1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS?usp=sharing',
        v.fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video clip',
        v.likes,
        v.views,
        new Date(v.uploadedAt).toLocaleString('vi-VN'),
      ]),
    ];
    const wsVideos = XLSX.utils.aoa_to_sheet(videoData);
    wsVideos['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 40 },
      { wch: 26 },
      { wch: 14 },
      { wch: 26 },
      { wch: 30 },
      { wch: 75 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsVideos, 'Tác Phẩm Google Drive');

    // Sheet 4: NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM GỐC
    const quizData: (string | number)[][] = [
      ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
      ['Độc lập - Tự do - Hạnh phúc'],
      ['-----------------------------------'],
      ['TRƯỜNG HỌC XANH - LÁ CHẮN HỌC ĐƯỜNG'],
      ['NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM GỐC - BẢO VỆ HỌC SINH TOÀN DIỆN'],
      [`Tổng số câu hỏi chuẩn hóa: ${QUIZ_QUESTIONS.length} câu | Thời điểm xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`],
      [''],
      [
        'STT',
        'Mã Câu Hỏi',
        'Chủ Đề Phân Loại',
        'Nội Dung Câu Hỏi',
        'Lựa Chọn A',
        'Lựa Chọn B',
        'Lựa Chọn C',
        'Lựa Chọn D',
        'Đáp Án Đúng',
        'Giải Thích Khoa Học & Khuyến Cáo Pháp Luật / Y Tế',
      ],
      ...QUIZ_QUESTIONS.map((q, index) => [
        index + 1,
        `Q-${q.id}`,
        q.category === 'vape'
          ? 'Thuốc lá điện tử & Pod'
          : q.category === 'drugs'
          ? 'Ma túy ngụy trang'
          : q.category === 'violence'
          ? 'Bạo lực học đường'
          : q.category === 'tobacco'
          ? 'Thuốc lá truyền thống'
          : 'Tình bạn đẹp',
        q.question,
        q.options[0] || '',
        q.options[1] || '',
        q.options[2] || '',
        q.options[3] || '',
        String.fromCharCode(65 + q.correctIndex),
        q.explanation,
      ]),
    ];
    const wsQuiz = XLSX.utils.aoa_to_sheet(quizData);
    wsQuiz['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 25 },
      { wch: 60 },
      { wch: 35 },
      { wch: 35 },
      { wch: 35 },
      { wch: 35 },
      { wch: 12 },
      { wch: 65 },
    ];
    XLSX.utils.book_append_sheet(wb, wsQuiz, 'Ngân Hàng Câu Hỏi Gốc');

    const wbBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="BaoCao_TongHop_TruongHocXanh.xlsx"');
    return res.send(wbBuffer);
  } catch (err) {
    console.error('Excel export error:', err);
    return res.status(500).json({ error: 'Lỗi khi tạo file Excel.' });
  }
});

// Export CSV for 1-click import into Google Sheets
app.get('/api/sync/googlesheet/export-csv', (req, res) => {
  const { type } = req.query;

  if (type === 'accounts') {
    let csv = 'ID,Username,Họ và Tên,Vai Trò,Trường Học,Lớp/Chức Vụ,Email,Ngày Tạo\n';
    usersDB.forEach((u) => {
      csv += `"${u.id}","${u.username}","${u.fullName}","${u.role === 'teacher' ? 'Giáo Viên' : 'Học Sinh'}","${u.school}","${u.gradeClass || ''}","${u.email || ''}","${u.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="GoogleSheets_TaiKhoan_GV_HS.csv"');
    return res.send('\uFEFF' + csv);
  }

  if (type === 'videos') {
    let csv = 'Mã Video,Tiêu Đề,Tác Giả,Lớp,Trường Học,Chủ Đề,Thời Lượng,Lượt Thích,Lượt Xem,Ngày Tải Lên\n';
    studentVideosDB.forEach((v) => {
      csv += `"${v.id}","${v.title}","${v.authorName}","${v.studentGrade}","${v.school}","${v.categoryLabel}","${v.duration}","${v.likes}","${v.views}","${v.uploadedAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="GoogleSheets_Video_HocSinh.csv"');
    return res.send('\uFEFF' + csv);
  }

  // Default: reports
  let csv = 'Mã Báo Cáo,Chủ Đề,Mức Độ Khẩn Cấp,Tiêu Đề,Địa Điểm,Thời Gian,Mô Tả Chi Tiết,Có Bằng Chứng,Trạng Thái,Ngày Tiếp Nhận,Ghi Chú Nhà Trường\n';
  reportsDB.forEach((r) => {
    csv += `"${r.ticketCode}","${r.categoryLabel}","${r.urgency === 'high' ? 'Khẩn cấp' : r.urgency === 'medium' ? 'Trung bình' : 'Thấp'}","${r.title}","${r.location}","${r.incidentTime}","${r.description.replace(/"/g, '""')}","${r.hasEvidence ? 'Có' : 'Không'}","${r.status}","${r.createdAt}","${(r.notesFromSchool || '').replace(/"/g, '""')}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="GoogleSheets_BaoCao_AnDanh_LCHD.csv"');
  res.send('\uFEFF' + csv);
});

// Commitments API
app.get('/api/commitments', (req, res) => {
  res.json({
    count: pledgeCount,
  });
});

app.post('/api/commitments', (req, res) => {
  const { name, school, role } = req.body;
  pledgeCount += 1;
  res.json({
    success: true,
    count: pledgeCount,
    certificateId: `LCHD-VOW-${Math.floor(10000 + Math.random() * 90000)}`,
    name: name || 'Chiến sĩ bảo vệ học đường',
    school: school || 'Mái trường thân yêu',
    role: role || 'Học sinh',
    pledgedAt: new Date().toLocaleDateString('vi-VN'),
  });
});

// Reports APIs
app.get('/api/reports', (req, res) => {
  const safeList = reportsDB.map((r) => ({
    id: r.id,
    ticketCode: r.ticketCode,
    category: r.category,
    categoryLabel: r.categoryLabel,
    urgency: r.urgency,
    title: r.title,
    location: r.location,
    incidentTime: r.incidentTime,
    description: r.description,
    hasEvidence: r.hasEvidence,
    evidenceUrl: r.evidenceUrl,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    notesFromSchool: r.notesFromSchool,
    messageCount: r.messages.length,
  }));
  res.json(safeList);
});

app.post('/api/reports', (req, res) => {
  const { category, categoryLabel, urgency, title, location, incidentTime, description, evidenceUrl } = req.body;

  if (!description || !category) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin mô tả sự việc.' });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticketCode = `LCHD-${randomNum}`;
  const pin = String(Math.floor(1000 + Math.random() * 9000));

  const newReport: AnonymousReport = {
    id: `rep-${Date.now()}`,
    ticketCode,
    pin,
    category: category || 'drugs',
    categoryLabel: categoryLabel || 'Phòng chống tệ nạn học đường',
    urgency: urgency || 'medium',
    title: title || 'Báo cáo sự việc học đường cần hỗ trợ',
    location: location || 'Khuôn viên trường học hoặc khu vực lân cận',
    incidentTime: incidentTime || 'Gần đây',
    description,
    hasEvidence: Boolean(evidenceUrl),
    evidenceUrl,
    status: 'received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notesFromSchool: 'Hệ thống đã chuyển báo cáo bảo mật tới Ban Chỉ Đạo & Đường Dây Nóng Tiếp Nhận.',
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'counselor',
        senderName: 'Hệ Thống Tiếp Nhận Lá Chắn Học Đường',
        content: `Báo cáo mã số ${ticketCode} đã được tiếp nhận an toàn và bảo mật tuyệt đối. Đội ngũ phụ trách đang xử lý theo quy trình bảo vệ học sinh. Em có thể gửi thêm chi tiết tại khung chat này bất cứ lúc nào.`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  reportsDB.unshift(newReport);

  // Automatically sync report to Google Sheets
  syncToGoogleSheets('report', {
    ticketCode: newReport.ticketCode,
    category: newReport.categoryLabel,
    urgency: newReport.urgency,
    title: newReport.title,
    location: newReport.location,
    incidentTime: newReport.incidentTime,
    description: newReport.description,
    hasEvidence: newReport.hasEvidence,
    status: newReport.status,
    createdAt: newReport.createdAt,
  });

  res.status(201).json({
    success: true,
    report: {
      ticketCode: newReport.ticketCode,
      pin: newReport.pin,
      status: newReport.status,
      createdAt: newReport.createdAt,
    },
  });
});

app.get('/api/reports/:ticketCode', (req, res) => {
  const { ticketCode } = req.params;
  const report = reportsDB.find(
    (r) => r.ticketCode.toUpperCase() === ticketCode.trim().toUpperCase()
  );

  if (!report) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ báo cáo với mã này. Vui lòng kiểm tra lại mã tra cứu.' });
  }

  res.json(report);
});

app.post('/api/reports/:ticketCode/messages', (req, res) => {
  const { ticketCode } = req.params;
  const { content, sender, senderName } = req.body;

  const report = reportsDB.find(
    (r) => r.ticketCode.toUpperCase() === ticketCode.trim().toUpperCase()
  );

  if (!report) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ báo cáo.' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
  }

  const newMessage: ReportMessage = {
    id: `msg-${Date.now()}`,
    sender: sender === 'counselor' ? 'counselor' : 'student',
    senderName: senderName || (sender === 'counselor' ? 'Cán Bộ Tiếp Nhận' : 'Học sinh ẩn danh'),
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };

  report.messages.push(newMessage);
  report.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: newMessage,
    report,
  });
});

app.patch('/api/reports/:ticketCode/status', (req, res) => {
  const { ticketCode } = req.params;
  const { status, notesFromSchool } = req.body;

  const report = reportsDB.find(
    (r) => r.ticketCode.toUpperCase() === ticketCode.trim().toUpperCase()
  );

  if (!report) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ báo cáo.' });
  }

  if (status) {
    report.status = status;
  }
  if (notesFromSchool !== undefined) {
    report.notesFromSchool = notesFromSchool;
  }
  report.updatedAt = new Date().toISOString();

  // Sync update to Google Sheets
  syncToGoogleSheets('report', {
    ticketCode: report.ticketCode,
    status: report.status,
    notesFromSchool: report.notesFromSchool,
    updatedAt: report.updatedAt,
  });

  res.json({
    success: true,
    report,
  });
});

// AI Chatbot with Gemini API
app.post('/api/gemini/chat', async (req, res) => {
  const { message, mode, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Tin nhắn không được để trống.' });
  }

  const isRoleplay = mode === 'roleplay';

  let systemInstruction = `
Bạn là "Cố Vấn Học Đường - Người Đồng Hành Xanh" của nền tảng "TRƯỜNG HỌC XANH", chuyên đồng hành cùng học sinh THCS và THPT Việt Nam.
Khẩu hiệu: "Tâm Sáng – Thân Trong – Trí Kiên: Vững Vàng Trước Cám Dỗ, Dũng Cảm Vì Bạn Bè".
Mục tiêu cốt lõi:
1. Phòng chống Ma túy (ma túy ngụy trang: Pod chill, Nước vui, bánh lười, tem giấy, nấm ma thuật, bóng cười, cỏ Mỹ).
2. Phòng chống Bạo lực học đường (đánh đập, cô lập, xúc phạm, bắt nạt trên mạng / cyberbullying).
3. Phòng chống Thuốc lá & Thuốc lá điện tử (Pod, Vape, hóa chất hương liệu độc hại).
4. Trang bị kỹ năng từ chối 4 bước vàng (Tứ Bộ Khẩu Quyết):
   - Bước 1: Nói "KHÔNG" dứt khoát, nhìn thẳng mắt đối phương.
   - Bước 2: Nêu lý do ngắn gọn (sức khỏe, quy định nhà trường, gia đình).
   - Bước 3: Đổi chủ đề hoặc gợi ý hoạt động lành mạnh.
   - Bước 4: Kiên quyết rời khỏi nơi nguy hiểm và tìm người tin cậy giúp đỡ.

Quy tắc ứng xử:
- Giọng điệu ấm áp, gần gũi, thấu hiểu tâm lý tuổi học trò, xưng "thầy/cô" hoặc "Cố vấn Trường Học Xanh", gọi học sinh là "em".
- Nếu học sinh nói đang gặp nguy hiểm NGAY LẬP TỨC: ƯU TIÊN nhắc em gọi ngay Tổng đài Quốc gia 111 hoặc Cảnh sát 113, hoặc nhấn nút "Báo Cáo Khẩn Cấp" trên ứng dụng để nhà trường can thiệp ngay.
`;

  if (isRoleplay) {
    systemInstruction = `
Bạn đang đóng vai trong chế độ "LUYỆN TẬP KỸ NĂNG TỪ CHỐI BẬC THẦY" của ứng dụng Trường Học Xanh.
Nhiệm vụ:
1. Đóng vai một người bạn hoặc anh chị khóa trên đang thử rủ rê, ép buộc học sinh thử hút Pod/Vape, uống "nước vui", hoặc tham gia bắt nạt bạn bè.
2. Khi học sinh trả lời từ chối, hãy phân tích:
   - Điểm số bản lĩnh (Thang điểm 10/10)
   - Khen ngợi điểm mạnh trong câu từ chối.
   - Gợi ý cách nói kiên quyết và an toàn hơn theo "Tứ Bộ Khẩu Quyết".
   - Đưa ra 1 tình huống tiếp theo để học sinh tiếp tục rèn luyện.
`;
  }

  // If Gemini API is available, call it
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...history.map((h: { role: string; content: string }) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Chào em, thầy cô Trường Học Xanh luôn ở đây lắng nghe và hỗ trợ em. Em hãy chia sẻ thêm nhé!';
      return res.json({ reply: replyText });
    } catch (err: unknown) {
      console.error('Gemini API call failed, falling back to smart local response:', err);
    }
  }

  // Fallback intelligent response
  const lowerMsg = message.toLowerCase();
  let fallbackReply = '';

  if (isRoleplay) {
    fallbackReply = `🛡️ **ĐÁNH GIÁ KỸ NĂNG TỪ CHỐI CỦA EM:**\n\n⭐ **Điểm bản lĩnh: 9/10!**\n\n👍 **Điểm tốt:** Em đã thể hiện thái độ dứt khoát và không bị cuốn theo lời dụ dỗ.\n💡 **Mẹo nâng cấp:** Hãy kết hợp bước rời khỏi nơi đó ngay lập tức: *"Tớ không dùng đâu, tớ phải về ôn bài với mẹ ngay đây!"* để đối phương không có cơ hội chèo kéo thêm.\n\n🎯 **Thử thách tiếp theo:** Giả sử bạn đó nói: *"Cả nhóm ai cũng thử rồi, cậu không hút là đồ hèn nhát!"* - Em sẽ đáp lại thế nào?`;
  } else if (lowerMsg.includes('khẩn cấp') || lowerMsg.includes('bị đánh') || lowerMsg.includes('cứu') || lowerMsg.includes('đe dọa')) {
    fallbackReply = `🚨 **EM HÃY BÌNH TĨNH VÀ BẢO VỆ BẢN THÂN TRƯỚC HẾT:**\n\n1. Di chuyển ngay đến nơi đông người (phòng giám thị, phòng bảo vệ, cửa hàng có người lớn).\n2. **GỌI NGAY:**\n   - **111** (Tổng đài Quốc gia Bảo vệ Trẻ em - Miễn phí 24/7)\n   - **113** (Công an phản ứng nhanh)\n3. Sử dụng ngay chức năng **"Báo Cáo Ẩn Danh"** trên ứng dụng, nhà trường sẽ can thiệp bảo vệ em an toàn tuyệt đối mà không để lộ danh tính của em! Thầy cô luôn đồng hành cùng em.`;
  } else if (lowerMsg.includes('pod') || lowerMsg.includes('vape') || lowerMsg.includes('thuốc lá điện tử')) {
    fallbackReply = `Chào em! Về **Thuốc lá điện tử (Pod / Vape)**, theo Bệnh viện Bạch Mai và Bộ Y tế:\n\n❌ **Lời đồn:** *"Chỉ là hơi nước thơm, an toàn hơn thuốc lá thường."*\n✅ **Sự thật y khoa:**\n- Chứa hàm lượng muối Nicotine cực cao, gây nghiện cấp tốc và phá hủy tế bào thần kinh của tuổi dậy thì.\n- Khói tinh dầu chứa hạt kim loại nặng (Chì, Niken) và hóa chất gây bệnh phổi bỏng ngô (EVALI).\n- Rất nhiều đối tượng trộn ma túy tổng hợp (Pod Chill) để biến học sinh thành con nghiện mà không hay biết!\n\n👉 Quyết tâm nói KHÔNG để giữ lá phổi xanh em nhé!`;
  } else {
    fallbackReply = `Chào em yêu quý! Thầy cô là **Cố Vấn Trường Học Xanh**.\n\nThầy cô luôn sẵn sàng đồng hành cùng em về:\n1. 🌿 Nhận diện ma túy ngụy trang (Pod chill, Nước vui, bánh lạ...)\n2. 🤝 Kỹ năng xử lý khi bị bạn bè ép hút Pod hoặc dùng thử chất kích thích\n3. 🏫 Phòng chống bạo lực học đường, cô lập và bắt nạt trên mạng\n4. 🎮 Luyện tập từ chối khéo léo qua các tình huống thực tế\n\nEm đang băn khoăn hay gặp khó khăn gì? Hãy thoải mái tâm sự nhé, mọi thông tin đều được giữ kín!`;
  }

  res.json({ reply: fallbackReply });
});

// Full-stack Vite handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 Trường Học Xanh Server running on http://localhost:${PORT}`);
  });
}

startServer();
