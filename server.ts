import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

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

let reportsDB: AnonymousReport[] = [...initialReports];
let pledgeCount = 1869;

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
  // Return list of reports (without sensitive PIN)
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
Bạn là "Cố Vấn Học Đường - Chú Cảnh Sát Thân Thiện" của nền tảng "LÁ CHẮN HỌC ĐƯỜNG", chuyên đồng hành cùng học sinh THCS và THPT Việt Nam.
Mục tiêu cốt lõi của bạn:
1. Phòng chống Ma túy (ma túy ngụy trang: Pod chill, Nước vui, bánh lười, tem giấy, nấm ma thuật, bóng cười, cỏ Mỹ).
2. Phòng chống Bạo lực học đường (đánh đập, cô lập, xúc phạm, bắt nạt trên mạng / cyberbullying).
3. Phòng chống Thuốc lá & Thuốc lá điện tử (Pod, Vape, hóa chất hương liệu độc hại).
4. Trang bị kỹ năng từ chối 4 bước vàng: 
   - Bước 1: Nói "KHÔNG" dứt khoát, nhìn thẳng mắt đối phương.
   - Bước 2: Nêu lý do ngắn gọn (sức khỏe, quy định nhà trường, gia đình).
   - Bước 3: Đổi chủ đề hoặc gợi ý hoạt động lành mạnh.
   - Bước 4: Kiên quyết rời khỏi nơi nguy hiểm và tìm người tin cậy giúp đỡ.

Quy tắc ứng xử:
- Giọng điệu ấm áp, gần gũi, thấu hiểu tâm lý tuổi học trò, gọi học sinh là "em", xưng là "thầy/chú" hoặc "Cố vấn Lá Chắn Học Đường".
- TUYỆT ĐỐI KHÔNG phán xét hay trách mắng.
- Nếu học sinh nói đang gặp nguy hiểm NGAY LẬP TỨC (đang bị đánh, bị ép dùng ma túy tại chỗ): ƯU TIÊN nhắc em gọi ngay Tổng đài Quốc gia 111 hoặc Cảnh sát 113, hoặc nhấn nút "Báo Cáo Khẩn Cấp" trên ứng dụng để nhà trường can thiệp ngay.
- Trình bày ngắn gọn, súc tích, dễ đọc trên điện thoại (gạch đầu dòng rõ ràng, có biểu tượng cảm xúc thân thiện).
`;

  if (isRoleplay) {
    systemInstruction = `
Bạn đang đóng vai trong chế độ "LUYỆN TẬP KỸ NĂNG TỪ CHỐI BẬC THẦY" của ứng dụng Lá Chắn Học Đường.
Nhiệm vụ của bạn:
1. Đóng vai một người bạn hoặc anh chị khóa trên đang thử rủ rê, lôi kéo học sinh thử hút Pod/Vape, uống "nước vui", hoặc tham gia bắt nạt bạn bè.
2. Khi học sinh trả lời từ chối, bạn hãy phân tích ngắn gọn:
   - Điểm số bản lĩnh (Thang điểm 10/10)
   - Khen ngợi điểm mạnh trong câu từ chối của học sinh.
   - Gợi ý cách nói kiên quyết và an toàn hơn theo "Tứ Bộ Khẩu Quyết" (Nói Không rõ ràng - Nêu lý do - Đổi đề tài - Rời đi).
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

      const replyText = response.text || 'Chào em, chú luôn ở đây lắng nghe và hỗ trợ em. Em có thể chia sẻ thêm với chú nhé!';
      return res.json({ reply: replyText });
    } catch (err: unknown) {
      console.error('Gemini API call failed, falling back to smart local response:', err);
    }
  }

  // Fallback intelligent response for student queries if key is unset or network error
  const lowerMsg = message.toLowerCase();
  let fallbackReply = '';

  if (isRoleplay) {
    fallbackReply = `🛡️ **ĐÁNH GIÁ KỸ NĂNG TỪ CHỐI CỦA EM:**\n\n⭐ **Điểm bản lĩnh: 9/10!**\n\n👍 **Điểm tốt:** Em đã thể hiện thái độ dứt khoát và không bị cuốn theo lời dụ dỗ.\n💡 **Mẹo nâng cấp:** Hãy kết hợp bước rời khỏi nơi đó ngay lập tức: *"Tớ không dùng đâu, tớ phải về ôn bài với mẹ ngay đây!"* để đối phương không có cơ hội chèo kéo thêm.\n\n🎯 **Thử thách tiếp theo:** Giả sử bạn đó nói: *"Cả nhóm ai cũng thử rồi, cậu không hút là đồ hèn nhát!"* - Em sẽ đáp lại thế nào?`;
  } else if (lowerMsg.includes('khẩn cấp') || lowerMsg.includes('bị đánh') || lowerMsg.includes('cứu') || lowerMsg.includes('đe dọa')) {
    fallbackReply = `🚨 **EM HÃY BÌNH TĨNH VÀ BẢO VỆ BẢN THÂN TRƯỚC HẾT:**\n\n1. Nếu đang có nguy cơ bị xâm hại hoặc hành hung ngay lúc này, em hãy di chuyển ngay đến nơi đông người (phòng giám thị, bảo vệ trường, cửa hàng có người lớn).\n2. **GỌI NGAY:**\n   - **111** (Tổng đài Quốc gia Bảo vệ Trẻ em - Miễn phí 24/7)\n   - **113** (Công an phản ứng nhanh)\n3. Sử dụng ngay chức năng **"Báo Cáo Ẩn Danh"** trên ứng dụng, nhà trường sẽ can thiệp bảo vệ em an toàn tuyệt đối mà không để lộ danh tính của em! Chú và thầy cô luôn đồng hành cùng em.`;
  } else if (lowerMsg.includes('pod') || lowerMsg.includes('vape') || lowerMsg.includes('thuốc lá điện tử')) {
    fallbackReply = `Chào em! Về **Thuốc lá điện tử (Pod / Vape)**, em cần lưu ý những sự thật quan trọng sau:\n\n❌ **Lời đồn:** *"Chỉ là hơi nước thơm, không gây nghiện và an toàn hơn thuốc lá thường."*\n✅ **Sự thật:**\n- Chứa hàm lượng Nicotine cực cao dưới dạng muối nicotine, gây nghiện nhanh hơn nhiều lần.\n- Khói tinh dầu chứa kim loại nặng (Chì, Niken, Thiếc) và hóa chất Diacetyl gây xơ hóa phế quản (hội chứng "phổi bỏng ngô").\n- Rất nhiều đối tượng xấu trộn ma túy tổng hợp (Pod Chill, tinh dầu cỏ) để biến học sinh thành con nghiện mà không hề hay biết!\n\n👉 Tuyệt đối không thử dù chỉ 1 hơi em nhé! Sức khỏe và tương lai là của chính em!`;
  } else if (lowerMsg.includes('nước vui') || lowerMsg.includes('ma túy') || lowerMsg.includes('pod chill') || lowerMsg.includes('bột')) {
    fallbackReply = `Chào em! Hiện nay có nhiều loại **Ma túy ngụy trang thế hệ mới** rất tinh vi:\n\n1. **"Nước vui", "Nước dâu", "Nước xoài":** Bột ma túy tổng hợp đóng gói như kẹo bột trà trái cây, khi pha vào nước tạo ảo giác mạnh, suy tim và loạn thần.\n2. **Pod Chill / Tinh dầu lạ:** Chứa cần sa tổng hợp hoặc chất hướng thần cực mạnh.\n3. **Bánh lười (Lazy cakes) & Tem giấy:** Tẩm chất gây nghiện cực độc.\n\n🔒 **Bí kíp 3 KHÔNG:**\n- KHÔNG nhận đồ ăn, thức uống từ người lạ.\n- KHÔNG thử bất kỳ thứ gì có nhãn mác lạ ngoài cổng trường.\n- KHÔNG cả nể khi bạn bè mời gọi "thử cảm giác mạnh".`;
  } else if (lowerMsg.includes('bắt nạt') || lowerMsg.includes('bạo lực') || lowerMsg.includes('cô lập')) {
    fallbackReply = `Chào em! Bị bạo lực hay cô lập học đường là điều không một ai đáng phải chịu đựng, và đó hoàn toàn KHÔNG PHẢI lỗi của em!\n\n🛡️ **Các bước em nên làm:**\n1. **Không đối đầu bạo lực:** Hãy giữ bình tĩnh, tìm cách rời khỏi vùng nguy hiểm.\n2. **Lưu giữ bằng chứng:** Chụp màn hình tin nhắn xúc phạm hoặc đe dọa.\n3. **Chia sẻ với người tin cậy:** Thầy cô chủ nhiệm, cán bộ tâm lý, cha mẹ.\n4. **Gửi Hộp thư mật ẩn danh:** Em có thể gửi báo cáo ẩn danh ngay trên ứng dụng này, trường sẽ có biện pháp can thiệp hòa giải và bảo vệ em an toàn.`;
  } else {
    fallbackReply = `Chào em yêu quý! Chú là **Cố Vấn Lá Chắn Học Đường**.\n\nChú có thể đồng hành cùng em về:\n1. 🛡️ Cách nhận diện các loại ma túy ngụy trang (Pod chill, Nước vui, bánh lạ...)\n2. 🤝 Kỹ năng xử lý khi bị bạn bè ép hút Pod hoặc dùng thử chất kích thích\n3. 🏫 Phòng chống bạo lực học đường, cô lập và bắt nạt trên mạng\n4. 🎮 Luyện tập từ chối khéo léo qua các tình huống thực tế\n\nEm đang băn khoăn hay gặp phải điều gì cần chú lắng nghe không? Hãy thoải mái tâm sự nhé, mọi thông tin đều được giữ kín!`;
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
    console.log(`🛡️ Lá Chắn Học Đường Server running on http://localhost:${PORT}`);
  });
}

startServer();
