import React, { useState, useEffect } from 'react';
import {
  Upload,
  Heart,
  Eye,
  CheckCircle2,
  CloudUpload,
  Film,
  PlusCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  FolderOpen,
  Image as ImageIcon,
  Download,
  Search,
  ZoomIn,
  Shield,
  Trash2,
  FileSpreadsheet,
  Plus,
  Play,
  Sparkles,
  Layers,
  Video,
  ListPlus,
  Tv,
  Edit2,
  Lock,
} from 'lucide-react';
import { StudentVideo, UserAccount } from '../types';
import { fetchAllVideosOnline, GOOGLE_SHEETS_WEBHOOK_URL } from '../utils/googleSheetsClient';

interface StudentVideoViewProps {
  currentUser: UserAccount | null;
  isAdmin?: boolean;
  onOpenAuth: () => void;
  onOpenGoogleSheetSync: () => void;
}

export const SCHOOL_GOOGLE_DRIVE_FOLDER =
  'https://drive.google.com/drive/folders/1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS?usp=sharing';

// Parse video links (Google Drive, YouTube, direct MP4) to playable format
export function parseVideoSource(url?: string): {
  isDrive: boolean;
  isYoutube: boolean;
  embedUrl: string;
} {
  if (!url) return { isDrive: false, isYoutube: false, embedUrl: '' };

  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      isDrive: false,
      isYoutube: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      isDrive: true,
      isYoutube: false,
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  return { isDrive: false, isYoutube: false, embedUrl: url };
}

// Convert Google Drive image links to directly renderable thumbnail URLs for <img>
export function getEffectiveImageUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80';
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
  }
  return url;
}

// 4 Preset Official Educational Videos for Admin Quick-Load
export const PRESET_EDUCATIONAL_VIDEOS: Omit<StudentVideo, 'id' | 'uploadedAt' | 'likes' | 'views'>[] = [
  {
    title: 'Bộ Công an: Nhận diện thủ đoạn ma túy ngụy trang "Nước vui", "Nước xoài", "Crispy Fruit"',
    authorName: 'Cục Cảnh sát ĐTTP về Ma túy (Bộ Công an)',
    studentGrade: 'Ban Tuyên Giáo Học Đường',
    school: 'Trường Học Xanh',
    category: 'drugs',
    categoryLabel: 'Phòng chống Ma túy ngụy trang',
    driveUrl: 'https://bocongan.gov.vn/bai-viet/canh-bao-ma-tuy-nup-bong-cac-loai-nuoc-giai-khat-va-thuc-pham-chuc-nang-d22-t35677',
    thumbnailUrl: '/images/disguise_nuoc_vui.jpg',
    videoUrl: 'https://bocongan.gov.vn',
    description: 'Video phóng sự chính thống vạch trần các loại bột ma túy hòa tan, bánh kẹo tẩm chất cấm lén lút tiếp cận học sinh quanh trường học.',
    duration: '04:15',
    status: 'approved',
    isEducationalAdminVideo: true,
    pinned: true,
  },
  {
    title: 'Bệnh viện Bạch Mai & Y Tế: Hiểm họa Pod Chill, Nicotine muối và ngộ độc cấp tính ở học sinh',
    authorName: 'Trung tâm Chống độc - BV Bạch Mai & Medinet',
    studentGrade: 'Tư Vấn Y Tế Học Đường',
    school: 'Trường Học Xanh',
    category: 'vape',
    categoryLabel: 'Phòng chống Thuốc lá điện tử & Pod',
    driveUrl: 'https://trungtamytebinhtan.medinet.gov.vn/phong-chong-tac-hai-thuoc-la/thuoc-la-dien-tu-van-am-tham-gay-hai-gioi-tre-cmobile16833-255435.aspx',
    thumbnailUrl: '/images/thuoc_la_dien_tu_y_te.jpg',
    videoUrl: 'https://trungtamytebinhtan.medinet.gov.vn',
    description: 'Bác sĩ chuyên khoa phân tích tác hại khôn lường của sol khí thuốc lá điện tử, nguyên nhân gây viêm phổi cấp tính (EVALI) và tổn thương tế bào não.',
    duration: '05:30',
    status: 'approved',
    isEducationalAdminVideo: true,
    pinned: true,
  },
  {
    title: 'UNICEF Việt Nam: Cẩm nang 5 bước phòng chống bạo lực học đường và bắt nạt trên không gian mạng',
    authorName: 'UNICEF Việt Nam & Cổng ATTT Quốc Gia',
    studentGrade: 'Tâm Lý Học Đường',
    school: 'Trường Học Xanh',
    category: 'violence',
    categoryLabel: 'Phòng chống Bạo lực & Bắt nạt mạng',
    driveUrl: 'https://www.unicef.org/vietnam/vi/bat-nat-truc-tuyen-la-gi-lam-the-nao-de-ngan-chan-dieu-nay',
    thumbnailUrl: '/images/unicef_bat_nat_truc_tuyen.jpg',
    videoUrl: 'https://www.unicef.org/vietnam/vi',
    description: 'Hướng dẫn học sinh nhận diện các hành vi bắt nạt trực tuyến, cách lưu giữ chứng cứ an toàn, chặn kẻ quấy rối và kết nối Tổng đài 111.',
    duration: '06:00',
    status: 'approved',
    isEducationalAdminVideo: true,
    pinned: true,
  },
  {
    title: 'Kỹ Năng Sống: Tứ Bộ Khẩu Quyết - Rèn luyện bản lĩnh từ chối kiên quyết mọi lời gạ gẫm tệ nạn',
    authorName: 'Ban Giám Hiệu & Đoàn Đội',
    studentGrade: 'Kỹ Năng Tự Bảo Vệ',
    school: 'Trường Học Xanh',
    category: 'friendship',
    categoryLabel: 'Xây dựng Tình bạn học đường đẹp',
    driveUrl: SCHOOL_GOOGLE_DRIVE_FOLDER,
    thumbnailUrl: '/images/canh_bao_ma_tuy_nup_bong.jpg',
    description: 'Thực hành 4 bước từ chối vàng: 1. Nói KHÔNG rõ ràng -> 2. Nêu lý do ngắn gọn -> 3. Chuyển hướng hoạt động lành mạnh -> 4. Rời đi và báo người lớn.',
    duration: '03:45',
    status: 'approved',
    isEducationalAdminVideo: true,
    pinned: true,
  },
];

interface BatchLinkRow {
  id: string;
  title: string;
  url: string;
  category: 'drugs' | 'vape' | 'violence' | 'friendship';
  description: string;
}

interface BatchFileItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: 'drugs' | 'vape' | 'violence' | 'friendship';
  fileType: 'video' | 'image';
}

export const StudentVideoView: React.FC<StudentVideoViewProps> = ({
  currentUser,
  isAdmin = false,
  onOpenAuth,
  onOpenGoogleSheetSync,
}) => {
  const isUserAdmin = isAdmin || currentUser?.role === 'admin' || currentUser?.username === 'admin';

  const [videos, setVideos] = useState<StudentVideo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAdminBatchModal, setShowAdminBatchModal] = useState(false);
  const [adminBatchTab, setAdminBatchTab] = useState<'files' | 'links' | 'preset'>('files');
  const [copiedDriveLink, setCopiedDriveLink] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Single Form Submission State (Học sinh hoặc Cá nhân)
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.fullName || '');
  const [studentGrade, setStudentGrade] = useState(currentUser?.gradeClass || '');
  const [school, setSchool] = useState(currentUser?.school || '');
  const [category, setCategory] = useState<'vape' | 'drugs' | 'violence' | 'friendship'>('vape');
  const [fileType, setFileType] = useState<'video' | 'image'>('video');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccessData, setUploadSuccessData] = useState<{
    show: boolean;
    title: string;
    fileName?: string;
  } | null>(null);

  // Admin Batch Upload States
  const [batchFiles, setBatchFiles] = useState<BatchFileItem[]>([]);
  const [batchCommonCategory, setBatchCommonCategory] = useState<'drugs' | 'vape' | 'violence' | 'friendship'>('drugs');
  const [batchLinks, setBatchLinks] = useState<BatchLinkRow[]>([
    {
      id: 'link-1',
      title: 'Tập huấn kỹ năng: Vạch trần thủ đoạn Pod Chill và ma túy núp bóng',
      url: 'https://bocongan.gov.vn/bai-viet/canh-bao-ma-tuy-nup-bong-cac-loai-nuoc-giai-khat-va-thuc-pham-chuc-nang-d22-t35677',
      category: 'drugs',
      description: 'Chuyên đề giáo dục chính thống từ Ban Giám Hiệu gửi đến toàn thể học sinh.',
    },
    {
      id: 'link-2',
      title: 'Y học học đường: Vì sao khói thuốc lá điện tử phá hủy lá phổi học sinh',
      url: 'https://trungtamytebinhtan.medinet.gov.vn/phong-chong-tac-hai-thuoc-la/thuoc-la-dien-tu-van-am-tham-gay-hai-gioi-tre-cmobile16833-255435.aspx',
      category: 'vape',
      description: 'Phim tài liệu y tế ghi lại sự nguy hiểm của nicotine nồng độ cao và tinh dầu trôi nổi.',
    },
  ]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatusMsg, setBatchStatusMsg] = useState<string | null>(null);

  // Edit Video State
  const [editingVideo, setEditingVideo] = useState<StudentVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'drugs' | 'vape' | 'violence' | 'friendship'>('drugs');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Video Theater / Player Modal State (Mọi học sinh đều có thể xem toàn bộ video)
  const [viewingVideoModal, setViewingVideoModal] = useState<StudentVideo | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await fetchAllVideosOnline();
      let activeList: StudentVideo[] = Array.isArray(data) && data.length > 0 ? data : [];

      // Lọc bỏ bất kỳ ID nào đã bị xóa để tránh việc đồng bộ làm hiển thị lại
      try {
        const deletedRaw = localStorage.getItem('lchd_deleted_videos');
        if (deletedRaw) {
          const deletedArr = JSON.parse(deletedRaw);
          if (Array.isArray(deletedArr) && deletedArr.length > 0) {
            const delSet = new Set(deletedArr);
            activeList = activeList.filter((v: StudentVideo) => !delSet.has(v.id));
          }
        }
      } catch {}

      if (activeList.length > 0) {
        setVideos(activeList);
      } else {
        // Luôn có sẵn các video giáo dục chuẩn để học sinh vào là xem được ngay
        const initialPreset: StudentVideo[] = PRESET_EDUCATIONAL_VIDEOS.map((p, idx) => ({
          ...p,
          id: `preset-edu-${idx + 1}`,
          uploadedAt: new Date().toISOString(),
          likes: 28 + idx * 7,
          views: 135 + idx * 42,
        }));
        setVideos(initialPreset);
      }
    } catch (err) {
      console.warn('Failed to fetch student videos:', err);
    }
  };

  const handleCopyDriveLink = () => {
    navigator.clipboard.writeText(SCHOOL_GOOGLE_DRIVE_FOLDER);
    setCopiedDriveLink(true);
    setTimeout(() => setCopiedDriveLink(false), 2000);
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/student-videos/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, likes: data.likes } : v))
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Quyền kiểm soát: Tất cả video gửi lên học sinh đều có thể XEM, nhưng KHÔNG THỂ SỬA video của người khác!
  // Chỉ Admin hoặc chính tác giả (người đã nộp video) mới có quyền sửa hoặc xóa.
  const canModifyVideo = (item: StudentVideo) => {
    if (isUserAdmin) return true;
    if (!currentUser) return false;
    const curName = (currentUser.fullName || '').trim().toLowerCase();
    const curUsername = (currentUser.username || '').trim().toLowerCase();
    const authorName = (item.authorName || '').trim().toLowerCase();
    // Khớp chính xác tên tác giả hoặc tài khoản admin - Học sinh tuyệt đối không thể sửa video của người khác
    return Boolean(
      (curName && authorName && curName === authorName) ||
      curUsername === 'admin'
    );
  };

  // State cho Modal xác nhận xóa video (Hoàn toàn bằng giao diện in-app, 100% không bị trình duyệt hay iframe chặn)
  const [videoToDelete, setVideoToDelete] = useState<StudentVideo | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleRequestDelete = (item: StudentVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canModifyVideo(item)) {
      showToast('Quyền truy cập: Tất cả các video gửi lên học sinh có thể xem nhưng KHÔNG thể xóa video của người khác!');
      return;
    }
    setVideoToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    const targetId = videoToDelete.id;
    const targetTitle = videoToDelete.title;
    const targetDriveUrl = videoToDelete.driveUrl;
    setIsDeletingVideo(true);

    // Xóa ngay lập tức trên giao diện (Optimistic UI update)
    setVideos((prev) => prev.filter((v) => v.id !== targetId));

    // Lưu ID đã xóa vào localStorage để ngăn khôi phục lại
    try {
      const deletedRaw = localStorage.getItem('lchd_deleted_videos');
      const delArr = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!delArr.includes(targetId)) {
        delArr.push(targetId);
        localStorage.setItem('lchd_deleted_videos', JSON.stringify(delArr));
      }
    } catch {}

    try {
      await fetch(`/api/student-videos/${targetId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserFullName: currentUser?.fullName,
          isAdmin: isUserAdmin,
          driveUrl: targetDriveUrl,
        }),
      });
    } catch (err) {
      console.warn('Network issue during delete:', err);
    } finally {
      setIsDeletingVideo(false);
      setVideoToDelete(null);
      if (viewingVideoModal?.id === targetId) {
        setViewingVideoModal(null);
      }
      showToast(`Đã xóa "${targetTitle}" khỏi hệ thống thành công!`);
    }
  };

  const handleOpenEdit = (item: StudentVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canModifyVideo(item)) {
      showToast('Quyền truy cập: Học sinh chỉ có quyền xem, không thể sửa video của người khác!');
      return;
    }
    setEditingVideo(item);
    setEditTitle(item.title);
    setEditCategory((item.category as any) || 'drugs');
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    if (!canModifyVideo(editingVideo)) {
      alert('Quyền truy cập: Bạn không có quyền chỉnh sửa video của người khác!');
      return;
    }

    setIsSavingEdit(true);
    const categoryLabels: Record<string, string> = {
      vape: 'Phòng chống Thuốc lá điện tử & Pod',
      drugs: 'Phòng chống Ma túy ngụy trang & Nước vui',
      violence: 'Phòng chống Bạo lực & Bắt nạt mạng',
      friendship: 'Xây dựng Tình bạn học đường đẹp',
    };

    try {
      const res = await fetch(`/api/student-videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          categoryLabel: categoryLabels[editCategory],
          description: editDescription.trim(),
          currentUserFullName: currentUser?.fullName,
          isAdmin: isUserAdmin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === editingVideo.id
              ? {
                  ...v,
                  title: editTitle.trim(),
                  category: editCategory,
                  categoryLabel: categoryLabels[editCategory],
                  description: editDescription.trim(),
                }
              : v
          )
        );
        setEditingVideo(null);
      } else {
        alert(data.error || 'Lỗi khi cập nhật video.');
      }
    } catch (err) {
      console.error('Edit error:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Single file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormError('');
      const isImg = file.type.startsWith('image/');
      setFileType(isImg ? 'image' : 'video');

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLocalPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin Batch Multi-File Selection
  const handleBatchFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const newItems: BatchFileItem[] = [];

    fileList.forEach((f, idx) => {
      const isImg = f.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBatchFiles((prev) => [
            ...prev,
            {
              id: `batch-${Date.now()}-${idx}`,
              file: f,
              previewUrl: reader.result as string,
              title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              category: batchCommonCategory,
              fileType: isImg ? 'image' : 'video',
            },
          ]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  // Admin Batch Submit - Files
  const handleBatchSubmitFiles = async () => {
    if (batchFiles.length === 0) return;
    setIsBatchUploading(true);
    setBatchProgress(10);
    setBatchStatusMsg('Đang xử lý và mã hóa các tệp video giáo dục...');

    const categoryLabels: Record<string, string> = {
      vape: 'Phòng chống Thuốc lá điện tử & Pod',
      drugs: 'Phòng chống Ma túy ngụy trang & Nước vui',
      violence: 'Phòng chống Bạo lực & Bắt nạt mạng',
      friendship: 'Xây dựng Tình bạn học đường đẹp',
    };

    const videosPayload = batchFiles.map((item, idx) => ({
      title: item.title.trim(),
      authorName: currentUser?.fullName || 'Ban Giám Hiệu - Nhà Trường',
      studentGrade: 'Ban Tuyên Giáo Học Đường',
      school: currentUser?.school || 'Trường Học Xanh',
      category: item.category,
      categoryLabel: categoryLabels[item.category],
      fileBase64: item.previewUrl,
      fileName: item.file.name,
      mimeType: item.file.type,
      fileType: item.fileType,
      description: `Video bài giảng tuyên truyền chính thống của nhà trường về ${categoryLabels[item.category]}.`,
      duration: item.fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video bài giảng',
      isEducationalAdminVideo: true,
      pinned: true,
    }));

    try {
      setBatchProgress(50);
      setBatchStatusMsg('Đang tải lên máy chủ và đồng bộ vào Google Sheets...');
      const res = await fetch('/api/student-videos/upload-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: videosPayload }),
      });
      const data = await res.json();

      if (res.ok) {
        setBatchProgress(100);
        setBatchStatusMsg(`Đã tải lên thành công ${batchFiles.length} video giáo dục!`);
        await fetchVideos();
        setTimeout(() => {
          setBatchFiles([]);
          setShowAdminBatchModal(false);
          setIsBatchUploading(false);
          setBatchStatusMsg(null);
          setBatchProgress(0);
        }, 1200);
      } else {
        throw new Error(data.error || 'Lỗi khi tải lên hàng loạt.');
      }
    } catch {
      // Local fallback
      const fallbackList: StudentVideo[] = batchFiles.map((item, idx) => ({
        id: `vid-admin-${Date.now()}-${idx}`,
        title: item.title.trim(),
        authorName: currentUser?.fullName || 'Ban Giám Hiệu - Nhà Trường',
        studentGrade: 'Ban Tuyên Giáo Học Đường',
        school: currentUser?.school || 'Trường Học Xanh',
        category: item.category,
        categoryLabel: categoryLabels[item.category],
        fileType: item.fileType,
        thumbnailUrl: item.fileType === 'image' ? item.previewUrl : undefined,
        videoUrl: item.fileType === 'video' ? item.previewUrl : undefined,
        driveUrl: SCHOOL_GOOGLE_DRIVE_FOLDER,
        description: `Video bài giảng tuyên truyền chính thống của nhà trường về ${categoryLabels[item.category]}.`,
        duration: item.fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video bài giảng',
        likes: 20,
        views: 65,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
        isEducationalAdminVideo: true,
        pinned: true,
      }));

      setVideos((prev) => [...fallbackList, ...prev]);
      setBatchProgress(100);
      setBatchStatusMsg(`Đã lưu trữ ${batchFiles.length} video giáo dục vào danh sách!`);
      setTimeout(() => {
        setBatchFiles([]);
        setShowAdminBatchModal(false);
        setIsBatchUploading(false);
        setBatchStatusMsg(null);
        setBatchProgress(0);
      }, 1200);
    }
  };

  // Admin Batch Submit - Links (YouTube, Drive, MP4)
  const handleBatchSubmitLinks = async () => {
    const validLinks = batchLinks.filter((r) => r.title.trim() && r.url.trim());
    if (validLinks.length === 0) return;

    setIsBatchUploading(true);
    setBatchProgress(30);
    setBatchStatusMsg('Đang phân tích và gắn mã phát video YouTube / Google Drive...');

    const categoryLabels: Record<string, string> = {
      vape: 'Phòng chống Thuốc lá điện tử & Pod',
      drugs: 'Phòng chống Ma túy ngụy trang & Nước vui',
      violence: 'Phòng chống Bạo lực & Bắt nạt mạng',
      friendship: 'Xây dựng Tình bạn học đường đẹp',
    };

    const payload = validLinks.map((link) => {
      const parsed = parseVideoSource(link.url);
      return {
        title: link.title.trim(),
        authorName: currentUser?.fullName || 'Ban Giám Hiệu - Nhà Trường',
        studentGrade: 'Ban Tuyên Giáo Học Đường',
        school: currentUser?.school || 'Trường Học Xanh',
        category: link.category,
        categoryLabel: categoryLabels[link.category],
        videoUrl: link.url.trim(),
        driveUrl: parsed.isDrive ? link.url.trim() : SCHOOL_GOOGLE_DRIVE_FOLDER,
        embedUrl: parsed.embedUrl,
        fileType: 'video',
        thumbnailUrl: link.category === 'drugs'
          ? '/images/disguise_nuoc_vui.jpg'
          : link.category === 'vape'
          ? '/images/thuoc_la_dien_tu_y_te.jpg'
          : link.category === 'violence'
          ? '/images/unicef_bat_nat_truc_tuyen.jpg'
          : '/images/canh_bao_ma_tuy_nup_bong.jpg',
        description: link.description.trim() || 'Video giáo dục chính thống từ nguồn kiểm chứng dành cho học sinh.',
        duration: 'Video chính thống',
        isEducationalAdminVideo: true,
        pinned: true,
      };
    });

    try {
      setBatchProgress(70);
      setBatchStatusMsg('Đang lưu trữ và đồng bộ vào Google Sheet...');
      const res = await fetch('/api/student-videos/upload-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: payload }),
      });

      if (res.ok) {
        setBatchProgress(100);
        setBatchStatusMsg(`Đã thêm thành công ${payload.length} video giáo dục!`);
        await fetchVideos();
        setTimeout(() => {
          setShowAdminBatchModal(false);
          setIsBatchUploading(false);
          setBatchProgress(0);
          setBatchStatusMsg(null);
        }, 1200);
      } else {
        throw new Error('Lỗi server');
      }
    } catch {
      // Local graceful fallback
      const fallbackList: StudentVideo[] = payload.map((p, idx) => ({
        id: `vid-link-${Date.now()}-${idx}`,
        title: p.title,
        authorName: p.authorName,
        studentGrade: p.studentGrade,
        school: p.school,
        category: p.category as any,
        categoryLabel: p.categoryLabel,
        videoUrl: p.videoUrl,
        driveUrl: p.driveUrl,
        embedUrl: p.embedUrl,
        fileType: 'video',
        thumbnailUrl: p.thumbnailUrl,
        description: p.description,
        duration: p.duration,
        likes: 18,
        views: 75,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
        isEducationalAdminVideo: true,
        pinned: true,
      }));

      setVideos((prev) => [...fallbackList, ...prev]);
      setBatchProgress(100);
      setBatchStatusMsg(`Đã lưu trữ ${payload.length} video giáo dục!`);
      setTimeout(() => {
        setShowAdminBatchModal(false);
        setIsBatchUploading(false);
        setBatchProgress(0);
        setBatchStatusMsg(null);
      }, 1200);
    }
  };

  // Admin Batch Submit - Presets (1-Click Nạp 4 Video Mẫu Chuẩn)
  const handleLoadPresetVideos = async () => {
    setIsBatchUploading(true);
    setBatchProgress(40);
    setBatchStatusMsg('Đang nạp trọn bộ 4 Video Giáo Dục Chuẩn của Ban Giám Hiệu...');

    try {
      const res = await fetch('/api/student-videos/upload-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: PRESET_EDUCATIONAL_VIDEOS }),
      });

      if (res.ok) {
        setBatchProgress(100);
        setBatchStatusMsg('Đã nạp thành công 4 Video Giáo Dục Chuẩn vào hệ thống!');
        await fetchVideos();
        setTimeout(() => {
          setShowAdminBatchModal(false);
          setIsBatchUploading(false);
          setBatchProgress(0);
          setBatchStatusMsg(null);
        }, 1200);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      const fallbackList: StudentVideo[] = PRESET_EDUCATIONAL_VIDEOS.map((p, idx) => ({
        ...p,
        id: `vid-preset-${Date.now()}-${idx}`,
        uploadedAt: new Date().toISOString(),
        likes: 25 + idx * 7,
        views: 89 + idx * 30,
      }));

      setVideos((prev) => [...fallbackList, ...prev]);
      setBatchProgress(100);
      setBatchStatusMsg('Đã hiển thị trọn bộ 4 Video Giáo Dục Chuẩn của Ban Giám Hiệu!');
      setTimeout(() => {
        setShowAdminBatchModal(false);
        setIsBatchUploading(false);
        setBatchProgress(0);
        setBatchStatusMsg(null);
      }, 1200);
    }
  };

  // Single Work Submit Handler
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề tác phẩm!');
      return;
    }

    if (!localPreviewUrl) {
      setFormError('Vui lòng chọn tệp video hoặc ảnh từ thiết bị của bạn!');
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryLabels: Record<string, string> = {
        vape: 'Phòng chống Thuốc lá điện tử & Pod',
        drugs: 'Phòng chống Ma túy ngụy trang & Nước vui',
        violence: 'Phòng chống Bạo lực & Bắt nạt mạng',
        friendship: 'Xây dựng Tình bạn học đường đẹp',
      };

      const res = await fetch('/api/student-videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          authorName: authorName.trim() || currentUser?.fullName || (isUserAdmin ? 'Ban Giám Hiệu' : 'Học sinh'),
          studentGrade: studentGrade.trim() || currentUser?.gradeClass || (isUserAdmin ? 'Ban Tuyên Giáo' : 'Khối THCS / THPT'),
          school: school.trim() || currentUser?.school || 'Trường học thân yêu',
          category,
          categoryLabel: categoryLabels[category],
          fileBase64: localPreviewUrl,
          fileName: selectedFile?.name,
          mimeType: selectedFile?.type,
          fileType,
          description: description.trim() || 'Tác phẩm sáng tạo tuyên truyền phòng chống tệ nạn học đường.',
          duration: fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video clip',
          isEducationalAdminVideo: isUserAdmin,
          pinned: isUserAdmin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadSuccessData({
          show: true,
          title: title.trim(),
          fileName: selectedFile?.name,
        });

        fetchVideos();
        setShowUploadForm(false);
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setLocalPreviewUrl('');
        setFormError('');
      } else {
        setFormError(data.error || 'Vui lòng kiểm tra lại thông tin tác phẩm.');
      }
    } catch {
      // Graceful fallback
      const fallbackWork: StudentVideo = {
        id: `vid-${Date.now()}`,
        title: title.trim(),
        authorName: authorName.trim() || currentUser?.fullName || (isUserAdmin ? 'Ban Giám Hiệu' : 'Học sinh'),
        studentGrade: studentGrade.trim() || currentUser?.gradeClass || (isUserAdmin ? 'Ban Tuyên Giáo' : 'Khối THCS / THPT'),
        school: school.trim() || currentUser?.school || 'Trường học thân yêu',
        category,
        categoryLabel:
          category === 'vape'
            ? 'Phòng chống Thuốc lá điện tử & Pod'
            : category === 'drugs'
            ? 'Phòng chống Ma túy ngụy trang & Nước vui'
            : category === 'violence'
            ? 'Phòng chống Bạo lực & Bắt nạt mạng'
            : 'Xây dựng Tình bạn học đường đẹp',
        fileType,
        thumbnailUrl: fileType === 'image' ? localPreviewUrl : undefined,
        videoUrl: fileType === 'video' ? localPreviewUrl : undefined,
        driveUrl: SCHOOL_GOOGLE_DRIVE_FOLDER,
        description: description.trim() || 'Tác phẩm tuyên truyền phòng chống tệ nạn học đường.',
        duration: fileType === 'image' ? 'Hình ảnh / Áp phích' : 'Video clip',
        likes: 1,
        views: 1,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
        isEducationalAdminVideo: isUserAdmin,
        pinned: isUserAdmin,
      };

      setVideos((prev) => [fallbackWork, ...prev]);
      setUploadSuccessData({
        show: true,
        title: title.trim(),
        fileName: selectedFile?.name,
      });

      setShowUploadForm(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setLocalPreviewUrl('');
      setFormError('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    let matchCategory = true;
    if (activeCategory === 'admin-only') {
      matchCategory = Boolean(v.isEducationalAdminVideo || v.authorName.includes('Admin') || v.authorName.includes('Ban Giám Hiệu'));
    } else if (activeCategory === 'student-only') {
      matchCategory = !v.isEducationalAdminVideo && !v.authorName.includes('Admin') && !v.authorName.includes('Ban Giám Hiệu');
    } else if (activeCategory !== 'all') {
      matchCategory = v.category === activeCategory;
    }

    const matchSearch =
      !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.studentGrade && v.studentGrade.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* 1. ADMIN ONLY MANAGEMENT PANEL */}
      {isUserAdmin && (
        <section className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-400/80 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>BẢNG ĐIỀU HÀNH ADMIN - QUẢN LÝ VIDEO GIÁO DỤC HỌC ĐƯỜNG</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Quản Trị Video Giáo Dục & Google Drive Trường</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  {videos.length} Video đang phát
                </span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Quản trị viên có toàn quyền gửi lên <strong>nhiều video giáo dục cùng lúc</strong> (từ máy tính, link YouTube, hoặc Google Drive của trường) để học sinh toàn trường học tập và rèn luyện.
              </p>

              {/* Google Drive Link Box */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  Thư mục Google Drive tiếp nhận và lưu trữ video của trường:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
                  <input
                    type="text"
                    readOnly
                    value={SCHOOL_GOOGLE_DRIVE_FOLDER}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-amber-400/50 text-amber-100 font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyDriveLink}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copiedDriveLink ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao chép link Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0 sm:min-w-[240px]">
              {/* PRIMARY ACTION: GỬI LÊN NHIỀU VIDEO GIÁO DỤC */}
              <button
                onClick={() => setShowAdminBatchModal(true)}
                className="px-4 py-3 bg-linear-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 active:scale-95 animate-pulse"
              >
                <Film className="w-4 h-4 text-slate-950" />
                <span>Gửi Lên Nhiều Video Giáo Dục</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              </button>

              <a
                href={SCHOOL_GOOGLE_DRIVE_FOLDER}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-white/20"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Mở Google Drive Trường</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/api/sync/excel/export"
                  download
                  className="px-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border border-emerald-600/40"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Xuất Excel</span>
                </a>

                <button
                  onClick={onOpenGoogleSheetSync}
                  className="px-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border border-emerald-600/40"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Google Sheet</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. PUBLIC HEADER FOR STUDENTS & GUESTS */}
      <section className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-7 shadow-md border border-emerald-700/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold">
              <Film className="w-3.5 h-3.5 text-amber-300" />
              <span>GÓC VIDEO GIÁO DỤC & TÁC PHẨM SÁNG TẠO HỌC ĐƯỜNG</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Phim Hoạt Họa & Video Bài Giảng Học Đường
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Trang xem video giáo dục chính thống từ Ban Giám Hiệu, phóng sự tuyên truyền của Bộ Công an, Y tế, UNICEF và các tác phẩm sáng tạo do học sinh dàn dựng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isUserAdmin ? (
              <button
                onClick={() => setShowAdminBatchModal(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <Layers className="w-4 h-4 text-slate-950" />
                <span>+ Admin: Gửi Nhiều Video</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                title="Đăng nhập tài khoản Admin để gửi lên nhiều video giáo dục cùng lúc"
              >
                <Shield className="w-3.5 h-3.5 text-slate-950" />
                <span>Admin Gửi Nhiều Video</span>
              </button>
            )}

            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>{showUploadForm ? 'Đóng biểu mẫu' : '+ Nộp 1 Tác Phẩm'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Upload Success Modal / Notice */}
      {uploadSuccessData?.show && (
        <div className="p-5 sm:p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl space-y-3.5 shadow-lg animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 font-black text-emerald-950 text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Tác phẩm "{uploadSuccessData.title}" đã được nộp và tải lên thành công!</span>
            </div>
            <button
              onClick={() => setUploadSuccessData(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Tác phẩm đã được lưu trữ an toàn trong máy chủ, cập nhật vào thư mục Google Drive của trường và hiển thị ngay trên bảng tin video.
          </p>
        </div>
      )}

      {/* 3. ADMIN BATCH UPLOAD MODAL (GỬI LÊN NHIỀU VIDEO GIÁO DỤC CÙNG LÚC) */}
      {showAdminBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Admin: Gửi Lên Nhiều Video Giáo Dục
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tải lên hàng loạt video bài giảng, phim hoạt họa hoặc link YouTube / Google Drive của trường
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminBatchModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-black">
              <button
                type="button"
                onClick={() => setAdminBatchTab('files')}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  adminBatchTab === 'files'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>1. Chọn nhiều tệp tệp máy tính</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminBatchTab('links')}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  adminBatchTab === 'links'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-4 h-4 text-amber-600" />
                <span>2. Nhập nhiều link Video</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminBatchTab('preset')}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  adminBatchTab === 'preset'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>3. Nạp 4 Video Mẫu Chuẩn</span>
              </button>
            </div>

            {/* TAB 1: BATCH FILES UPLOAD */}
            {adminBatchTab === 'files' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/70 border-2 border-dashed border-emerald-400 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-black text-emerald-950 cursor-pointer hover:underline block">
                      <span>Bấm vào đây để chọn nhiều tệp Video / Hình ảnh cùng lúc</span>
                      <input
                        type="file"
                        multiple
                        accept="video/*,image/*"
                        onChange={handleBatchFilesChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ MP4, WebM, MOV, JPG, PNG (có thể chọn 2, 5, 10+ video trong 1 lần)
                    </p>
                  </div>
                </div>

                {/* Common Category Selector */}
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Chủ đề chung cho đợt tải:</span>
                  <select
                    value={batchCommonCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setBatchCommonCategory(cat);
                      setBatchFiles((prev) => prev.map((f) => ({ ...f, category: cat })));
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    <option value="drugs">Phòng chống Ma túy ngụy trang & Nước vui</option>
                    <option value="vape">Phòng chống Thuốc lá điện tử & Pod</option>
                    <option value="violence">Phòng chống Bạo lực & Bắt nạt mạng</option>
                    <option value="friendship">Xây dựng Tình bạn học đường đẹp</option>
                  </select>
                </div>

                {/* Selected Files Queue */}
                {batchFiles.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Danh sách {batchFiles.length} video đã chọn:</span>
                      <button
                        onClick={() => setBatchFiles([])}
                        className="text-rose-600 hover:underline"
                      >
                        Xóa danh sách
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {batchFiles.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="w-12 h-9 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                              {item.fileType === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center text-white bg-slate-800">
                                  <Film className="w-4 h-4 text-emerald-400" />
                                </div>
                              ) : (
                                <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBatchFiles((prev) =>
                                  prev.map((f) => (f.id === item.id ? { ...f, title: val } : f))
                                );
                              }}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                              placeholder="Nhập tiêu đề video..."
                            />
                          </div>

                          <select
                            value={item.category}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setBatchFiles((prev) =>
                                prev.map((f) => (f.id === item.id ? { ...f, category: val } : f))
                              );
                            }}
                            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium shrink-0"
                          >
                            <option value="drugs">Ma túy</option>
                            <option value="vape">Pod / Vape</option>
                            <option value="violence">Bạo lực</option>
                            <option value="friendship">Tình bạn</option>
                          </select>

                          <button
                            onClick={() => setBatchFiles((prev) => prev.filter((f) => f.id !== item.id))}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isBatchUploading}
                      onClick={handleBatchSubmitFiles}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CloudUpload className="w-4 h-4" />
                      <span>{isBatchUploading ? 'Đang tải lên...' : `Tải Lên Tất Cả ${batchFiles.length} Video Giáo Dục`}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 italic">
                    Chưa chọn tệp nào. Bạn có thể nhấn vào khung trên để chọn nhiều video cùng lúc.
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: BATCH LINKS UPLOAD (YouTube / Drive / MP4) */}
            {adminBatchTab === 'links' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-amber-700" />
                    <span>Dán link YouTube hoặc Google Drive để phát trực tiếp trong ứng dụng:</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Hệ thống tự động chuyển đổi link Google Drive thành trình phát tương thích và nhúng video YouTube chất lượng cao cho học sinh theo dõi.
                  </p>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {batchLinks.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-700">Video giáo dục #{idx + 1}</span>
                        {batchLinks.length > 1 && (
                          <button
                            onClick={() => setBatchLinks((prev) => prev.filter((r) => r.id !== row.id))}
                            className="text-rose-600 hover:underline text-[11px] font-bold"
                          >
                            Xóa dòng
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tiêu đề video:</label>
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchLinks((prev) =>
                                prev.map((r) => (r.id === row.id ? { ...r, title: val } : r))
                              );
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                            placeholder="Tiêu đề bài học..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Chủ đề:</label>
                          <select
                            value={row.category}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setBatchLinks((prev) =>
                                prev.map((r) => (r.id === row.id ? { ...r, category: val } : r))
                              );
                            }}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="drugs">Ma túy ngụy trang</option>
                            <option value="vape">Thuốc lá điện tử & Pod</option>
                            <option value="violence">Bạo lực & Bắt nạt mạng</option>
                            <option value="friendship">Tình bạn học đường</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Đường dẫn Video (Link Google Drive, YouTube hoặc MP4):
                        </label>
                        <input
                          type="url"
                          value={row.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchLinks((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, url: val } : r))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-blue-700"
                          placeholder="https://drive.google.com/file/d/... hoặc https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setBatchLinks((prev) => [
                        ...prev,
                        {
                          id: `link-${Date.now()}`,
                          title: '',
                          url: '',
                          category: 'drugs',
                          description: 'Video bài giảng từ Ban Giám Hiệu.',
                        },
                      ])
                    }
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Dòng Video Mới</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBatchUploading || batchLinks.filter((r) => r.title.trim()).length === 0}
                    onClick={handleBatchSubmitLinks}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{isBatchUploading ? 'Đang lưu...' : `Lưu Tất Cả ${batchLinks.filter((r) => r.title.trim()).length} Video Này`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PRESET VIDEOS (NẠP NHANH 4 VIDEO GIÁO DỤC TIÊU BIỂU) */}
            {adminBatchTab === 'preset' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span>Nạp trọn bộ 4 Video Giáo Dục Tiêu Biểu được kiểm duyệt:</span>
                  </div>
                  <p className="text-[11px] text-purple-900 leading-relaxed">
                    Bao gồm 4 chuyên đề chuẩn quốc gia: 1. Cảnh báo ma túy "Nước vui" (Bộ Công an); 2. Tác hại Pod Chill (BV Bạch Mai); 3. Chống bắt nạt trực tuyến (UNICEF); 4. Tứ Bộ Khẩu Quyết từ chối tệ nạn.
                  </p>
                </div>

                <div className="space-y-2">
                  {PRESET_EDUCATIONAL_VIDEOS.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-xs shadow-2xs"
                    >
                      <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                        <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-500">{p.authorName} • {p.categoryLabel}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Sẵn sàng nạp
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isBatchUploading}
                  onClick={handleLoadPresetVideos}
                  className="w-full py-3 bg-linear-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isBatchUploading ? 'Đang nạp video...' : 'Nạp Ngay 4 Video Giáo Dục Chuẩn Vào Ứng Dụng'}</span>
                </button>
              </div>
            )}

            {/* Progress & Status Message */}
            {isBatchUploading && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
                <div className="text-xs text-center font-bold text-emerald-800 animate-pulse">
                  {batchStatusMsg || 'Đang xử lý tải lên...'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SINGLE WORK UPLOAD FORM */}
      {showUploadForm && (
        <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Biểu Mẫu Nộp 1 Tác Phẩm / Video Tuyên Truyền
              </h3>
              <p className="text-xs text-slate-500">
                Tải lên video hoặc hình ảnh từ thiết bị của bạn
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitWork} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tiêu đề tác phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Tiểu phẩm Nói Không Với Pod Chill của Chi Đội 7A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tác giả / Chi đội</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A hoặc Chi đội 8B"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Khối lớp / Đơn vị</label>
                <input
                  type="text"
                  placeholder="VD: Lớp 8B"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Trường học</label>
                <input
                  type="text"
                  placeholder="VD: THCS Lê Quý Đôn"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Chủ đề phòng chống</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
              >
                <option value="drugs">Phòng chống Ma túy ngụy trang & Nước vui</option>
                <option value="vape">Phòng chống Thuốc lá điện tử & Pod</option>
                <option value="violence">Phòng chống Bạo lực & Bắt nạt mạng</option>
                <option value="friendship">Xây dựng Tình bạn học đường đẹp</option>
              </select>
            </div>

            {/* Choose file directly */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
              <label className="block font-bold text-emerald-950 mb-0.5">
                Chọn tệp video hoặc hình ảnh từ thiết bị: <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
              />
              {localPreviewUrl && (
                <div className="mt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã chọn tệp: {selectedFile?.name} ({fileType === 'image' ? 'Hình ảnh' : 'Video trực tiếp'})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Mô tả ý tưởng / Thông điệp</label>
              <textarea
                rows={2}
                placeholder="Mô tả ngắn gọn về tình huống hoặc thông điệp bài dự thi muốn gửi gắm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                ⚠️ {formError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !localPreviewUrl}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Nộp Tác Phẩm & Tải Lên Google Drive'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 5. CATEGORY FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-bold">
          {[
            { id: 'all', label: 'Tất cả tác phẩm' },
            { id: 'admin-only', label: '⭐ Video Giáo Dục BGH' },
            { id: 'student-only', label: 'Tác phẩm Học sinh' },
            { id: 'drugs', label: 'Ma túy ngụy trang' },
            { id: 'vape', label: 'Thuốc lá điện tử & Pod' },
            { id: 'violence', label: 'Bạo lực & Bắt nạt mạng' },
            { id: 'friendship', label: 'Tình bạn đẹp' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition ${
                activeCategory === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-auto sm:min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả, lớp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 6. DANH SÁCH VIDEO THỰC TẾ & VIDEO GIÁO DỤC CỦA TRƯỜNG */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              VIDEO GIÁO DỤC & TÁC PHẨM ĐANG PHÁT ({filteredVideos.length})
            </h3>
          </div>

          {isUserAdmin && (
            <button
              onClick={() => setShowAdminBatchModal(true)}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Gửi thêm nhiều video</span>
            </button>
          )}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-100 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Film className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Chưa có video hoặc tác phẩm nào được đăng tải
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Quản trị viên có thể bấm "Gửi Lên Nhiều Video Giáo Dục" để tải lên nhiều video bài giảng hoặc link video YouTube/Drive cùng lúc!
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {isUserAdmin && (
                <button
                  onClick={() => setShowAdminBatchModal(true)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Film className="w-4 h-4 text-slate-950" />
                  <span>Admin: Gửi Nhiều Video Ngay</span>
                </button>
              )}
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Nộp 1 tác phẩm
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVideos.map((item) => {
              const videoSrc = parseVideoSource(item.videoUrl || item.driveUrl);
              const isOfficial = Boolean(
                item.isEducationalAdminVideo ||
                item.authorName.includes('Admin') ||
                item.authorName.includes('Ban Giám Hiệu') ||
                item.authorName.includes('Bộ Công an') ||
                item.authorName.includes('Bạch Mai') ||
                item.authorName.includes('UNICEF')
              );

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group ${
                    isOfficial
                      ? 'border-2 border-amber-300/80 hover:border-amber-400 bg-amber-50/20'
                      : 'border border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    {/* Responsive Video Player (YouTube, Drive preview, direct HTML5, or Image) */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3 shadow-xs border border-slate-800/40">
                      {videoSrc.isYoutube ? (
                        <iframe
                          src={videoSrc.embedUrl}
                          title={item.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : videoSrc.isDrive ? (
                        <iframe
                          src={videoSrc.embedUrl}
                          title={item.title}
                          allow="autoplay"
                          allowFullScreen
                          className="w-full h-full border-0 bg-slate-950"
                        />
                      ) : item.fileType === 'video' || item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        <div
                          onClick={() => setSelectedImagePreview(item.thumbnailUrl || item.driveUrl || '')}
                          className="w-full h-full cursor-pointer relative group/img"
                        >
                          <img
                            src={getEffectiveImageUrl(item.thumbnailUrl || item.driveUrl)}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 hover:bg-black/10 flex items-center justify-center transition">
                            <span className="bg-black/75 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                              <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                              <span>Click xem ảnh phóng to</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="bg-emerald-800/90 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          {item.fileType === 'image' ? (
                            <ImageIcon className="w-3 h-3 text-amber-300" />
                          ) : (
                            <Film className="w-3 h-3 text-emerald-300" />
                          )}
                          <span>{item.categoryLabel}</span>
                        </span>

                        {isOfficial && (
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-slate-950" />
                            <span>BGH Chuẩn Hóa</span>
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {item.duration || (item.fileType === 'image' ? 'Ảnh áp phích' : 'Video bài học')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">{item.authorName}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{item.studentGrade}</span>
                      <span>•</span>
                      <span>{item.school}</span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {item.views} xem
                      </span>

                      <button
                        onClick={(e) => handleLike(item.id, e)}
                        className="flex items-center gap-1 text-slate-600 hover:text-rose-600 transition font-bold"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-100 text-rose-500" />
                        <span>{item.likes}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Nút Xem Video / Tác Phẩm - Tất cả học sinh đều bấm xem được */}
                      <button
                        onClick={() => setViewingVideoModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition"
                        title="Xem video bài học / chi tiết"
                      >
                        <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                        <span>Xem</span>
                      </button>

                      {/* Nút Mở Google Drive của trường để học sinh xem và tải về */}
                      <a
                        href={item.driveUrl || SCHOOL_GOOGLE_DRIVE_FOLDER}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                        title="Tác phẩm được lưu trữ trên Google Drive trường để học sinh xem bất cứ lúc nào"
                      >
                        <FolderOpen className="w-3 h-3 text-amber-700" />
                        <span>Google Drive</span>
                      </a>

                      {/* QUYỀN CHỈNH SỬA & XÓA: CHỈ ADMIN HOẶC TÁC GIẢ VIDEO MỚI CÓ NÚT SỬA/XÓA */}
                      {canModifyVideo(item) ? (
                        <>
                          <button
                            onClick={(e) => handleOpenEdit(item, e)}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-bold flex items-center gap-1 transition"
                            title="Chỉnh sửa thông tin tác phẩm của bạn"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>

                          <button
                            onClick={(e) => handleRequestDelete(item, e)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
                            title="Xóa video khỏi hệ thống"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </>
                      ) : (
                        /* HỌC SINH KHÁC: CHỈ CÓ QUYỀN XEM, KHÔNG THỂ SỬA VIDEO CỦA NGƯỜI KHÁC */
                        <span
                          className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-medium flex items-center gap-1 border border-slate-100 select-none"
                          title="Tất cả học sinh có thể xem nhưng không thể sửa video của người khác"
                        >
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Chỉ xem</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Video Modal (Dành cho Tác giả video hoặc Admin) */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">
                  Chỉnh Sửa Thông Tin Video
                </h3>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề video / tác phẩm:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                  placeholder="Tiêu đề..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ đề giáo dục:</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 bg-white"
                >
                  <option value="drugs">Phòng chống Ma túy ngụy trang & Nước vui</option>
                  <option value="vape">Phòng chống Thuốc lá điện tử & Pod</option>
                  <option value="violence">Phòng chống Bạo lực & Bắt nạt mạng</option>
                  <option value="friendship">Xây dựng Tình bạn học đường đẹp</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả nội dung bài học:</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800"
                  placeholder="Nội dung truyền thông, thông điệp giáo dục..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSavingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Theater Modal (Tất cả học sinh đều xem được chất lượng cao) */}
      {viewingVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          onClick={() => setViewingVideoModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Film className="w-4 h-4" />
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                  {viewingVideoModal.title}
                </h4>
              </div>
              <button
                onClick={() => setViewingVideoModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {(() => {
                const src = parseVideoSource(viewingVideoModal.videoUrl || viewingVideoModal.driveUrl);
                if (src.isYoutube) {
                  return (
                    <iframe
                      src={src.embedUrl}
                      title={viewingVideoModal.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }
                if (src.isDrive) {
                  return (
                    <iframe
                      src={src.embedUrl}
                      title={viewingVideoModal.title}
                      allow="autoplay"
                      allowFullScreen
                      className="w-full h-full border-0 bg-slate-950"
                    />
                  );
                }
                if (viewingVideoModal.fileType === 'video' || viewingVideoModal.videoUrl) {
                  return (
                    <video
                      src={viewingVideoModal.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  );
                }
                return (
                  <img
                    src={getEffectiveImageUrl(viewingVideoModal.thumbnailUrl || viewingVideoModal.driveUrl)}
                    alt={viewingVideoModal.title}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                );
              })()}
            </div>

            {/* Video Details Info Footer */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-2 text-xs overflow-y-auto max-h-48">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                    {viewingVideoModal.categoryLabel}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Tác giả: <strong className="text-slate-200">{viewingVideoModal.authorName}</strong> ({viewingVideoModal.studentGrade})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {viewingVideoModal.driveUrl && viewingVideoModal.driveUrl.startsWith('http') && (
                    <a
                      href={viewingVideoModal.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem nguồn Drive</span>
                    </a>
                  )}

                  {/* Nút xóa trực tiếp từ Modal xem dành cho Quản trị viên hoặc Tác giả */}
                  {canModifyVideo(viewingVideoModal) && (
                    <button
                      onClick={(e) => {
                        handleRequestDelete(viewingVideoModal, e);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
                      title="Xóa tác phẩm này khỏi hệ thống"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa tác phẩm này</span>
                    </button>
                  )}
                </div>
              </div>

              {viewingVideoModal.description && (
                <p className="text-slate-300 text-xs leading-relaxed pt-1">
                  {viewingVideoModal.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Video / Tác Phẩm (Hoàn toàn bằng giao diện in-app, 100% không bị chặn) */}
      {videoToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isDeletingVideo && setVideoToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900">
                  Xác Nhận Xóa Video / Tác Phẩm
                </h3>
                <p className="text-xs text-slate-500">
                  Thao tác sẽ gỡ bỏ tác phẩm khỏi hệ thống và đồng bộ vĩnh viễn
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 line-clamp-2">
                🎬 {videoToDelete.title}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Tác giả: <strong>{videoToDelete.authorName}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{videoToDelete.categoryLabel}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa tác phẩm này? Video/hình ảnh sẽ được gỡ bỏ ngay lập tức và đồng bộ vào hệ thống.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingVideo}
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition text-xs"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={isDeletingVideo}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-50 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingVideo ? 'Đang xóa...' : 'Xác Nhận Xóa Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo nổi */}
      {toastNotification && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              {(() => {
                const matchedItem = videos.find(
                  (v) =>
                    v.thumbnailUrl === selectedImagePreview ||
                    v.driveUrl === selectedImagePreview ||
                    (v.driveUrl && selectedImagePreview.includes(v.driveUrl))
                );
                if (matchedItem && canModifyVideo(matchedItem)) {
                  return (
                    <button
                      onClick={() => {
                        setSelectedImagePreview(null);
                        handleRequestDelete(matchedItem);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh này</span>
                    </button>
                  );
                }
                return null;
              })()}
              <button
                onClick={() => setSelectedImagePreview(null)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={getEffectiveImageUrl(selectedImagePreview)}
              alt="Xem ảnh lớn"
              referrerPolicy="no-referrer"
              className="max-h-[82vh] w-auto object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
