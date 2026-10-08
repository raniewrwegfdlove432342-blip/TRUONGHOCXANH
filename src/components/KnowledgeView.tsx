import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  Shield,
  Heart,
  Users,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NewsArticle } from '../types';
import { NEWS_ARTICLES } from '../data/mockData';

interface KnowledgeViewProps {
  onSelectArticle: (article: NewsArticle) => void;
  onOpenReport: () => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  onSelectArticle,
  onOpenReport,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ma-tuy' | 'bao-luc' | 'thuoc-la' | 'vape'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDrugCard, setExpandedDrugCard] = useState<string | null>('pod-chill');

  // Drug recognition visual database
  const drugDatabase = [
    {
      id: 'pod-chill',
      name: 'Pod Chill / Tinh Dầu Cỏ Mỹ Ngụy Trang',
      dangerLevel: 'CỰC KỲ NGUY HIỂM',
      appearance: 'Ngụy trang hình cây bút, thỏi son, hộp đồ chơi nhân vật hoạt hình, mùi đào, dâu, xoài thơm nồng.',
      reality: 'Chứa ma túy tổng hợp (cần sa tổng hợp ADB-BUTINACA), gây tê liệt ý chí, ảo giác hoang tưởng, loạn thần cấp và đột quỵ tim.',
      alertText: 'Tuyệt đối không hút thử dù chỉ 1 hơi! Rất nhiều học sinh đã phải nhập viện cấp cứu vì co giật.',
      color: 'border-red-400 bg-red-50/50',
    },
    {
      id: 'nuoc-vui',
      name: '"Nước Vui", "Nước Xoài", "Crispy Fruit"',
      dangerLevel: 'MA TÚY TỔNG HỢP NGUY HIỂM',
      appearance: 'Đóng gói trong bao bì túi bột hòa tan bắt mắt như trà hoa quả, nước giải khát tăng lực, có chữ "Crispy Fruit", "Mango".',
      reality: 'Hỗn hợp Ketamine, MDMA (thuốc lắc), Diazepam nghiền nhỏ. Uống vào gây kích thích tim mạch dữ dội, ảo giác bạo lực và suy hô hấp.',
      alertText: 'Chỉ uống nước đóng chai còn nguyên tem niêm phong do tự tay mình mở nắp.',
      color: 'border-amber-400 bg-amber-50/50',
    },
    {
      id: 'tem-giay',
      name: 'Tem Giấy / Bùa Lưỡi (LSD)',
      dangerLevel: 'ẢO GIÁC NẶNG NỀ',
      appearance: 'Miếng giấy nhỏ bằng tem thư, in hình nhân vật hoạt hình ngộ nghĩnh, dùng để ngậm dưới lưỡi.',
      reality: 'Chất kích thích gây ảo thị, hoang tưởng cảm giác mình có thể bay lượn, dẫn đến hành vi tự sát hoặc tấn công người khác.',
      alertText: 'Không bao giờ ngậm hoặc cầm bất kỳ miếng dán lạ nào từ bạn bè hay người lạ.',
      color: 'border-purple-400 bg-purple-50/50',
    },
    {
      id: 'banh-luoi',
      name: 'Bánh Lười (Lazy Cakes) / Chocolate Cần Sa',
      dangerLevel: 'NGỘ ĐỘC CẤP TÍNH',
      appearance: 'Trông y hệt bánh quy socola, brownie hoặc kẹo dẻo gấu bán trên mạng xã hội.',
      reality: 'Tẩm chất cần sa đậm đặc (THC). Sau khi ăn 30-60 phút sẽ bắt đầu gây chóng mặt, tim đập loạn nhịp, mất nhận thức không gian.',
      alertText: 'Chỉ mua đồ ăn vặt có nguồn gốc xuất xứ rõ ràng tại căng tin trường học hoặc siêu thị uy tín.',
      color: 'border-rose-400 bg-rose-50/50',
    },
  ];

  // School Violence & Bullying guidelines
  const violenceRules = [
    {
      title: 'Bạo lực thể xác',
      examples: 'Đánh đập, xô đẩy, giật đồ đạc, chặn đường sau giờ học.',
      action: 'Di chuyển ngay đến nơi đông người; hô to tìm sự trợ giúp của thầy cô hoặc bảo vệ.',
    },
    {
      title: 'Bạo lực ngôn từ & Tẩy chay',
      examples: 'Đặt biệt danh xúc phạm, chửi bới, lập nhóm cô lập không cho chơi cùng.',
      action: 'Giữ vững sự tự tin; nhớ rằng đó không phải lỗi của bạn; tâm sự với giáo viên chủ nhiệm hoặc cán bộ tâm lý.',
    },
    {
      title: 'Bắt nạt trên mạng (Cyberbullying)',
      examples: 'Tung ảnh bêu xấu, lan truyền tin đồn ác ý trong nhóm chat, tống tiền.',
      action: 'Chụp lại màn hình tin nhắn làm bằng chứng; chặn kẻ bắt nạt; gửi báo cáo ẩn danh trên ứng dụng.',
    },
  ];

  // E-cigarette (Vape / Pod) vs Reality table
  const vapeMyths = [
    {
      myth: '"Pod chỉ là hơi nước và tinh dầu thơm, hoàn toàn vô hại."',
      truth: 'Khói Pod là sol khí (aerosol) chứa Nicotine nồng độ cực cao, Chì, Niken, thủy ngân và formaldehyde gây ung thư.',
    },
    {
      myth: '"Hút Pod giúp xả stress và tăng tập trung học bài."',
      truth: 'Nicotine làm teo vỏ não ở tuổi dậy thì, gây mất ngủ, lo âu kéo dài và suy giảm trí nhớ nghiêm trọng.',
    },
    {
      myth: '"Hút một vài hơi cho biết sẽ không thể bị nghiện."',
      truth: 'Muối nicotine hấp thụ vào máu trong 7 giây, gây nghiện tâm lý và thực thể chỉ sau vài lần thử.',
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <section className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-700/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
              NGUỒN BÁO CHÍ & CỔNG THÔNG TIN AN NINH MẠNG QUỐC GIA
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              Cẩm Nang Nhận Diện & Phòng Ngừa Toàn Diện
            </h2>
          </div>
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed">
          Tài liệu chính thống từ Bộ Công An, Báo Nhân Dân, Báo Tuổi Trẻ, Cục An toàn thông tin và Bệnh viện Bạch Mai. Giúp học sinh THCS, THPT nhận biết sớm nguy cơ, tự bảo vệ bản thân và bạn bè.
        </p>
      </section>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'all', label: 'Tất cả chủ đề' },
          { id: 'ma-tuy', label: 'Ma túy ngụy trang' },
          { id: 'bao-luc', label: 'Bạo lực học đường' },
          { id: 'thuoc-la', label: 'Thuốc lá & Khói thuốc' },
          { id: 'vape', label: 'Thuốc lá điện tử (Pod)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition ${
              activeCategory === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: NHẬN DIỆN MA TÚY THẾ HỆ MỚI (Pod Chill, Nước Vui) */}
      {(activeCategory === 'all' || activeCategory === 'ma-tuy') && (
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                NHẬN DIỆN MA TÚY NGỤY TRANG THẾ HỆ MỚI
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
              Cảnh báo đỏ
            </span>
          </div>

          <div className="space-y-3">
            {drugDatabase.map((drug) => {
              const isExpanded = expandedDrugCard === drug.id;
              return (
                <div
                  key={drug.id}
                  className={`rounded-2xl border p-4 transition ${drug.color}`}
                >
                  <div
                    onClick={() => setExpandedDrugCard(isExpanded ? null : drug.id)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div>
                      <span className="text-[10px] font-black tracking-wider text-red-600 uppercase">
                        {drug.dangerLevel}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">{drug.name}</h4>
                    </div>

                    <button className="p-1 text-slate-500 hover:text-slate-800">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-2 animate-in fade-in">
                      <div>
                        <strong className="text-slate-800">Hình thức ngụy trang:</strong>
                        <p className="text-slate-600 mt-0.5">{drug.appearance}</p>
                      </div>

                      <div>
                        <strong className="text-slate-800">Bản chất & Tác hại:</strong>
                        <p className="text-slate-600 mt-0.5">{drug.reality}</p>
                      </div>

                      <div className="p-2.5 bg-red-600 text-white rounded-xl font-bold flex items-start gap-1.5 mt-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                        <span>Lời khuyên an toàn: {drug.alertText}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: BÓC TRẦN LỜI ĐỒN VỀ THUỐC LÁ ĐIỆN TỬ (POD / VAPE) */}
      {(activeCategory === 'all' || activeCategory === 'vape' || activeCategory === 'thuoc-la') && (
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              BÓC TRẦN NGỘ NHẬN VỀ THUỐC LÁ ĐIỆN TỬ (POD / VAPE)
            </h3>
          </div>

          <div className="space-y-3">
            {vapeMyths.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-start gap-2 text-rose-700 font-bold">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Lời đồn sai lệch: {item.myth}</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-800 font-medium pl-6">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>Sự thật khoa học: {item.truth}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: PHÒNG CHỐNG BẠO LỰC HỌC ĐƯỜNG & BẮT NẠT MẠNG */}
      {(activeCategory === 'all' || activeCategory === 'bao-luc') && (
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sky-800 font-black text-sm uppercase">
            <Users className="w-4 h-4" />
            <span>PHÒNG CHỐNG BẠO LỰC HỌC ĐƯỜNG & BẮT NẠT MẠNG</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {violenceRules.map((rule, idx) => (
              <div key={idx} className="p-4 bg-sky-50/60 border border-sky-200/80 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-sky-950 text-sm">{rule.title}</h4>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">Biểu hiện:</span> {rule.examples}
                </div>
                <div className="p-2 bg-white rounded-xl border border-sky-100 text-sky-900 font-bold">
                  🛡️ Hành động: {rule.action}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
            <span>Nếu bạn hoặc bạn bè đang là nạn nhân, đừng chịu đựng một mình!</span>
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shrink-0 ml-2"
            >
              Báo Cáo Ẩn Danh
            </button>
          </div>
        </section>
      )}

      {/* SECTION 4: DANH SÁCH BÀI VIẾT NỔI BẬT */}
      <section className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 uppercase">
              BÀI VIẾT & PHÓNG SỰ ĐIỀU TRA HỌC ĐƯỜNG (NGUỒN BÁO MẠNG CHÍNH THỐNG)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {NEWS_ARTICLES.map((art) => (
            <div
              key={art.id}
              className="p-4 rounded-3xl border border-slate-200 hover:border-emerald-400 bg-white hover:shadow-md transition flex flex-col justify-between group"
            >
              <div onClick={() => onSelectArticle(art)} className="cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden mb-3 aspect-video bg-slate-900">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span>{art.verifiedBadge || art.sourceName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {art.categoryLabel}
                  </span>
                  <span>•</span>
                  <span>{art.date}</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mt-0.5">
                  {art.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectArticle(art)}
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Chi tiết</span> ➔
                </button>

                {art.sourceUrl && (
                  <a
                    href={art.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition flex items-center gap-1 border border-emerald-200"
                    title="Mở bài viết trực tiếp tại nguồn báo an ninh mạng"
                  >
                    <span>Nguồn báo</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
